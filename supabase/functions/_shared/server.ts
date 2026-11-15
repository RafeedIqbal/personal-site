import { createClient } from "@supabase/supabase-js";
import type { Workspace } from "./domain.ts";
import { HttpError } from "./errors.ts";

export { HttpError, UserError } from "./errors.ts";
export const admin = () => createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false, autoRefreshToken: false } });
// A daily cap read from the environment, clamped so a typo can't remove the ceiling.
export const dailyLimit = (name: string, fallback: number, max: number) => Math.min(max, Math.max(1, Number(Deno.env.get(name)) || fallback));
export function cors(request: Request) {
  const origin = request.headers.get("origin") || "";
  const allowed = (Deno.env.get("ALLOWED_ORIGINS") || "http://localhost:3001").split(",").map((s) => s.trim());
  if (origin && !allowed.includes(origin)) throw new HttpError(403, "This origin is not configured for the demo.");
  return { "Access-Control-Allow-Origin": origin || allowed[0], "Vary": "Origin", "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info", "Access-Control-Allow-Methods": "POST, OPTIONS", "Cache-Control": "no-store" };
}
export function json(value: unknown, headers: Record<string, string>, status = 200) { return new Response(JSON.stringify(value), { status, headers: { ...headers, "Content-Type": "application/json" } }); }
export async function body(request: Request, limit = 1_000_000): Promise<Record<string, unknown>> {
  if (request.method !== "POST") throw new HttpError(405, "Use POST.");
  if (!request.body) throw new HttpError(400, "A JSON body is required.");
  const bytes = await readBounded(request.body, limit);
  try { const value = JSON.parse(new TextDecoder().decode(bytes)); if (!value || Array.isArray(value) || typeof value !== "object") throw 0; return value; }
  catch { throw new HttpError(400, "Invalid JSON body."); }
}
export async function readBounded(stream: ReadableStream<Uint8Array>, limit: number): Promise<Uint8Array> {
  const reader = stream.getReader(), chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) { const { value, done } = await reader.read(); if (done) break; size += value.length; if (size > limit) throw new HttpError(413, "The source exceeds the processing limit."); chunks.push(value); }
  } finally { await reader.cancel(); }
  const result = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { result.set(chunk, offset); offset += chunk.length; } return result;
}
export async function identity(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) throw new HttpError(401, "Create an anonymous workspace first.");
  const { data, error } = await admin().auth.getUser(token);
  if (error || !data.user) throw new HttpError(401, "The workspace session has expired.");
  return data.user;
}
export async function ownedWorkspace(owner: string) {
  const { data, error } = await admin().from("publicus_workspaces").select("*").eq("owner_id", owner).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (error) throw error;
  if (!data) throw new HttpError(410, "This seven-day workspace has expired. Reset to start again.");
  return data as { id: string; owner_id: string; expires_at: string; state: Workspace };
}
export async function reserve(scope: string, limit: number) {
  const { data, error } = await admin().rpc("publicus_reserve", { p_scope: scope, p_limit: limit });
  if (error) throw error;
  if (!data) throw new HttpError(429, "The demo's daily processing allowance has been reached. Try again tomorrow.");
}
export async function hash(value: string | Uint8Array): Promise<string> {
  const bytes = typeof value === "string" ? new TextEncoder().encode(value) : value;
  const digest = await crypto.subtle.digest("SHA-256", bytes as BufferSource);
  return Array.from(new Uint8Array(digest), (n) => n.toString(16).padStart(2, "0")).join("");
}
export function aiEnabled() { return Boolean(Deno.env.get("GEMINI_API_KEY")); }
export async function wakeWorker() {
  const secret = Deno.env.get("PUBLICUS_WORKER_SECRET");
  if (!secret) return; // The durable job remains queued until the scheduled worker is configured.
  try { await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/publicus-worker`, { method: "POST", headers: { "Content-Type": "application/json", "X-Worker-Secret": secret }, body: "{}", signal: AbortSignal.timeout(10_000) }); } catch { /* A timed-out HTTP request is not a job failure; cron resumes queued work. */ }
}
export async function purgeWorkspace(id: string, owner: string) {
  const db = admin(), prefix = `${owner}/${id}`;
  // Storage objects must be removed with Storage API before deleting the DB row.
  while (true) {
    const { data, error } = await db.storage.from("publicus-documents").list(prefix, { limit: 100 });
    if (error) throw error;
    if (!data?.length) break;
    const removed = await db.storage.from("publicus-documents").remove(data.map((file) => `${prefix}/${file.name}`));
    if (removed.error) throw removed.error;
  }
  const { error } = await db.from("publicus_workspaces").delete().eq("id", id).eq("owner_id", owner);
  if (error) throw error;
}
