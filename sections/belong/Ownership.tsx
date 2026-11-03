import { Section } from "@/components/belong/Doc";
import Timeline from "@/components/belong/Timeline";

const AREAS = [
  ["The product", "Took Icon Training from MVP to launch; built Bajan, a Bangla voice assistant."],
  ["Accuracy", "At BaseNote, plain code checks every formulation the agent drafts; eval suite for model selection."],
  ["Feedback loop", "At Sanofi Pasteur, took 255 interface errors to zero and documented every error class."],
  ["Architecture", "Sole engineer on a multi-tenant Django and PostgreSQL ERP, with specs and CI gates."],
];

const RIGHTS = [
  ["Me", "Architecture, models, vendors and release timing."],
  ["Attorneys", "Legal meaning, rule approval, data rules and sign-off."],
  ["Achint", "Business priorities, budget and new visa routes."],
];

export default function Ownership() {
  return (
    <Section id="ownership" n={6} title="How I would own it">
      <p>
        The bar is to run the product without needing Achint in the loop. I would be in the Toronto office
        every day.
      </p>
      <dl className="bl-pairs bl-ui">
        {AREAS.map(([area, proof]) => (
          <div key={area}>
            <dt>{area}</dt>
            <dd>{proof}</dd>
          </div>
        ))}
      </dl>
      <h3 className="bl-h3">Who decides</h3>
      <dl className="bl-pairs bl-ui">
        {RIGHTS.map(([who, what]) => (
          <div key={who}>
            <dt>{who}</dt>
            <dd>{what}</dd>
          </div>
        ))}
      </dl>
      <h3 className="bl-h3">Milestones</h3>
      <p>Each milestone closes on a gate the attorneys can see. Every change ships in shadow mode first.</p>
      <Timeline />
    </Section>
  );
}
