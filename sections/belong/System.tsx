import { Inf, Row, Section } from "@/components/belong/Doc";
import SystemLayers from "@/components/belong/SystemLayers";

export default function System() {
  return (
    <Section id="system" n={5} title="The system">
      <Row>
        <p>
          I would run the cheapest reliable check first and spend attorney time only where judgment is
          needed. Clear items pass straight through. Everything else reaches a resolver, and attorney
          decisions flow back into the next run.
        </p>
      </Row>
      <Row notes={["ocr"]}>
        <SystemLayers />
      </Row>
      <Row notes={["home", "h1b"]}>
        <p>
          Belong already uses a fine-tuned language model, so I would evaluate that model before tuning
          another. Gates, rules and rulings are data scoped by visa and filing route.{" "}
          <Inf>That way L-1 arrives as configuration after E-2 and cap-exempt H-1B, not as a rewrite.</Inf>
        </p>
      </Row>
    </Section>
  );
}
