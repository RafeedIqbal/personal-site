import { Section } from "@/components/belong/Doc";
import SystemLayers from "@/components/belong/SystemLayers";

const DESTINATIONS = [
  { name: "Frontier model", job: "Bad reads", guard: "Its answer must satisfy the arithmetic." },
  { name: "Domain model", job: "Recurring document families", guard: "Only where evals show it wins." },
  { name: "Client portal", job: "Missing evidence", guard: "Asks in the client’s language." },
  { name: "Attorney", job: "Reserved questions and legal meaning", guard: "Nothing closes without them." },
];

export default function System() {
  return (
    <Section id="system" n={3} title="How it works">
      <p>
        Run the cheapest reliable check first, and spend attorney time only where judgment is needed.
      </p>
      <SystemLayers />
      <h3 className="bl-h3">Who looks next</h3>
      <p>Your voice agent decides who reaches an attorney’s calendar. This decides what does.</p>
      <dl className="bl-dests bl-ui">
        {DESTINATIONS.map((d) => (
          <div key={d.name}>
            <dt>{d.name}</dt>
            <dd>{d.job}</dd>
            <dd className="bl-dests__guard">{d.guard}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
