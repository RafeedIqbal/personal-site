import { Row, Section } from "@/components/belong/Doc";
import Visualizer from "@/components/belong/Visualizer";
import { FILES } from "@/lib/belong/data";

const FILE = FILES[0];
const GERMAN = FILE.documents.filter((doc) => doc.lang === "de").length;

export default function BreakFile() {
  return (
    <Section
      id="break"
      n={3}
      title="Break this file"
      after={
        <>
          <Visualizer />
          <p className="bl-viz__foot bl-ui">
            Confidence scores, router scores and model answers are precomputed demo values and carry a
            simulated label. The arithmetic and the rules are not simulated.
          </p>
        </>
      }
    >
      <Row notes={["fam"]}>
        <p>
          Mara Beispiel is a fictional German investor buying the fictional Demo Street Coffee LLC
          through the consular route. The file holds {FILE.documents.length} documents, {GERMAN} of them
          in German, and a fund trail from German savings into a US business. Germany is an E-2 treaty country, and the demo
          uses a fictional rate of 1 EUR to 1.10 USD.
        </p>
        <p>
          Pick an error and watch which layer catches it, where it goes and what changes. The checks
          and tiles are real code running in your browser.
        </p>
      </Row>
    </Section>
  );
}
