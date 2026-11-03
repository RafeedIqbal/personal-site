import { Section } from "@/components/belong/Doc";

const METRICS = [
  ["Silent errors", "Critical mistakes that reach review without a flag."],
  ["Corrections per file", "Attorney changes to machine output."],
  ["False flags", "Flags an attorney dismisses."],
  ["First-route closes", "Items closed by the first destination."],
  ["Attorney minutes per file", "Review and resolution time."],
  ["Avoidable RFEs", "RFEs traced to a document or funds mistake."],
  ["Cost per file", "Parser and model spend."],
];

export default function Judged() {
  return (
    <Section id="judged" n={5} title="How it gets judged">
      <p>Baselines come from real files in the first sprints, so there are no targets before then.</p>
      <dl className="bl-pairs bl-ui">
        {METRICS.map(([name, definition]) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{definition}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
