import { Row, Section } from "@/components/belong/Doc";
import { PROFILE } from "@/lib/content";

const UNKNOWNS = [
  "What share of errors are reading, labeling or legal-meaning mistakes?",
  "What earns a trail node its lawful-origin label today?",
  "Which model is fine-tuned, and on what data?",
  "What do Audit trail and Rule detail store, and can they support replay?",
  "Which client consents cover evals and training?",
  "How many attorneys review files, and who owns each matter?",
];

const SUBJECT = encodeURIComponent("Paired session on an anonymized file");

export default function NextStep() {
  return (
    <Section id="next" n={13} title="What I need to learn">
      <Row>
        <p>
          Some of this can only be settled from inside Belong. These are the questions I would answer
          first, from real files:
        </p>
        <ul className="bl-unknowns">
          {UNKNOWNS.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </Row>
      <Row notes={["jd"]}>
        <p className="bl-lede">
          Your second interview step is a paired session on a real, anonymized file. I would like to
          start there: bring one file, and we work through it with this method.
        </p>
        <div className="bl-cta bl-ui">
          <a className="bl-btn bl-btn--primary" href={`mailto:${PROFILE.email}?subject=${SUBJECT}`}>
            Email me to set up a session
          </a>
          <a className="bl-btn bl-btn--quiet" href={PROFILE.resumeUrl} download>
            Download my résumé<span className="sr-only"> (PDF)</span>
          </a>
        </div>
        <p className="bl-hero__hint bl-ui">
          {PROFILE.email}, Toronto, in the office every day.
        </p>
      </Row>
    </Section>
  );
}
