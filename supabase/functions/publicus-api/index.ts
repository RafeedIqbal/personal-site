import { admin, aiEnabled, body, cors, hash, HttpError, identity, json, ownedWorkspace, purgeWorkspace, reserve, wakeWorker } from "../_shared/server.ts";
import { CONNECTORS } from "../_shared/connectors.ts";
import { CAPABILITIES, QUALIFICATIONS, REGIONS, fingerprint, matchRecord } from "../_shared/domain.ts";
import type { Workspace } from "../_shared/domain.ts";
import { applyScenario } from "../_shared/fixtures.ts";
import publicSnapshot from "../../../lib/publicus/public-records.json" with { type: "json" };

Deno.serve(async (request: Request) => {
  let headers: Record<string, string> = {};
  try {
    headers = cors(request);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    const user = await identity(request), input = await body(request), db = admin();
    if (input.action === "bootstrap") {
      const { data: existing, error: existingError } = await db.from("publicus_workspaces").select("id,expires_at").eq("owner_id", user.id).maybeSingle();
      if (existingError) throw existingError;
      if (existing && Date.parse(existing.expires_at) <= Date.now()) await purgeWorkspace(existing.id, user.id);
      if (!existing || Date.parse(existing.expires_at) <= Date.now()) {
        const seed = input.seed as Workspace;
        if (!seed || seed.schema !== 1 || !Array.isArray(seed.records) || !Array.isArray(seed.sources) || seed.records.length > 30 || seed.sources.length > 35 || JSON.stringify(seed).length > 150_000) throw new HttpError(400, "Invalid sample workspace.");
        // Bootstrap only accepts the prepared sample. Uploaded objects cannot be injected here.
        if (seed.records.some((r) => r.origin !== "sample") || seed.sources.some((s) => s.origin !== "sample" || s.storagePath)) throw new HttpError(400, "Bootstrap requires sample records.");
        const { error } = await db.from("publicus_workspaces").upsert({ owner_id: user.id, state: seed }, { onConflict: "owner_id", ignoreDuplicates: true });
        if (error) throw error;
      }
    }
    if (input.action === "reset") {
      const { data, error } = await db.from("publicus_workspaces").select("id").eq("owner_id", user.id).maybeSingle();
      if (error) throw error;
      if (data) await purgeWorkspace(data.id, user.id);
      return json({ ok: true }, headers);
    }
    const workspace = await ownedWorkspace(user.id);
    const result = () => ({ workspace: { ...workspace.state, id: workspace.id, expiresAt: workspace.expires_at }, aiEnabled: aiEnabled(), workerEnabled: Boolean(Deno.env.get("PUBLICUS_WORKER_SECRET")) });
    if (input.action === "bootstrap" || input.action === "get") {
      const { data: runs, error } = await db.from("publicus_runs").select("id,status,progress,error,attempts,created_at").eq("workspace_id", workspace.id).order("created_at", { ascending: false }).limit(15);
      if (error) throw error;
      return json({ ...result(), runs }, headers);
    }
    if (input.action === "patch") {
      const patch = input.patch as Partial<Workspace>;
      if (!patch || Object.keys(patch).some((key) => !["profile", "saved", "notes", "reviewed"].includes(key))) throw new HttpError(400, "Unsupported workspace change.");
      if (JSON.stringify(patch).length > 60_000) throw new HttpError(413, "Workspace notes are too large.");
      const profile = patch.profile || workspace.state.profile;
      if (typeof profile.name !== "string" || profile.name.length > 100 || !Number.isFinite(profile.maxValue) || profile.maxValue < 0 || profile.maxValue > 1e10 ||
        ![profile.capabilities, profile.regions, profile.qualifications].every(Array.isArray) ||
        profile.capabilities.some((s) => !CAPABILITIES.includes(s)) || profile.regions.some((s) => !REGIONS.includes(s)) || profile.qualifications.some((s) => !QUALIFICATIONS.includes(s))) throw new HttpError(400, "Invalid vendor profile.");
      if (patch.notes && Object.values(patch.notes).some((v) => typeof v !== "string" || v.length > 2000)) throw new HttpError(400, "Notes must be under 2,000 characters.");
      if (patch.reviewed && Object.values(patch.reviewed).some((v) => typeof v !== "boolean")) throw new HttpError(400, "Invalid review state.");
      const saved = { ...(patch.saved || workspace.state.saved) };
      for (const [id, stage] of Object.entries(saved)) {
        const record = workspace.state.records.find((r) => r.id === id && r.kind === "tender");
        if (!record || !["Saved", "In review", "Qualified"].includes(stage)) throw new HttpError(400, "Invalid saved opportunity.");
        if (stage === "Qualified" && !matchRecord(record, profile, record.origin === "sample" ? workspace.state.asOf : new Date().toISOString()).canQualify) saved[id] = "In review";
      }
      const { error } = await db.rpc("publicus_patch", { p_id: workspace.id, p_patch: { ...patch, saved } });
      if (error) throw error;
      return json({ ok: true }, headers);
    }
    if (input.action === "scenario" || input.action === "snapshot" || input.action === "review") {
      if (input.action === "scenario" && !["baseline", "amendment", "conflict", "missing"].includes(String(input.scenario))) throw new HttpError(400, "Unknown scenario.");
      const prepared = input.action === "scenario" ? applyScenario(workspace.state, String(input.scenario)) : null;
      const changed = await db.rpc("publicus_edit", { p_id: workspace.id,
        p_samples: prepared ? { records: prepared.records.filter((r) => r.origin === "sample"), sources: prepared.sources.filter((s) => s.origin === "sample"), scenario: input.scenario } : null,
        p_snapshot: input.action === "snapshot" ? publicSnapshot : null,
        p_review: input.action === "review" ? String(input.recordId) : null,
      });
      if (changed.error) throw changed.error;
      return json({ workspace: { ...changed.data, id: workspace.id, expiresAt: workspace.expires_at } }, headers);
    }
    if (input.action === "upload") {
      if (!Number.isInteger(input.size) || Number(input.size) <= 0 || Number(input.size) > 10 * 1024 * 1024 || typeof input.name !== "string" || !/\.(pdf|csv|txt)$/i.test(input.name)) throw new HttpError(400, "Use a PDF, CSV or TXT file under 10 MB.");
      await reserve(`upload:${user.id}`, 10);
      const extension = input.name.split(".").pop()!.toLowerCase();
      const path = `${user.id}/${workspace.id}/${crypto.randomUUID()}.${extension}`;
      const { data, error } = await db.storage.from("publicus-documents").createSignedUploadUrl(path);
      if (error) throw error;
      return json({ path, token: data.token }, headers);
    }
    if (input.action === "source") {
      const source = workspace.state.sources.find((s) => s.id === input.sourceId);
      if (!source?.storagePath?.startsWith(`${user.id}/${workspace.id}/`)) throw new HttpError(404, "Original upload not available.");
      const { data, error } = await db.storage.from("publicus-documents").createSignedUrl(source.storagePath, 60);
      if (error) throw error;
      return json({ url: data.signedUrl }, headers);
    }
    if (input.action === "enqueue") {
      const kind = String(input.kind);
      const payload = input.input as Record<string, unknown>;
      if (!payload || !["feed", "file", "ask"].includes(kind)) throw new HttpError(400, "Unknown job.");
      if (!Deno.env.get("PUBLICUS_WORKER_SECRET")) throw new HttpError(503, "The background worker is not configured yet.");
      if (kind === "feed" && !Object.hasOwn(CONNECTORS, String(payload.connector))) throw new HttpError(400, "Unknown source connector.");
      if (kind === "file" && (typeof payload.path !== "string" || !payload.path.startsWith(`${user.id}/${workspace.id}/`) || payload.path.slice(`${user.id}/${workspace.id}/`.length).includes("/"))) throw new HttpError(400, "Invalid upload path.");
      if (kind === "ask" && (typeof payload.question !== "string" || !payload.question.trim() || payload.question.length > 1000 || !workspace.state.records.some((r) => r.id === payload.recordId))) throw new HttpError(400, "Choose a record and ask a question under 1,000 characters.");
      if ((kind === "ask" || (kind === "file" && !String(payload.path).endsWith(".csv"))) && !aiEnabled()) throw new HttpError(503, "Gemini is not connected yet. CSV imports and public feeds work without AI.");
      const key = await hash(JSON.stringify([kind, payload, kind === "ask" ? fingerprint(workspace.state.records, workspace.state.profile) : kind === "feed" ? new Date().toISOString().slice(0, 10) : null]));
      const { data: duplicate, error: lookupError } = await db.from("publicus_runs").select("id,status").eq("workspace_id", workspace.id).eq("idempotency_key", key).maybeSingle();
      if (lookupError) throw lookupError;
      if (duplicate) return json({ runId: duplicate.id, status: duplicate.status }, headers);
      await reserve(`jobs:${user.id}`, 25);
      const { data, error } = await db.from("publicus_runs").insert({ workspace_id: workspace.id, kind, input: payload, idempotency_key: key }).select("id").single();
      if (error) throw error;
      // Durable insertion happens before the best-effort wake-up. Cron recovers interrupted workers.
      EdgeRuntime.waitUntil(wakeWorker());
      return json({ runId: data.id, status: "queued" }, headers, 202);
    }
    if (input.action === "retry") {
      await reserve(`jobs:${user.id}`, 25);
      const { data, error } = await db.from("publicus_runs").update({ status: "queued", attempts: 0, error: null, progress: "Retry queued" }).eq("id", input.runId).eq("workspace_id", workspace.id).eq("status", "failed").select("id").maybeSingle();
      if (error) throw error;
      if (!data) throw new HttpError(409, "Only failed jobs can be retried.");
      EdgeRuntime.waitUntil(wakeWorker());
      return json({ ok: true }, headers);
    }
    throw new HttpError(400, "Unknown action.");
  } catch (error) {
    const known = error instanceof HttpError;
    if (!known) console.error("Publicus API failure", error instanceof Error ? error.message : "unknown");
    return json({ error: known ? error.message : "The workspace could not be updated. Please retry." }, headers, known ? error.status : 500);
  }
});

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void };
