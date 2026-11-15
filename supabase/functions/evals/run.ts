// Runs every eval case against every current Gemini text model and writes:
//   lib/publicus/model-evals.json   the summary the page and tests read
//   output/evals/<date>.jsonl       one line per call (ignored by Git)
// and rewrites the EVAL_CHAT/EVAL_DEMO picks in _shared/models.ts with pickModel().
// Usage: npm run eval:publicus  (needs GEMINI_API_KEY; calls the paid API, no quota reserved)
import { callGemini, GeminiError, type Usage } from "../_shared/gemini.ts";
import { pickModel, type TaskResult } from "../_shared/models.ts";
import { CASES, type Case, type Task } from "./cases.ts";

const MODELS = ["gemini-4-argon", "gemini-4-carbon", "gemini-4-hydrogen", "gemini-3.1-pro-preview", "gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.1-flash-lite", "gemini-omni-1.2-flash"];
const THINKING = ["low", "minimal"];
const RUNS = Number(Deno.env.get("EVAL_RUNS")) || 2, PARALLEL = Number(Deno.env.get("EVAL_PARALLEL")) || 10, TIMEOUT_MS = 90_000;
const DRY = Deno.env.get("EVAL_DRY") === "1"; // print results without writing files
// Standard paid tier, USD per 1M tokens, text in and text out (thinking is billed as output).
// Copied from Google AI Studio's pricing page on 15 November 2026; null = not published there.
const PRICES_CAPTURED = "2026-11-15";
const PRICES: Record<string, { input: number; output: number } | null> = {
  "gemini-4-argon": { input: 2, output: 10 }, "gemini-4-carbon": { input: 2, output: 10 }, "gemini-4-hydrogen": { input: 1.5, output: 7.5 },
  "gemini-3.1-pro-preview": { input: 2, output: 12 }, "gemini-3.8-flash": { input: 0.75, output: 3.75 }, "gemini-3.7-flash": null,
  "gemini-3.6-flash": { input: 0.75, output: 3.75 }, "gemini-3.5-flash": null, "gemini-3.5-flash-lite": { input: 0.3, output: 2.5 },
  "gemini-3.1-flash-lite": { input: 0.25, output: 1.5 }, "gemini-omni-1.2-flash": { input: 1.5, output: 9 },
};
const only = Deno.env.get("EVAL_MODELS")?.split(",").filter(Boolean);

type Call = { model: string; thinking: string; task: Task; kind: string; case: string; run: number; ms: number; ok: boolean; pass: boolean; notes: string[]; usage?: Usage; error?: string; status?: number };
const cost = (model: string, usage?: Usage) => { const p = PRICES[model]; return p && usage ? (usage.input * p.input + (usage.output + usage.thought) * p.output) / 1e6 : null; };

async function attempt(model: string, thinking: string, c: Case, run: number): Promise<Call> {
  const t0 = performance.now();
  const base = { model, thinking, task: c.task, kind: c.kind, case: c.id, run };
  try {
    const { value, usage } = await callGemini(c.input, c.schema, { model, thinking, system: c.system, maxTokens: c.maxTokens, timeoutMs: TIMEOUT_MS });
    const score = c.score(value);
    return { ...base, ms: Math.round(performance.now() - t0), ok: true, pass: score.pass, notes: score.notes, usage };
  } catch (error) {
    return { ...base, ms: Math.round(performance.now() - t0), ok: false, pass: false, notes: [], error: String((error as Error).message ?? error).slice(0, 200), status: error instanceof GeminiError ? error.status : undefined };
  }
}

async function pool<T>(jobs: (() => Promise<T>)[], size: number, done: (n: number) => void): Promise<T[]> {
  const results: T[] = new Array(jobs.length); let next = 0, finished = 0;
  await Promise.all(Array.from({ length: size }, async () => { while (next < jobs.length) { const i = next++; results[i] = await jobs[i](); done(++finished); } }));
  return results;
}

// Find the thinking levels each model accepts with one cheap probe, so unsupported settings cost nothing more.
const settings: { model: string; thinking: string }[] = [];
const skipped: { model: string; thinking: string; reason: string }[] = [];
for (const model of MODELS.filter((m) => !only || only.includes(m))) {
  for (const thinking of THINKING) {
    const probe = await attempt(model, thinking, CASES[0], 0);
    if (probe.ok || probe.status !== 400) settings.push({ model, thinking });
    else skipped.push({ model, thinking, reason: probe.error ?? "rejected" });
  }
}
console.log(`Settings: ${settings.map((s) => `${s.model}/${s.thinking}`).join(", ")}`);
if (skipped.length) console.log(`Skipped: ${skipped.map((s) => `${s.model}/${s.thinking}`).join(", ")}`);

// Interleave settings so a slow minute on Google's side doesn't land on one model.
const jobs: (() => Promise<Call>)[] = [];
for (let run = 1; run <= RUNS; run++) for (const c of CASES) for (const s of settings) jobs.push(() => attempt(s.model, s.thinking, c, run));
const calls = await pool(jobs, PARALLEL, (n) => { if (n % 25 === 0 || n === jobs.length) console.log(`${n}/${jobs.length} calls`); });

const quantile = (values: number[], q: number) => { if (!values.length) return null; const sorted = [...values].sort((a, b) => a - b); return sorted[Math.min(sorted.length - 1, Math.ceil(q * sorted.length) - 1)]; };
function summarize(task: Task): TaskResult[] {
  return settings.map(({ model, thinking }) => {
    const mine = calls.filter((c) => c.model === model && c.thinking === thinking && c.task === task);
    const ok = mine.filter((c) => c.ok), costs = ok.map((c) => cost(model, c.usage)).filter((v): v is number => v !== null);
    return {
      model, thinking, calls: mine.length,
      accuracy: +(mine.filter((c) => c.pass).length / mine.length).toFixed(3),
      medianMs: quantile(ok.map((c) => c.ms), 0.5), p90Ms: quantile(ok.map((c) => c.ms), 0.9),
      errorRate: +((mine.length - ok.length) / mine.length).toFixed(3),
      costPer1k: costs.length ? +((costs.reduce((a, b) => a + b, 0) / costs.length) * 1000).toFixed(2) : null,
    };
  }).sort((a, b) => (a.medianMs ?? Infinity) - (b.medianMs ?? Infinity));
}

const tasks = { chat: summarize("chat"), demo: summarize("demo") };
const chatPick = pickModel(tasks.chat), demoPick = pickModel(tasks.demo);
if (!chatPick || !demoPick) throw new Error("No setting met the accuracy and error rules; nothing was changed.");
const ranAt = new Date().toISOString();
const failures = calls.filter((c) => !c.pass).map((c) => `${c.model}/${c.thinking} ${c.case}#${c.run}: ${c.error ?? c.notes.join("; ")}`);
const summary = {
  ranAt, runs: RUNS, timeoutMs: TIMEOUT_MS, parallel: PARALLEL,
  cases: { chat: CASES.filter((c) => c.task === "chat").length, ask: CASES.filter((c) => c.kind === "ask").length, extract: CASES.filter((c) => c.kind === "extract").length },
  prices: { capturedAt: PRICES_CAPTURED, source: "Google AI Studio pricing page, Standard tier, USD per 1M tokens", perMillion: PRICES },
  skipped, tasks,
  picks: { chat: { model: chatPick.model, thinking: chatPick.thinking }, demo: { model: demoPick.model, thinking: demoPick.thinking } },
};
const root = new URL("../../../", import.meta.url);
if (!DRY) await Deno.writeTextFile(new URL("lib/publicus/model-evals.json", root), JSON.stringify(summary, null, 2) + "\n");
if (!DRY) await Deno.mkdir(new URL("output/evals/", root), { recursive: true });
if (!DRY) await Deno.writeTextFile(new URL(`output/evals/${ranAt.slice(0, 19).replaceAll(":", "-")}.jsonl`, root), calls.map((c) => JSON.stringify(c)).join("\n") + "\n");

// Rewrite the picks. The demo timeout covers twice the pick's slowest typical answer, at least 60s.
const demoTimeout = Math.max(60_000, Math.ceil((2 * (demoPick.p90Ms ?? 30_000)) / 1000) * 1000);
const modelsFile = new URL("supabase/functions/_shared/models.ts", root);
const picks = `// eval-picks:start\nexport const EVAL_CHAT: Setting = { model: "${chatPick.model}", thinking: "${chatPick.thinking}", timeoutMs: 30_000 };\nexport const EVAL_DEMO: Setting = { model: "${demoPick.model}", thinking: "${demoPick.thinking}", timeoutMs: ${demoTimeout.toLocaleString("en").replaceAll(",", "_")} };\n// eval-picks:end`;
if (!DRY) await Deno.writeTextFile(modelsFile, (await Deno.readTextFile(modelsFile)).replace(/\/\/ eval-picks:start[\s\S]*?\/\/ eval-picks:end/, picks));

const row = (r: TaskResult) => `${`${r.model}/${r.thinking}`.padEnd(32)} acc ${(r.accuracy * 100).toFixed(0).padStart(3)}%  median ${r.medianMs === null ? "   n/a" : `${(r.medianMs / 1000).toFixed(1).padStart(5)}s`}  p90 ${r.p90Ms === null ? "   n/a" : `${(r.p90Ms / 1000).toFixed(1).padStart(5)}s`}  errors ${(r.errorRate * 100).toFixed(0).padStart(3)}%  $/1k ${r.costPer1k ?? "n/a"}`;
for (const task of ["chat", "demo"] as const) { console.log(`\n${task.toUpperCase()}`); tasks[task].forEach((r) => console.log(row(r))); }
console.log(`\nPicks: chat ${chatPick.model}/${chatPick.thinking}, demo ${demoPick.model}/${demoPick.thinking} (timeout ${demoTimeout}ms)`);
console.log(`\nFailed calls (${failures.length}):\n${failures.slice(0, 80).join("\n")}`);
