import { Figure, Module } from "@/components/belong/Doc";
import Visualizer from "@/components/belong/Visualizer";

export default function BreakFile() {
  return (
    <Module
      id="break"
      numeral="III"
      title="See it run"
      lede="Mara Beispiel, a fictional German investor, is buying a coffee shop in the US. Inject an error and watch the architecture catch it."
    >
      <Figure n={5} below wide caption="The accuracy layer, drawn inside Belong’s petition assembly.">
        <Visualizer />
      </Figure>
    </Module>
  );
}
