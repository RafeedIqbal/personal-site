import type { SupabaseClient } from "@supabase/supabase-js";
import type { Run, Workspace } from "@/supabase/functions/_shared/domain";
import type { ExplorerContext, Reply, Turn } from "@/supabase/functions/_shared/assistant";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const backendConfigured = Boolean(url && key);
let client: Promise<SupabaseClient> | undefined;
// supabase-js (about 100 KB gzipped) loads only when a visitor starts a workspace or asks the chat.
async function supabase() {
  if (!url || !key) throw new Error("The private workspace is not connected yet. The sample demo is available below.");
  return client ??= import("@supabase/supabase-js")
    .then(({ createClient }) => createClient(url, key, { auth: { storageKey: "publicus-session", persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } }))
    .catch((error) => { client = undefined; throw error; });
}
export async function api<T>(action: string, payload: Record<string, unknown> = {}, retryAuth = true): Promise<T> {
  const db = await supabase();
  const { data: auth } = await db.auth.getSession();
  if (!auth.session) {
    const { error } = await db.auth.signInAnonymously();
    if (error) throw new Error(`The private workspace could not start: ${error.message}`);
  }
  const { data, error } = await db.functions.invoke("publicus-api", { body: { action, ...payload } });
  if (error) {
    const response = error.context as Response | undefined;
    if (response?.status === 401 && retryAuth && (action === "bootstrap" || action === "reset")) {
      // A seven-day cleanup may remove the anonymous identity while its browser JWT remains cached.
      await db.auth.signOut({ scope: "local" });
      return api<T>(action, payload, false);
    }
    const body = response && typeof response.json === "function" ? await response.json().catch(() => null) : null;
    throw new Error(body?.error || "The workspace could not connect. Please retry.");
  }
  return data as T;
}
export class ChatError extends Error { constructor(public status: number, message: string) { super(message); } }
// The help chat shares the explorer's anonymous session, so its daily quota follows the visitor.
export async function chat(payload: { question: string; history: Turn[]; context?: ExplorerContext }, retryAuth = true): Promise<Reply> {
  const db = await supabase();
  const { data: auth } = await db.auth.getSession();
  if (!auth.session) {
    const { error } = await db.auth.signInAnonymously();
    if (error) throw new ChatError(503, error.message);
  }
  const { data, error } = await db.functions.invoke("publicus-chat", { body: payload });
  if (!error) return data as Reply;
  const response = error.context as Response | undefined;
  if (response?.status === 401 && retryAuth) { await db.auth.signOut({ scope: "local" }); return chat(payload, false); }
  const body = response && typeof response.json === "function" ? await response.json().catch(() => null) : null;
  throw new ChatError(response?.status || 503, body?.error || "The chat couldn’t connect.");
}
export type Session = { workspace: Workspace; aiEnabled: boolean; workerEnabled: boolean; runs: Run[] };
// The server builds the sample workspace itself, so bootstrap sends no seed.
export const connectWorkspace = () => api<Session>("bootstrap");
export const readWorkspace = () => api<Session>("get");
export const readRuns = () => api<{ runs: Run[] }>("runs");
export async function upload(file: File) {
  const signed = await api<{ path: string; token: string }>("upload", { name: file.name, size: file.size });
  const type = file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : file.name.toLowerCase().endsWith(".csv") ? "text/csv" : "text/plain";
  const { error } = await (await supabase()).storage.from("publicus-documents").uploadToSignedUrl(signed.path, signed.token, file, { contentType: type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return signed.path;
}
// Signed links come back from the API; only follow ones that point at this project's Supabase origin.
export function backendUrl(value: unknown): string | null {
  if (!url || typeof value !== "string") return null;
  try {
    const target = new URL(value);
    return target.origin === new URL(url).origin ? target.href : null;
  } catch {
    return null;
  }
}
export function downloadText(text: string, name: string, type = "text/markdown") {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const link = document.createElement("a"); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
