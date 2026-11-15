import evals from "@/lib/publicus/model-evals.json";
import { modelLabel, type TaskResult } from "@/supabase/functions/_shared/models";

// The eval's results as two ruled tables: accuracy as a bar from zero, response time as a dot
// at the median with a line to the 90th percentile on a log scale, and list-price cost.
const MIN_S = 1, MAX_S = 90, TICKS = [1, 3, 10, 30, 90];
const at = (seconds: number) => `${(Math.log(Math.min(MAX_S, Math.max(MIN_S, seconds)) / MIN_S) / Math.log(MAX_S / MIN_S)) * 100}%`;
const secs = (ms: number) => `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`;
const day = new Intl.DateTimeFormat("en-CA", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function Results({ id, caption, rows, pick }: { id: string; caption: string; rows: TaskResult[]; pick: { model: string; thinking: string } }) {
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
        const chosen = r.model === pick.model && r.thinking === pick.thinking;
        return <tr key={`${r.model}-${r.thinking}`} className={chosen ? "is-chosen" : undefined}>
          <th scope="row"><span className="pu-evals-model">{modelLabel(r.model)}{chosen && <span className="pu-evals-chosen">Chosen</span>}</span><span className="pu-evals-setting">{r.thinking} thinking</span></th>
          <td data-label="Accuracy"><span className="pu-evals-bar" aria-hidden="true"><span style={{ width: `${r.accuracy * 100}%` }}/></span><span className="pu-data">{Math.round(r.accuracy * 100)}%</span>{r.errorRate > 0 && <span className="pu-evals-note pu-evals-failed">{Math.round(r.errorRate * 100)}% of calls failed</span>}</td>
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

export default function ModelEvals() {
  const { tasks, picks, cases, runs, prices, ranAt } = evals as unknown as { tasks: Record<"chat" | "demo", TaskResult[]>; picks: Record<"chat" | "demo", { model: string; thinking: string }>; cases: { chat: number; ask: number; extract: number }; runs: number; prices: { capturedAt: string }; ranAt: string };
  const models = new Set(tasks.chat.map((r) => r.model)).size;
  return <figure id="models" className="pu-evals" aria-labelledby="pu-evals-title">
    <h3 id="pu-evals-title">{picks.chat.model === picks.demo.model ? `${modelLabel(picks.chat.model)} runs the chat and the explorer` : `${modelLabel(picks.chat.model)} runs the chat; ${modelLabel(picks.demo.model)} runs the explorer`}</h3>
    <p className="pu-evals-lede">I ran every current Gemini text model through the same checks on {day.format(new Date(ranAt))}: {cases.chat} chat questions, and {cases.ask} explorer questions plus {cases.extract} document extractions, each {runs === 2 ? "twice" : `${runs} times`}. Every check is scored by code, not by another model. A model counts as accurate when it scores within 5 points of the best one and fails no more than 5% of calls. The fastest accurate model wins, and times within 10% of each other count as a tie that goes to the cheaper model.</p>
    <Results id="pu-evals-chat" caption={`Help chat: ${cases.chat} questions, ${models} models`} rows={tasks.chat} pick={picks.chat}/>
    <Results id="pu-evals-demo" caption={`Explorer: ${cases.ask} questions and ${cases.extract} document extractions`} rows={tasks.demo} pick={picks.demo}/>
    <figcaption>Sorted fastest first. Times are measured straight against Google’s API; answers on this page also pass through Supabase. Costs use Google’s list prices on {day.format(new Date(`${prices.capturedAt}T12:00:00Z`))}, including thinking tokens.</figcaption>
  </figure>;
}
