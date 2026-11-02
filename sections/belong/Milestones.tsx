import { Row, Section } from "@/components/belong/Doc";
import Timeline from "@/components/belong/Timeline";

export default function Milestones() {
  return (
    <Section id="milestones" n={12} title="Twenty-six weeks, six gates">
      <Row notes={["e2"]}>
        <p>
          Each milestone closes on a gate the attorneys can see. Funds come before document sorting,
          because Belong names capital deployment as the top failure and plain-code checks give the
          fastest proof. The milestones overlap, so each one builds on what the last one shipped while
          its gate closes.
        </p>
      </Row>
      <Row wide>
        <Timeline />
      </Row>
      <Row notes={["aba"]}>
        <p>
          Every change runs in shadow mode before it reaches attorneys. Training on client material waits
          for attorney sign-off, because ABA Formal Opinion 512 calls for informed consent beyond
          boilerplate when client information enters self-learning tools.
        </p>
      </Row>
    </Section>
  );
}
