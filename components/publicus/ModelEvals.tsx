import evals from "@/lib/publicus/model-evals.json";
import { CHAT, DEMO, modelLabel, type TaskResult } from "@/supabase/functions/_shared/models";

// The eval's results as two ruled tables: accuracy as a bar from zero, response time as a dot
// at the median with a line to the 90th percentile on a log scale, and list-price cost. The row
// the site runs is marked "In use"; when the eval's winner differs, it is marked "Eval pick".
const MIN_S = 1, MAX_S = 90, TICKS = [1, 3, 10, 30, 90];
const at = (seconds: number) => `${(Math.log(Math.min(MAX_S, Math.max(MIN_S, seconds)) / MIN_S) / Math.log(MAX_S / MIN_S)) * 100}%`;
const secs = (ms: number) => `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`;
type Pick = { model: string; thinking: string };
const same = (a: Pick, b: Pick) => a.model === b.model && a.thinking === b.thinking;
const pct = (r: TaskResult) => `${Math.round(r.accuracy * 100)}%`;
const day = new Intl.DateTimeFormat("en-CA", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function Results({ id, caption, rows, pick, used }: { id: string; caption: string; rows: TaskResult[]; pick: Pick; used: Pick }) {
  return <div className="pu-evals-table">
    <table aria-labelledby={`${id}-caption`}>
      <caption id={`${id}-caption`}>{caption}</caption>
      <thead><tr>
        <th scope="col">Model</th>
        <th scope="col">Accuracy</th>
        <th scope="col"><span>Response time</span><span className="pu-evals-axis" aria-hidden="true">{TICKS.map((t) => <span key={t} style={{ left: at(t) }}>{t} s</span>)}</span></th>
        <th scope="col" className="pu-num">Cost per 1,000 answers</th>
      </tr></thead>
      <tbody>{rows.map((r) => {
        const inUse = same(r, used), evalPick = same(r, pick) && !inUse;
        return <tr key={`${r.model}-${r.thinking}`} className={inUse ? "is-chosen" : undefined}>
          <th scope="row"><span className="pu-evals-model">{modelLabel(r.model)}{inUse && <span className="pu-evals-chosen">In use</span>}{evalPick && <span className="pu-evals-pick">Eval pick</span>}</span><span className="pu-evals-setting">{r.thinking} thinking</span></th>
          <td data-label="Accuracy"><span className="pu-evals-bar" aria-hidden="true"><span style={{ width: `${r.accuracy * 100}%` }}/></span><span className="pu-data">{pct(r)}</span>{r.errorRate > 0 && <span className="pu-evals-note pu-evals-failed">{Math.round(r.errorRate * 100)}% of calls failed</span>}</td>
          <td data-label="Response time">{r.medianMs === null ? <span className="pu-evals-note">No answer within 90 s</span> : <>
            <span className="pu-evals-track" aria-hidden="true">{TICKS.map((t) => <i key={t} style={{ left: at(t) }}/>)}<b style={{ left: at(r.medianMs / 1000), width: `calc(${at((r.p90Ms ?? r.medianMs) / 1000)} - ${at(r.medianMs / 1000)})` }}/><em style={{ left: at(r.medianMs / 1000) }}/></span>
            <span className="pu-data">{secs(r.medianMs)}</span><span className="pu-evals-note"> median, {secs(r.p90Ms ?? r.medianMs)} at p90</span>
          </>}</td>
          <td data-label="Cost per 1,000 answers" className="pu-num">{r.costPer1k === null ? <span className="pu-evals-note">Not published</span> : <span className="pu-data">${r.costPer1k.toFixed(2)}</span>}</td>
        </tr>;
      })}</tbody>
    </table>
  </div>;
}

// "its only miss was a failed call" when every miss was an API error rather than a wrong answer.
function missNote(r: TaskResult) {
  const misses = Math.round((1 - r.accuracy) * r.calls), failed = Math.round(r.errorRate * r.calls);
  if (!misses || misses !== failed) return "";
  return misses === 1 ? " (its one miss was a failed call to Google, not a wrong answer)" : " (its misses were failed calls to Google, not wrong answers)";
}
const compare = (a: TaskResult, b: TaskResult) => pct(a) === pct(b) ? `both scored ${pct(a)}` : `it scored ${pct(a)} to ${pct(b)}${missNote(a)}`;
const versus = (a: TaskResult, b: TaskResult) => a.costPer1k !== null && b.costPer1k !== null ? `$${a.costPer1k.toFixed(2)} against $${b.costPer1k.toFixed(2)}` : null;

export default function ModelEvals() {
  const { tasks, picks, cases, runs, prices, ranAt } = evals as unknown as { tasks: Record<"chat" | "demo", TaskResult[]>; picks: Record<"chat" | "demo", Pick>; cases: { chat: number; ask: number; extract: number }; runs: number; prices: { capturedAt: string }; ranAt: string };
  const models = new Set(tasks.chat.map((r) => r.model)).size;
  const find = (task: "chat" | "demo", p: Pick) => tasks[task].find((r) => same(r, p));
  const used = { chat: find("chat", CHAT), demo: find("demo", DEMO) }, won = { chat: find("chat", picks.chat), demo: find("demo", picks.demo) };
  const overridden = !same(CHAT, picks.chat) || !same(DEMO, picks.demo);
  const title = CHAT.model === DEMO.model ? `${modelLabel(CHAT.model)} runs the chat and the explorer` : `${modelLabel(CHAT.model)} runs the chat; ${modelLabel(DEMO.model)} runs the explorer`;
  return <figure id="models" className="pu-evals" aria-labelledby="pu-evals-title">
    <h3 id="pu-evals-title">{title}</h3>
    <p className="pu-evals-lede">I ran every current Gemini text model through the same checks on {day.format(new Date(ranAt))}: {cases.chat} chat questions, and {cases.ask} explorer questions plus {cases.extract} document extractions, each {runs === 2 ? "twice" : `${runs} times`}. Every check is scored by code, not by another model. A model counts as accurate when it scores within 5 points of the best one and fails no more than 5% of calls. The fastest accurate model wins, and times within 10% of each other count as a tie that goes to the cheaper model.</p>
    {overridden && used.chat && used.demo && won.chat && won.demo && <p className="pu-evals-lede">
      The eval picked {modelLabel(picks.chat.model)}. I run {modelLabel(CHAT.model)} instead: it’s the newest Flash model, and the differences are small enough that staying on the latest version is worth it.
      {" "}On the chat {compare(used.chat, won.chat)}; its median was {secs(used.chat.medianMs!)} against {secs(won.chat.medianMs!)}.
      {" "}On the explorer {compare(used.demo, won.demo)}; its median was {secs(used.demo.medianMs!)} against {secs(won.demo.medianMs!)}.
      {versus(used.chat, won.chat) && versus(used.demo, won.demo) && <> Costs per 1,000 answers are close: {versus(used.chat, won.chat)} for the chat and {versus(used.demo, won.demo)} for the explorer.</>}
    </p>}
    <Results id="pu-evals-chat" caption={`Help chat: ${cases.chat} questions, ${models} models`} rows={tasks.chat} pick={picks.chat} used={CHAT}/>
    <Results id="pu-evals-demo" caption={`Explorer: ${cases.ask} questions and ${cases.extract} document extractions`} rows={tasks.demo} pick={picks.demo} used={DEMO}/>
    <figcaption>Sorted fastest first. Times are measured straight against Google’s API; answers on this page also pass through Supabase. Costs use Google’s list prices on {day.format(new Date(`${prices.capturedAt}T12:00:00Z`))}, including thinking tokens.</figcaption>
  </figure>;
}
