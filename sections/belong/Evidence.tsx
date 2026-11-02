import { Inf, Row, Section } from "@/components/belong/Doc";
import FundEvidence from "@/components/belong/FundEvidence";
import { RULES } from "@/lib/belong/checks";

const SEVEN = ["balance", "continuity", "control", "transfer-match", "origin", "debt", "commitment"] as const;

export default function Evidence() {
  return (
    <Section id="evidence" n={7} title="How a trail node earns green">
      <Row notes={["home"]}>
        <p>
          <Inf>
            Belong’s Fund trace already shows each node’s lawful origin and control percentage.
          </Inf>{" "}
          I would keep that view and put transaction-level evidence under every node and edge, tested
          in plain code before the node turns green.
        </p>
        <p>Pick a node on Mara Beispiel’s clean file to see its checks, source pages and citations.</p>
      </Row>
      <Row wide>
        <FundEvidence />
      </Row>
      <Row notes={["fam", "funds"]}>
        <h3 className="bl-h3">The seven checks</h3>
        <dl className="bl-rules bl-ui">
          {SEVEN.map((id) => (
            <div key={id}>
              <dt>{RULES[id].name}</dt>
              <dd>
                {RULES[id].text}
                {RULES[id].citation && <span className="bl-rules__cite bl-num">{RULES[id].citation}</span>}
              </dd>
            </div>
          ))}
        </dl>
        <p>
          Commingled accounts cannot be settled by arithmetic, so they need a written attorney policy.
          Error 6 lets you write one.
        </p>
        <p className="bl-legend bl-ui">
          The rule wording here is mine. An immigration attorney needs to review it before anyone relies
          on it.
        </p>
      </Row>
    </Section>
  );
}
