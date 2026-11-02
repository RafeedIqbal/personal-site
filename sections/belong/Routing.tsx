import { Inf, Row, Section } from "@/components/belong/Doc";
import { Packet } from "@/components/belong/RouteCard";
import { applyPatch, settle } from "@/lib/belong/checks";
import { FILES, SCENARIOS } from "@/lib/belong/data";

const STEPS = [
  "Hard rules run first. A reserved question always goes to an attorney, and no model can override that.",
  "A small decision model scores everything else. Its inputs are the gate, document type, failed check, confidence, amount at issue, language, filing route and past correction rate.",
  "The router picks the cheapest destination likely to resolve the item. If the router itself is unsure, the item goes to an attorney.",
  "Each item arrives as a packet with the page crop, extracted value, failed rule, citation, candidate answers and one exact question.",
  "Reassignments and outcomes become training data, so the router improves as attorneys use it.",
];

const DESTINATIONS = [
  {
    name: "Frontier model",
    handles: "Bad reads and unclear documents",
    example: "Re-reads a cropped amount (error 1)",
    guardrail: "Its answer must satisfy the arithmetic.",
  },
  {
    name: "Fine-tuned domain model",
    handles: "Recurring document families",
    example: "Spots repayment terms in a family gift letter (error 3)",
    guardrail: "Exists only where evals show it beats a frontier model with the knowledge graph.",
  },
  {
    name: "Client portal",
    handles: "Missing or unclear evidence",
    example: "Requests a missing statement (error 2)",
    guardrail: "Asks in the client’s language.",
  },
  {
    name: "Attorney",
    handles: "Reserved questions, low confidence and legal meaning",
    example: "Decides how to treat commingled funds (error 6)",
    guardrail: "Nothing closes without the attorney. Starts with the matter owner, then matches by issue.",
  },
];

const SAMPLE = SCENARIOS.find((s) => s.id === 3) ?? SCENARIOS[0];
const SAMPLE_FILE = applyPatch(FILES[0], SAMPLE.patch);
const SAMPLE_FINDING = settle(SAMPLE_FILE, SAMPLE).primary;

export default function Routing() {
  return (
    <Section id="routing" n={6} title="Routing decides who looks next">
      <Row notes={["gotv"]}>
        <p className="bl-lede">
          Your voice agent decides who reaches an attorney’s calendar. This decides what does.
        </p>
        <p>
          Deciding who should look at an item is a separate job from deciding what a document is. It
          extends the questions Belong already reserves to the attorney.
        </p>
      </Row>
      <Row>
        <ol className="bl-steps">
          {STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </Row>
      <Row wide>
        <dl className="bl-dests bl-ui">
          {DESTINATIONS.map((d) => (
            <div key={d.name} className="bl-dest">
              <dt>{d.name}</dt>
              <dd>
                <span className="bl-dest__k">Handles</span> {d.handles}
              </dd>
              <dd>
                <span className="bl-dest__k">In the demo</span> {d.example}
              </dd>
              <dd>
                <span className="bl-dest__k">Guardrail</span> {d.guardrail}
              </dd>
            </div>
          ))}
        </dl>
      </Row>
      <Row>
        <h3 className="bl-h3">The packet an attorney receives for error 3</h3>
        {SAMPLE_FINDING && (
          <div className="bl-sample bl-ui">
            <Packet file={SAMPLE_FILE} scenario={SAMPLE} primary={SAMPLE_FINDING} />
          </div>
        )}
        <p>
          <Inf>With only a few attorneys, routing starts as the matter owner plus a priority queue.</Inf>{" "}
          Matching by issue comes later, if the team grows.
        </p>
      </Row>
    </Section>
  );
}
