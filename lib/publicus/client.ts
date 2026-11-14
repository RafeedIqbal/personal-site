import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Run, Workspace } from "@/supabase/functions/_shared/domain";
import { initialWorkspace } from "./seed";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const backendConfigured = Boolean(url && key);
let client: SupabaseClient | undefined;
function supabase() {
  if (!url || !key) throw new Error("The private workspace is not connected yet. The sample demo is available below.");
  return client ??= createClient(url, key, { auth: { storageKey: "publicus-session", persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
}
export async function api<T>(action: string, payload: Record<string, unknown> = {}, retryAuth = true): Promise<T> {
  const db = supabase();
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
export type Session = { workspace: Workspace; aiEnabled: boolean; workerEnabled: boolean; runs: Run[] };
export const connectWorkspace = () => api<Session>("bootstrap", { seed: initialWorkspace() });
export const readWorkspace = () => api<Session>("get");
export async function upload(file: File) {
  const signed = await api<{ path: string; token: string }>("upload", { name: file.name, size: file.size });
  const type = file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : file.name.toLowerCase().endsWith(".csv") ? "text/csv" : "text/plain";
  const { error } = await supabase().storage.from("publicus-documents").uploadToSignedUrl(signed.path, signed.token, file, { contentType: type });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return signed.path;
}
export function downloadText(text: string, name: string, type = "text/markdown") {
  const url = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  const link = document.createElement("a"); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
