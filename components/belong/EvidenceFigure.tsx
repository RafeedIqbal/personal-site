import { RULES, evaluate, money, nodeResults } from "@/lib/belong/checks";
import { FILES } from "@/lib/belong/data";
import { NodeChecks } from "./Sheet";
import { StatusTag } from "./Status";

const FILE = FILES[0];
const RESULTS = nodeResults(evaluate(FILE), "account:savings");
const SEVEN = ["balance", "continuity", "control", "transfer-match", "origin", "debt", "commitment"] as const;

// How one node on the fund trail earns its green label: every check it passed,
// each pointing at the line it read.
export default function EvidenceFigure() {
  return (
    <div className="bl-efig bl-ui">
      <div className="bl-efig__node">
        <div className="bl-efig__head">
          <span>
            <b>{FILE.accounts.savings.label}</b>
            <span className="bl-num">{money("EUR", FILE.accounts.savings.closing)}</span>
          </span>
          <StatusTag tone="proven" word="Proven" />
        </div>
        <NodeChecks results={RESULTS} file={FILE} />
      </div>
      <dl className="bl-efig__rules" aria-label="The seven fund checks">
        {SEVEN.map((id) => (
          <div key={id}>
            <dt>{RULES[id].name}</dt>
            <dd>
              {RULES[id].text}
              {RULES[id].citation && <span className="bl-num bl-efig__cite">{RULES[id].citation}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
