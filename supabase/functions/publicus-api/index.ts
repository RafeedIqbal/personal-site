import { admin, aiEnabled, body, cors, dailyLimit, hash, HttpError, identity, json, ownedWorkspace, purgeWorkspace, reserve, wakeWorker } from "../_shared/server.ts";
import { CONNECTORS } from "../_shared/connectors.ts";
import { fingerprint, matchRecord } from "../_shared/domain.ts";
import { applyScenario, initialWorkspace } from "../_shared/fixtures.ts";
import { readJob, readPatch } from "../_shared/validate.ts";
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
        // The server builds the sample itself; any seed the browser sends is ignored.
        const { error } = await db.from("publicus_workspaces").upsert({ owner_id: user.id, state: initialWorkspace() }, { onConflict: "owner_id", ignoreDuplicates: true });
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
    const result = (current = workspace) => ({ workspace: { ...current.state, id: current.id, expiresAt: current.expires_at }, aiEnabled: aiEnabled(), workerEnabled: Boolean(Deno.env.get("PUBLICUS_WORKER_SECRET")) });
    if (input.action === "runs") {
      // Cheap poll while jobs run; the browser fetches the full workspace only when one finishes.
      const { data: runs, error } = await db.from("publicus_runs").select("id,status,progress,error,attempts,created_at").eq("workspace_id", workspace.id).order("created_at", { ascending: false }).limit(15);
      if (error) throw error;
      return json({ runs }, headers);
    }
    if (input.action === "bootstrap" || input.action === "get") {
      const { data: runs, error } = await db.from("publicus_runs").select("id,status,progress,error,attempts,created_at").eq("workspace_id", workspace.id).order("created_at", { ascending: false }).limit(15);
      if (error) throw error;
      // Read state after job status. A completed job must include its committed
      // result, otherwise the browser could stop polling with an older snapshot.
      return json({ ...result(await ownedWorkspace(user.id)), runs }, headers);
    }
    if (input.action === "patch") {
      const patch = readPatch(input.patch);
      const profile = patch.profile || workspace.state.profile;
      const saved = { ...(patch.saved || workspace.state.saved) };
      for (const [id, stage] of Object.entries(saved)) {
        const record = workspace.state.records.find((r) => r.id === id && r.kind === "tender");
        if (!record) throw new HttpError(400, "Invalid saved opportunity.");
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
      // Files stay for up to seven days, so storage growth needs a ceiling across all visitors too.
      await reserve("upload:global", dailyLimit("PUBLICUS_UPLOAD_DAILY_LIMIT", 50, 500));
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
      const { kind, input: payload } = readJob(input.kind, input.input, { uploadPrefix: `${user.id}/${workspace.id}/`, recordIds: workspace.state.records.map((r) => r.id), connectors: Object.keys(CONNECTORS) });
      if (!Deno.env.get("PUBLICUS_WORKER_SECRET")) throw new HttpError(503, "The background worker is not configured yet.");
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
