import Papa from "papaparse";
import { extractText, getDocumentProxy } from "unpdf";
import { admin, hash, HttpError, json, purgeWorkspace, readBounded, UserError } from "../_shared/server.ts";
import { CONNECTORS, csvPrefix } from "../_shared/connectors.ts";
import { ask, extractionPrompt, extractionSchema, GeminiError, generate } from "../_shared/gemini.ts";
import { contracts, CSV_FIELDS, inferMapping, inferTags, normalize, normalizeCsvRow, safeUrl, sourceDate } from "../_shared/domain.ts";
import type { Answer, ColumnMapping, ProcurementRecord, RecordKind, Source, Workspace } from "../_shared/domain.ts";

type Job = { id: string; workspace_id: string; lease_token: string; attempts: number; kind: "feed" | "file" | "ask"; input: Record<string, unknown> };

function utf8(bytes: Uint8Array) {
  try { return new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
  catch { throw new UserError("The file is not valid UTF-8 text. Save it as UTF-8 and upload it again."); }
}
async function csvRecords(text: string, name: string, origin: "public" | "upload", kind: RecordKind, options: { url?: string; path?: string; mapping?: ColumnMapping } = {}) {
  const parsed = Papa.parse<Record<string, string>>(text, { header: true, skipEmptyLines: true, preview: 120 });
  if (parsed.errors.some((e: { code: string }) => ["MissingQuotes", "UndetectableDelimiter"].includes(e.code))) throw new UserError("CSV is malformed. Check quotes and delimiters.");
  const fields = parsed.meta.fields || [];
  // A mapping only names columns this file actually has, so a value like "__proto__" never indexes a row.
  const mapping: ColumnMapping = options.mapping
    ? Object.fromEntries(Object.entries(options.mapping).filter(([field, column]) => (CSV_FIELDS as readonly string[]).includes(field) && typeof column === "string" && fields.includes(column)))
    : inferMapping(fields);
  if (!mapping.title || !parsed.meta.fields?.includes(mapping.title)) throw new UserError("Map a title column before importing this CSV.");
  const records: ProcurementRecord[] = [], sources: Source[] = [];
  for (const [index, row] of parsed.data.entries()) {
    const retained = Object.fromEntries(Object.entries(row).filter(([key, value]) => value && !/contact|email|telephone|fax|address|postal|zip|street/i.test(key)));
    const raw = Object.entries(retained).map(([key, value]) => `${key}: ${value}`).join("\n");
    if (raw.length > 120_000) throw new UserError("A CSV record exceeds the text limit.");
    const checksum = await hash(raw);
    const source: Source = { id: `${origin}-${checksum.slice(0, 24)}`, name: `${name} · row ${index + 2}`, format: "csv", origin, text: raw, row: index + 2, capturedAt: new Date().toISOString(), url: options.url, noticeUrl: safeUrl(row["noticeURL-URLavis-eng"] || row["noticeURL-URLavis-fra"]), storagePath: options.path, checksum };
    const record = normalizeCsvRow(row, mapping, source, 0, kind);
    if (record) { records.push(record); sources.push(source); }
  }
  if (!records.length) throw new UserError("No rows with a title were found.");
  return { records, sources, progress: `Imported ${records.length} records. Bounded preview: up to 120 source rows; not the complete dataset.` };
}
async function process(job: Job) {
  const db = admin();
  const { data, error } = await db.from("publicus_workspaces").select("*").eq("id", job.workspace_id).gt("expires_at", new Date().toISOString()).single();
  if (error) throw error;
  const workspace = data.state as Workspace;
  let records: ProcurementRecord[] = [], sources: Source[] = [], answer: Answer | null = null, progress = "Complete";
  if (job.kind === "feed") {
    const connector = CONNECTORS[job.input.connector as keyof typeof CONNECTORS];
    if (!connector) throw new UserError("Unknown connector");
    const response = await fetch(connector.url, { redirect: "error", signal: AbortSignal.timeout(30_000) });
    if (!response.ok || !response.body) throw new UserError(`The public source returned ${response.status}. Try again later.`);
    const reader = response.body.getReader(), decoder = new TextDecoder(); let text = "", length = 0, prefix;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) { text += decoder.decode(); break; }
        length += value.length; if (length > 8 * 1024 * 1024) throw new UserError("Feed prefix exceeds 8 MB. Use a smaller CSV upload.");
        text += decoder.decode(value, { stream: true }); prefix = csvPrefix(text, 120);
        if (prefix.complete) { text = prefix.text; break; }
      }
    } finally { await reader.cancel(); }
    ({ records, sources, progress } = await csvRecords(text, connector.name, "public", connector.kind, { url: connector.url }));
  }
  if (job.kind === "file") {
    const path = String(job.input.path);
    if (!path.startsWith(`${data.owner_id}/${data.id}/`)) throw new UserError("Upload does not belong to this workspace.");
    const downloaded = await db.storage.from("publicus-documents").download(path);
    if (downloaded.error || !downloaded.data) throw new UserError("Upload could not be read. Upload the document again.");
    const bytes = await readBounded(downloaded.data.stream(), 10 * 1024 * 1024), checksum = await hash(bytes);
    const name = String(job.input.name || "Uploaded document").slice(0, 160);
    if (path.endsWith(".csv")) {
      ({ records, sources, progress } = await csvRecords(utf8(bytes), name, "upload", job.input.recordKind === "award" ? "award" : "tender", { path, mapping: job.input.mapping as ColumnMapping }));
    } else {
      let text = "", pages: string[] | undefined;
      if (path.endsWith(".pdf")) {
        if (!new TextDecoder().decode(bytes.slice(0, 5)).startsWith("%PDF-")) throw new UserError("The file is not a valid PDF.");
        const pdf = await getDocumentProxy(bytes);
        try {
          if (pdf.numPages > 50) throw new UserError("PDFs are limited to 50 pages. Upload the relevant section.");
          const extracted = await extractText(pdf, { mergePages: false }); pages = extracted.text; text = pages.join("\n\n");
        } finally { await pdf.loadingTask.destroy(); }
        if (text.trim().length < 40) throw new UserError("This PDF has no readable text. Scanned PDFs need OCR before upload.");
      } else text = utf8(bytes);
      if (!text.trim() || text.length > 120_000) throw new UserError("Documents need readable text and must be under 120,000 characters.");
      const source: Source = { id: `upload-${checksum.slice(0, 24)}`, name, origin: "upload", format: path.endsWith(".pdf") ? "pdf" : "text", capturedAt: new Date().toISOString(), text, pages, checksum, storagePath: path };
      const value = await generate(data.owner_id, extractionPrompt(text), extractionSchema) as Record<string, unknown>;
      const get = (field: string, limit = 1000) => typeof value[field] === "string" ? (value[field] as string).slice(0, limit) : "";
      if (!get("title")) throw new UserError("No procurement notice was identified. Nothing was added.");
      const amount = (field: string) => typeof value[field] === "number" && Number.isFinite(value[field]) ? value[field] as number : null;
      const kind = ["tender", "award", "amendment"].includes(get("kind")) ? get("kind") as RecordKind : "tender";
      records = [{ id: `${source.id}:record`, sourceId: source.id, origin: "upload", kind, title: get("title", 300), buyer: get("buyer") || "Buyer not stated", reference: get("reference"), contractId: get("contractId") || undefined, supplier: get("supplier") || undefined, category: get("category") || "Unclassified", region: get("region") || "Not stated", tags: inferTags(`${get("title")} ${get("description")}`), description: get("description", 4000), publishedAt: sourceDate(get("publishedAt")), closingAt: sourceDate(get("closingAt")), endDate: sourceDate(get("endDate")), currency: get("currency", 3).toUpperCase(), amount: amount("amount"), totalValue: amount("totalValue"), amendment: get("amendment") || "0", status: kind === "tender" ? "unknown" : "awarded", needsReview: true,
        requirements: (Array.isArray(value.requirements) ? value.requirements : []).slice(0, 20).flatMap((r) => typeof r.text === "string" && typeof r.qualification === "string" && typeof r.quote === "string" && r.quote.length >= 6 && normalize(text).includes(normalize(r.quote)) ? [{ text: r.text.slice(0, 1000), qualification: r.qualification.slice(0, 100), quote: r.quote.slice(0, 1500), sourceId: source.id }] : []),
      }];
      sources = [source]; progress = "Extracted one document. Review the source before relying on its fields.";
    }
  }
  if (job.kind === "ask") {
    const record = workspace.records.find((r) => r.id === job.input.recordId);
    if (!record) throw new UserError("The selected record no longer exists.");
    const related = record.kind === "tender" ? [record] : contracts(workspace.records, workspace.asOf).find((c) => c.versions.some((r) => r.id === record.id))!.versions;
    const ids = new Set(related.flatMap((r) => [r.sourceId, ...r.requirements.map((q) => q.sourceId)]));
    const evidence = workspace.sources.filter((s) => ids.has(s.id)).slice(0, 8);
    if (!evidence.length) throw new UserError("No supporting source is available. Restore the source before asking AI.");
    answer = await ask(data.owner_id, String(job.input.question), related.slice(0, 12), evidence, workspace);
    progress = "Answer saved with checked source quotations. Review the interpretation.";
  }
  const finished = await db.rpc("publicus_finish", { p_run: job.id, p_token: job.lease_token, p_records: records, p_sources: sources, p_answer: answer, p_progress: progress });
  if (finished.error) throw /record limit/i.test(finished.error.message) ? new UserError("Workspace record limit reached; reset the workspace to import more.") : finished.error;
  if (!finished.data) throw new UserError("Worker lease expired; the durable queue will retry.");
}
async function work() {
  const db = admin();
  // Keep operational counters bounded; today's counters survive reset to prevent quota bypass.
  await db.from("publicus_quota").delete().lt("day", new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10));
  // Cleanup is bounded and retried on the next tick if Storage is unavailable.
  const expired = await db.from("publicus_workspaces").select("id,owner_id").lte("expires_at", new Date().toISOString()).limit(5);
  for (const workspace of expired.data || []) {
    await purgeWorkspace(workspace.id, workspace.owner_id);
    const user = await db.auth.admin.getUserById(workspace.owner_id);
    if (user.data.user?.is_anonymous) await db.auth.admin.deleteUser(workspace.owner_id);
  }
  // Help-chat visitors sign in anonymously without a workspace, so the purge above never reaches them.
  const anonymous = await db.rpc("publicus_purge_anonymous", { p_limit: 100 });
  if (anonymous.error) console.error("Anonymous user cleanup failed", anonymous.error.message);
  const claimed = await db.rpc("publicus_claim");
  if (claimed.error) throw claimed.error;
  const job = claimed.data?.[0] as Job | undefined;
  if (!job) return;
  try { await process(job); }
  catch (error) {
    // Only authored messages reach the visitor; database, parser and runtime errors stay in the logs.
    const shown = error instanceof UserError || error instanceof HttpError || error instanceof GeminiError;
    if (!shown) console.error("Publicus job failed", error instanceof Error ? error.message : "unknown");
    const message = shown ? (error as Error).message.slice(0, 250) : "Processing failed. Retry the job.";
    await db.from("publicus_runs").update({ status: "failed", error: message, progress: "Needs attention", lease_until: null }).eq("id", job.id).eq("lease_token", job.lease_token);
  }
}
Deno.serve(async (request: Request) => {
  try {
    const secret = Deno.env.get("PUBLICUS_WORKER_SECRET"), provided = request.headers.get("X-Worker-Secret");
    if (!secret || !provided || await hash(secret) !== await hash(provided)) throw new HttpError(401, "Worker authentication required.");
    if (request.method !== "POST") throw new HttpError(405, "Use POST.");
    EdgeRuntime.waitUntil(work());
    return json({ accepted: true }, {}, 202);
  } catch (error) { return json({ error: error instanceof Error ? error.message : "Worker failed" }, {}, error instanceof HttpError ? error.status : 500); }
});
declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };
