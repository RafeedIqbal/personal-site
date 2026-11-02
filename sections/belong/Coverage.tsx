import { Inf, Row, Section } from "@/components/belong/Doc";

const ROWS = [
  {
    signal: "34 of 34 documents collected",
    proves: "The item is present",
    cannot: "The item was understood correctly",
    proof: "Its label is checked against its contents and against other documents",
  },
  {
    signal: "18 rules, 100% record completeness",
    proves: "Each rule could run",
    cannot: "Each input was right",
    proof: "Each input links to a source page and position",
  },
  {
    signal: "A complete fund trail",
    proves: "A route was drawn",
    cannot: "Each edge is backed by transactions",
    proof: "Statements reconcile line by line under each edge",
  },
  {
    signal: "9 checks passed",
    proves: "The draft passes machine checks",
    cannot: "The record under the draft is true",
    proof: "The silent-error rate on an attorney-labeled gold set",
  },
];

export default function Coverage() {
  return (
    <Section id="correctness" n={4} title="Coverage is solved. Correctness is next.">
      <Row notes={["home"]}>
        <p>
          Belong’s product screens already prove coverage well: every document collected, every rule
          run, every node on the trail drawn.{" "}
          <Inf>What a green check cannot show yet is that it is right.</Inf> That is the layer I would
          add, without taking anything away from what is there.
        </p>
      </Row>
      <Row wide>
        <table className="bl-table bl-ui">
          <caption>Signals read from the product screens on Belong’s public site</caption>
          <thead>
            <tr>
              <th scope="col">Signal on Belong’s screens</th>
              <th scope="col">What it proves</th>
              <th scope="col">What it cannot prove</th>
              <th scope="col">Proposed proof</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.signal}>
                <th scope="row">{row.signal}</th>
                <td data-label="What it proves">{row.proves}</td>
                <td data-label="What it cannot prove">{row.cannot}</td>
                <td data-label="Proposed proof">{row.proof}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Row>
    </Section>
  );
}
