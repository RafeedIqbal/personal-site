import { Section } from "@/components/belong/Doc";
import FeedbackLoop from "@/components/belong/FeedbackLoop";

export default function Loop() {
  return (
    <Section id="loop" n={4} title="What it learns">
      <p>
        An attorney’s correction should stop the same mistake on the next file. Each one becomes a dated
        ruling in a small knowledge graph, a regression test and, with consent, training data.
      </p>
      <FeedbackLoop />
    </Section>
  );
}
