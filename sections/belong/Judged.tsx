import { Row, Section } from "@/components/belong/Doc";

const METRICS = [
  { name: "Silent errors", definition: "Critical mistakes that reach review without a flag", why: "The main safety measure" },
  { name: "Corrections per file", definition: "Attorney changes to machine output", why: "The main quality signal" },
  { name: "False flags", definition: "Flags an attorney dismisses", why: "Protects attorney attention" },
  { name: "First-route closes", definition: "Items closed by the first destination", why: "Measures the router" },
  { name: "Attorney minutes per file", definition: "Review and resolution time", why: "Links accuracy to flat-fee margin" },
  { name: "Avoidable RFEs", definition: "RFEs traced to a document or funds mistake", why: "The outcome that matters, though it lags" },
  { name: "Cost per file", definition: "Parser and model spend", why: "Keeps the design within a profit-first budget" },
];

export default function Judged() {
  return (
    <Section id="judged" n={10} title="How the work gets judged">
      <Row notes={["gatewayx"]}>
        <p>
          Baselines come from real files in weeks 1 to 6, so I set no targets before then. These are the
          measures and their definitions. There are no results on this page, because I do not have any
          yet.
        </p>
      </Row>
      <Row wide>
        <table className="bl-table bl-ui">
          <caption>The weekly scorecard</caption>
          <thead>
            <tr>
              <th scope="col">Metric</th>
              <th scope="col">Definition</th>
              <th scope="col">Why it matters</th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m) => (
              <tr key={m.name}>
                <th scope="row">{m.name}</th>
                <td data-label="Definition">{m.definition}</td>
                <td data-label="Why it matters">{m.why}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Row>
    </Section>
  );
}
