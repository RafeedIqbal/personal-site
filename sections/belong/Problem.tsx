import { Inf, Row, Section } from "@/components/belong/Doc";

export default function Problem() {
  return (
    <Section id="problem" n={2} title="The problem">
      <Row notes={["jd"]}>
        <p className="bl-lede">
          Your attorneys use the product on real files, and their feedback is clear: it is fast,
          but it still makes mistakes. It mischaracterizes documents, and it gets trace-of-funds
          analysis wrong.
        </p>
        <p>This page answers those two failures and nothing else. Three things make them expensive.</p>
      </Row>
      <Row notes={["home", "e2"]}>
        <ul className="bl-stakes">
          <li>
            <strong>20 to 30 attorney hours</strong> go into a typical business visa, most of it
            assembly. It is Belong’s own figure and the only public baseline, so I use it as context, not
            as a result.
          </li>
          <li>
            <strong>A USD 9,000 flat fee</strong> covers the main applicant, including responses to any
            request for evidence.{" "}
            <Inf>An avoidable RFE comes out of margin, so accuracy is a business metric.</Inf>
          </li>
          <li>
            <strong>Funds are where files fail.</strong> Belong calls capital deployment traced to its
            source “the most common reason a good file fails.” That is why this proposal starts with
            money.
          </li>
        </ul>
      </Row>
      <Row>
        <p className="bl-legend bl-ui">
          <Inf>A dotted underline</Inf> marks an inference from Belong’s public pages, not something I
          know about its internals.
        </p>
      </Row>
    </Section>
  );
}
