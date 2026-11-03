"use client";

import { RULES, applyPatch, settle } from "@/lib/belong/checks";
import { SCENARIOS, fileById } from "@/lib/belong/data";
import { showDemo, useDemo } from "./demo";
import { StatusTag } from "./Status";

const ERROR_SIX = SCENARIOS.find((s) => s.ruling) ?? SCENARIOS[5];

// Correction, ruling, test, training data: driven by the reader's ruling in
// error 6. The test really runs the router on the second file.
export default function FeedbackLoop() {
  const { state, dispatch } = useDemo();
  const ruling = state.rulings[0];
  const option = ERROR_SIX.ruling?.options.find((o) => o.id === ruling?.treatment);

  let passes = false;
  if (ruling && ERROR_SIX.replay) {
    const second = applyPatch(fileById(ERROR_SIX.replay.file), ERROR_SIX.replay.patch);
    const hop = settle(second, ERROR_SIX, { rulings: [ruling] }).hops[0];
    passes = hop?.to === "attorney" && hop.ruling?.id === ruling.id;
  }

  const go = (replay: boolean) => {
    dispatch({ type: "start", scenarioId: ERROR_SIX.id, replay });
    showDemo();
  };

  return (
    <div className="bl-loop">
      <ol className="bl-loop__steps">
        <li>
          <h3>Correction</h3>
          <p>{option ? `You chose: ${option.label.toLowerCase()}.` : "An attorney answers the packet for error 6."}</p>
        </li>
        <li>
          <h3>Ruling</h3>
          <p>
            {ruling
              ? `${ruling.id}, effective ${ruling.effective}, consular route.`
              : "Saved with an effective date and a filing route."}
          </p>
          <p className="bl-loop__path">
            E-2 › Source of funds › {RULES.origin.name} rule › {RULES.origin.citation} › {ruling?.id ?? "ruling"}
          </p>
        </li>
        <li>
          <h3>Test</h3>
          <p>The same error on a second file must reach the attorney with the ruling attached.</p>
          {ruling ? (
            <StatusTag tone={passes ? "proven" : "failed"} word={passes ? "Passes" : "Fails"} />
          ) : (
            <StatusTag tone="neutral" word="Not run yet" />
          )}
        </li>
        <li>
          <h3>Training data</h3>
          <p>Queued, and used only after attorney sign-off and client consent.</p>
        </li>
      </ol>
      <button type="button" className="bl-btn" onClick={() => go(Boolean(ruling))}>
        {ruling ? "Replay error 6 on a second file" : "Rule on error 6"}
      </button>
    </div>
  );
}
