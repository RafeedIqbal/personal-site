import { Row, Section } from "@/components/belong/Doc";
import KnowledgeGraph from "@/components/belong/Knowledge";

export default function Knowledge() {
  return (
    <Section id="knowledge" n={8} title="What the knowledge graph holds">
      <Row notes={["kag"]}>
        <p>
          KAG combines a knowledge graph with vector retrieval, so it is a knowledge layer, not an
          embedding swap. I would start small and have attorneys review every entry: visa, gate,
          requirement, document type, rule, citation and ruling.
        </p>
      </Row>
      <Row notes={["scrutiny"]}>
        <p>
          Each entry carries an effective date and a filing route, because USCIS and consular officers
          can apply different scrutiny. Here is one path, from the visa down to a ruling.
        </p>
        <KnowledgeGraph />
      </Row>
    </Section>
  );
}
