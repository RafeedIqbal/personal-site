// Local-only destructive fixtures. Never point this script at a hosted Supabase project.
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const config = JSON.parse(execFileSync("supabase", ["status", "-o", "json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }));
assert.match(config.API_URL, /^http:\/\/127\.0\.0\.1:/);
const db = createClient(config.API_URL, config.SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const users = [];
async function session() {
  const client = createClient(config.API_URL, config.PUBLISHABLE_KEY, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInAnonymously(); if (error) throw error;
  users.push(data.user.id); return { client, token: data.session.access_token, id: data.user.id };
}
async function api(user, action, payload = {}, expected = 200) {
  const response = await fetch(`${config.API_URL}/functions/v1/publicus-api`, { method: "POST", headers: { Authorization: `Bearer ${user.token}`, apikey: config.PUBLISHABLE_KEY, "Content-Type": "application/json", Origin: "http://localhost:3001" }, body: JSON.stringify({ action, ...payload }) });
  const text = await response.text(); assert.equal(response.status, expected, `${action}: ${text}`); return JSON.parse(text);
}
async function waitForJob(user, id) {
  for (let i = 0; i < 25; i++) { const next = await api(user, "get"); const job = next.runs.find((r) => r.id === id); if (job?.status === "complete") return next; if (job?.status === "failed") throw new Error(job.error); await new Promise((r) => setTimeout(r, 1000)); }
  throw new Error("Job did not complete within 25 seconds");
}
try {
  const a = await session(), b = await session();
  // A browser-supplied seed is ignored: the server builds the sample itself.
  const planted = { schema: 1, records: [], sources: [], answers: [{ question: "planted", recordIds: [], claims: [], mode: "live", generatedAt: "2026-01-01", fingerprint: "x" }] };
  const first = await api(a, "bootstrap", { seed: planted });
  assert.equal(first.workspace.answers.length, 0, "bootstrap must not store a client seed");
  assert.ok(first.workspace.records.length > 0);
  const second = await api(b, "bootstrap");
  assert.equal((await api(a, "runs")).runs.length, 0, "the runs poll returns only job status");
  assert.notEqual(first.workspace.id, second.workspace.id);
  assert.equal(first.aiEnabled, false, "run this check without a Gemini key");
  assert.equal((await b.client.from("publicus_workspaces").select("id").eq("id", first.workspace.id)).data.length, 0);
  assert.ok((await a.client.from("publicus_workspaces").update({ expires_at: "2099-01-01" }).eq("id", first.workspace.id)).error);
  assert.ok((await a.client.rpc("publicus_reserve", { p_scope: "malicious", p_limit: 10 })).error);
  console.log("PASS: anonymous isolation, read-only RLS, service-only quota RPC");
  await api(a, "patch", { patch: { saved: { cloud: "Qualified" }, notes: { cloud: "Check the addendum" } } });
  const changed = await api(a, "scenario", { scenario: "amendment" });
  assert.equal(changed.workspace.saved.cloud, "In review");
  assert.equal(changed.workspace.notes.cloud, "Check the addendum");
  const publicState = await api(a, "snapshot"); assert.equal(publicState.workspace.records.filter((r) => r.origin === "public").length, 10);
  await api(a, "enqueue", { kind: "ask", input: { recordId: "cloud", question: "Why?" } }, 503);
  console.log("PASS: durable decisions, changed-requirement invalidation, public snapshot, honest missing-AI response");
  const csv = new Blob(['title,buyer,reference,region,currency,amount,closingAt\nCloud migration test,Test Council,T-001,Ontario,CAD,150000,2026-12-01T14:00:00-05:00\n'], { type: "text/csv" });
  const signed = await api(a, "upload", { name: "integration.csv", size: csv.size });
  assert.equal((await a.client.storage.from("publicus-documents").uploadToSignedUrl(signed.path, signed.token, csv, { contentType: "text/csv" })).error, null);
  assert.ok((await b.client.storage.from("publicus-documents").download(signed.path)).error, "another anonymous session cannot read a file");
  await api(b, "enqueue", { kind: "file", input: { path: signed.path, name: "stolen.csv" } }, 400);
  const job = await api(a, "enqueue", { kind: "file", input: { path: signed.path, name: "integration.csv", recordKind: "tender" } }, 202);
  const done = await waitForJob(a, job.runId);
  const record = done.workspace.records.find((r) => r.reference === "T-001");
  assert.ok(record); assert.equal(record.needsReview, true);
  const duplicate = await api(a, "enqueue", { kind: "file", input: { path: signed.path, name: "integration.csv", recordKind: "tender" } });
  assert.equal(duplicate.runId, job.runId);
  const source = await api(a, "source", { sourceId: record.sourceId }); assert.ok(source.url.includes("token="));
  await api(b, "source", { sourceId: record.sourceId }, 404);
  const reviewed = await api(a, "review", { recordId: record.id }); assert.equal(reviewed.workspace.records.find((r) => r.id === record.id).needsReview, false);
  console.log("PASS: signed upload, private Storage isolation, queued extraction, idempotence, evidence URLs, field review");
  const liveJob = await api(a, "enqueue", { kind: "feed", input: { connector: "tenders" } }, 202);
  const live = await waitForJob(a, liveJob.runId);
  assert.ok(live.workspace.records.filter((r) => r.origin === "public").length > 10);
  assert.match(live.runs.find((r) => r.id === liveJob.runId).progress, /Bounded preview/);
  console.log("PASS: live CanadaBuys ingestion with original source rows and explicit partial coverage");
  const scope = `test:${crypto.randomUUID()}`;
  const reservations = await Promise.all(Array.from({ length: 8 }, () => db.rpc("publicus_reserve", { p_scope: scope, p_limit: 3 })));
  assert.equal(reservations.filter((r) => r.data).length, 3);
  await db.from("publicus_quota").delete().eq("scope", scope);
  const leaseJob = await db.from("publicus_runs").insert({ workspace_id: second.workspace.id, kind: "feed", input: { connector: "tenders" }, idempotency_key: "lease-test" }).select().single();
  const claim = await db.rpc("publicus_claim"); assert.equal(claim.data[0].id, leaseJob.data.id);
  const stale = await db.rpc("publicus_finish", { p_run: leaseJob.data.id, p_token: crypto.randomUUID(), p_records: [], p_sources: [], p_answer: null, p_progress: "Bad worker" }); assert.equal(stale.data, false);
  await db.from("publicus_runs").update({ lease_until: "2020-01-01" }).eq("id", leaseJob.data.id);
  const reclaimed = await db.rpc("publicus_claim"); assert.equal(reclaimed.data[0].attempts, 2); assert.notEqual(reclaimed.data[0].lease_token, claim.data[0].lease_token);
  await db.from("publicus_runs").delete().eq("id", leaseJob.data.id);
  console.log("PASS: concurrent quota cap, worker leases, stale-worker rejection and interrupted-job recovery");
  await api(a, "reset"); assert.equal((await db.storage.from("publicus-documents").list(`${a.id}/${first.workspace.id}`)).data.length, 0);
  const expiring = await api(a, "bootstrap");
  await db.from("publicus_workspaces").update({ expires_at: "2020-01-01" }).eq("id", expiring.workspace.id);
  await api(a, "reset");
  assert.equal((await db.from("publicus_workspaces").select("id").eq("id", expiring.workspace.id)).data.length, 0, "an expired workspace can still be explicitly reset");
  await db.from("publicus_workspaces").update({ expires_at: "2020-01-01" }).eq("id", second.workspace.id);
  assert.equal((await b.client.from("publicus_workspaces").select()).data.length, 0);
  await api(b, "get", {}, 410);
  const env = await readFile(new URL("../.env.publicus-functions", import.meta.url), "utf8");
  const secret = env.match(/^PUBLICUS_WORKER_SECRET=(.*)$/m)[1];
  const tick = await fetch(`${config.API_URL}/functions/v1/publicus-worker`, { method: "POST", headers: { "X-Worker-Secret": secret } }); assert.equal(tick.status, 202);
  for (let i = 0; i < 10; i++) { if (!(await db.from("publicus_workspaces").select("id").eq("id", second.workspace.id)).data.length) break; await new Promise((r) => setTimeout(r, 500)); }
  assert.equal((await db.from("publicus_workspaces").select("id").eq("id", second.workspace.id)).data.length, 0);
  console.log("PASS: reset removes original files, expired sessions are denied, worker cleanup removes expired workspaces");
} finally {
  for (const id of users) {
    const { data: workspace } = await db.from("publicus_workspaces").select("id").eq("owner_id", id).maybeSingle();
    if (workspace) { const prefix = `${id}/${workspace.id}`, files = await db.storage.from("publicus-documents").list(prefix); if (files.data?.length) await db.storage.from("publicus-documents").remove(files.data.map((f) => `${prefix}/${f.name}`)); }
    await db.auth.admin.deleteUser(id);
  }
}
