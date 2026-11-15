import type { ExplorerContext } from "@/supabase/functions/_shared/assistant";

// The explorer publishes what the visitor is looking at; the help chat reads it with useSyncExternalStore.
let current: ExplorerContext | undefined;
const listeners = new Set<() => void>();
export function setExplorerContext(next: ExplorerContext) {
  if (JSON.stringify(next) === JSON.stringify(current)) return;
  current = next;
  listeners.forEach((listener) => listener());
}
export const getExplorerContext = () => current;
export function subscribeExplorerContext(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
