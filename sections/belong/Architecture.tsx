import { Figure, Module, ModuleContinued, Numerals } from "@/components/belong/Doc";
import EvidenceFigure from "@/components/belong/EvidenceFigure";
import FeedbackLoop from "@/components/belong/FeedbackLoop";
import RoutingFigure from "@/components/belong/RoutingFigure";
import SystemFigure from "@/components/belong/SystemFigure";

const SECTION = "II. The architecture";

const GUARDRAILS = [
  ["Shadow mode first", "Every new layer runs beside the current pipeline before attorneys see its output."],
  ["Replay gates release", "The full gold set replays in CI; a change that adds a silent error does not ship."],
  ["Consent before training", "Client material becomes training data only after attorney sign-off and client consent."],
  ["Attorneys close", "Models and checks only prepare. Nothing is filed without an attorney."],
];

export default function Architecture() {
  return (
    <>
      <Module
        id="architecture"
        numeral="II"
        title="The architecture"
        tone="band"
        word="Architecture"
        lede="Plain-code checks run on every file. Models run only on what the checks flag. Attorneys see only what needs judgment. Every answer they give becomes a rule, a test and training data."
      >
        <Numerals
          items={[
            { n: "7", word: "Layers" },
            { n: "4", word: "Resolvers" },
            { n: "9", word: "Gates" },
          ]}
        />
        <Figure n={1} caption="The seven layers, grouped by what they cost. Pick a layer to see how I would build it.">
          <SystemFigure />
        </Figure>
        <p className="bl-platform bl-ui">
          <b>Platform.</b> One durable workflow per file on a Postgres-backed job queue. Steps are
          idempotent, every input and output is logged for replay, and each file carries its own trace
          and cost.
        </p>
      </Module>
      <ModuleContinued section={SECTION}>
        <h3 className="bl-subtitle">Who looks next</h3>
        <p className="bl-text">
          Routing is a separate job from reading. Your voice agent decides who reaches an attorney’s
          calendar. This decides what does.
        </p>
        <Figure n={2} caption="Routing. Hard rules can only send work up to an attorney, never away from one.">
          <RoutingFigure />
        </Figure>

        <h3 className="bl-subtitle">How a node earns green</h3>
        <p className="bl-text">
          Belong’s Fund trace already draws the route. The evidence ledger sits underneath it: every node
          and edge is reconciled line by line, in plain code, before it turns green.
        </p>
        <Figure n={3} caption="One node on the demo file, with the checks it passed and the page each one read.">
          <EvidenceFigure />
        </Figure>

        <h3 className="bl-subtitle">What it learns</h3>
        <p className="bl-text">
          An attorney’s correction should stop the same mistake on the next file. Each one becomes a dated
          ruling, a regression test and, with consent, training data.
        </p>
        <Figure n={4} caption="The loop, driven by your own ruling on error 6 in the demo.">
          <FeedbackLoop />
        </Figure>

        <dl className="bl-guards bl-ui">
          {GUARDRAILS.map(([name, text]) => (
            <div key={name}>
              <dt>{name}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </ModuleContinued>
    </>
  );
}
