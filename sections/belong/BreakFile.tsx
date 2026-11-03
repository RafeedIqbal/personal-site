import { Section } from "@/components/belong/Doc";
import Visualizer from "@/components/belong/Visualizer";

export default function BreakFile() {
  return (
    <Section id="break" n={2} title="Break this file" after={<Visualizer />}>
      <p>
        Mara Beispiel, a fictional German investor, is buying a coffee shop in the US. Pick an error and
        watch which layer catches it, where it goes and what it changes.
      </p>
    </Section>
  );
}
