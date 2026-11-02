import { Row, Section } from "@/components/belong/Doc";
import FeedbackLoop from "@/components/belong/FeedbackLoop";

export default function Loop() {
  return (
    <Section id="loop" n={9} title="One correction, four outputs">
      <Row notes={["aba"]}>
        <p>
          An attorney’s correction should stop the same mistake on the next file. Here is error 6’s
          correction moving through the loop. If you have ruled on it, these are your answers.
        </p>
      </Row>
      <Row wide>
        <FeedbackLoop />
      </Row>
    </Section>
  );
}
