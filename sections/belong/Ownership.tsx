import { Row, Section } from "@/components/belong/Doc";

const AREAS = [
  {
    area: "The product",
    own: "Extraction, classification, drafting and the multilingual client portal",
    proof: "Took Icon Training from MVP to a production-ready launch. Built Bajan, a Bangla voice assistant for older adults.",
  },
  {
    area: "Accuracy",
    own: "Gold set, replay system, scorecard and release gate",
    proof: "At BaseNote, plain code checks every formulation the agent drafts, and the agent can only see in-stock materials. I also built an eval suite for model selection.",
  },
  {
    area: "Feedback loop",
    own: "Daily correction review, rulings and regression tests",
    proof: "At Sanofi Pasteur, I took 255 interface errors to zero and documented each error class, so recurring failures stopped needing escalation.",
  },
  {
    area: "Architecture",
    own: "Tools, vendors, data boundaries and cost per file",
    proof: "Sole engineer on a multi-tenant Django and PostgreSQL ERP, with written specs, agent review and CI gates.",
  },
];

const RIGHTS = [
  { who: "Me", what: "Architecture, models, vendors, release timing and engineering priorities." },
  { who: "Attorneys", what: "Legal meaning, rule approval, data rules and filing sign-off." },
  { who: "Achint", what: "Business priorities, budget and new visa routes." },
  { who: "Adam Brakhane", what: "Product and engineering mentorship, as the job description offers." },
];

const RHYTHM = [
  { when: "Daily", what: "A short correction review with the attorneys, in the office." },
  { when: "Weekly", what: "A one-page scorecard for Achint, so results arrive without running the process." },
  { when: "Every release", what: "A full replay of the gold set before anything ships." },
  { when: "Every near miss", what: "A written root cause and a new test in the same week." },
];

export default function Ownership() {
  return (
    <Section id="ownership" n={11} title="How I would own it">
      <Row notes={["jd"]}>
        <p>
          The role’s bar is to run the product without needing Achint in the loop. These are the four
          areas the job description names, with the work I have done that is closest to each. I would be
          in the Toronto office every day.
        </p>
      </Row>
      <Row wide>
        <table className="bl-table bl-ui">
          <caption>Ownership, by the job description’s four areas</caption>
          <thead>
            <tr>
              <th scope="col">Area</th>
              <th scope="col">What I would own</th>
              <th scope="col">Closest proof</th>
            </tr>
          </thead>
          <tbody>
            {AREAS.map((a) => (
              <tr key={a.area}>
                <th scope="row">{a.area}</th>
                <td data-label="What I would own">{a.own}</td>
                <td data-label="Closest proof">{a.proof}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Row>
      <Row notes={["home"]}>
        <h3 className="bl-h3">Decision rights</h3>
        <p>
          Belong is a technology company working with a law firm, so client data rules and legal rules
          belong to the attorneys, not to engineering.
        </p>
        <dl className="bl-pairs bl-ui">
          {RIGHTS.map((r) => (
            <div key={r.who}>
              <dt>{r.who}</dt>
              <dd>{r.what}</dd>
            </div>
          ))}
        </dl>
      </Row>
      <Row>
        <h3 className="bl-h3">Operating rhythm</h3>
        <dl className="bl-pairs bl-ui">
          {RHYTHM.map((r) => (
            <div key={r.when}>
              <dt>{r.when}</dt>
              <dd>{r.what}</dd>
            </div>
          ))}
        </dl>
      </Row>
    </Section>
  );
}
