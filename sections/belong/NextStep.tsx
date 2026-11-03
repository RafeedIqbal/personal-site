import { Module } from "@/components/belong/Doc";
import { PROFILE } from "@/lib/content";

const UNKNOWNS = [
  "What share of errors are reading, labeling or legal-meaning mistakes?",
  "What earns a trail node its lawful-origin label today?",
  "Which model is fine-tuned, and on what data?",
  "Which client consents cover evals and training?",
];

const SUBJECT = encodeURIComponent("Paired session on an anonymized file");

export default function NextStep() {
  return (
    <Module
      id="next"
      numeral="VI"
      title="Next step"
      lede="Some of this can only be settled from inside Belong, with real files."
    >
      <ul className="bl-unknowns">
        {UNKNOWNS.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
      <p className="bl-text">
        Your second interview step is a paired session on an anonymized file. I would like to start there,
        and answer these together.
      </p>
      <div className="bl-cta bl-ui">
        <a className="bl-btn bl-btn--primary" href={`mailto:${PROFILE.email}?subject=${SUBJECT}`}>
          Set up a paired session
        </a>
        <a className="bl-btn" href={PROFILE.resumeUrl} download>
          Résumé<span className="sr-only"> (PDF)</span>
        </a>
      </div>
    </Module>
  );
}
