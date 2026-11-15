// Which Gemini model each path uses, and the rule that picked it. No runtime imports, so the
// Edge Functions, the eval, the page and the Node tests all read the same values.
// `npm run eval:publicus` rewrites CHAT and DEMO from lib/publicus/model-evals.json.

export type Setting = { model: string; thinking: string; timeoutMs: number };
export type TaskResult = { model: string; thinking: string; accuracy: number; medianMs: number | null; p90Ms: number | null; errorRate: number; costPer1k: number | null; calls: number };

// eval-picks:start
export const CHAT: Setting = { model: "gemini-3.6-flash", thinking: "minimal", timeoutMs: 30_000 };
export const DEMO: Setting = { model: "gemini-3.6-flash", thinking: "minimal", timeoutMs: 60_000 };
// eval-picks:end

export const ACCURACY_MARGIN = 0.05;
export const MAX_ERROR_RATE = 0.05;
export const SPEED_TIE = 1.1;

// Accurate = within 5 points of the best accuracy on the task, with at most 5% failed calls.
// The fastest accurate setting wins; settings within 10% of its median time count as a tie,
// and a tie goes to the cheapest (an unpublished price never wins a tie).
export function pickModel(results: TaskResult[]): TaskResult | undefined {
  if (!results.length) return;
  const best = Math.max(...results.map((r) => r.accuracy));
  const accurate = results.filter((r) => r.medianMs !== null && r.errorRate <= MAX_ERROR_RATE && r.accuracy >= best - ACCURACY_MARGIN - 1e-9);
  if (!accurate.length) return;
  const fastest = Math.min(...accurate.map((r) => r.medianMs!));
  return accurate
    .filter((r) => r.medianMs! <= fastest * SPEED_TIE)
    .sort((a, b) => (a.costPer1k ?? Infinity) - (b.costPer1k ?? Infinity) || a.medianMs! - b.medianMs!)[0];
}

// "gemini-3.5-flash-lite" → "Gemini 3.5 Flash Lite"
export const modelLabel = (id: string) => id.replace(/^gemini-/, "Gemini ").split("-").map((part) => part.replace(/^[a-z]/, (c) => c.toUpperCase())).join(" ");
