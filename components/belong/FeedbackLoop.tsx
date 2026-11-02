"use client";

import { applyPatch, settle } from "@/lib/belong/checks";
import { SCENARIOS, fileById } from "@/lib/belong/data";
import { useDemo } from "./demo";
import { StatusTag } from "./Status";

const ERROR_SIX = SCENARIOS.find((s) => s.ruling) ?? SCENARIOS[5];

// Correction, ruling, test, training data: driven by the reader's ruling, and
// the test really runs the router on the second file.
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
    document.getElementById("instrument")?.scrollIntoView({ block: "start" });
  };

  return (
    <div className="bl-loop">
      <ol className="bl-loop__steps">
        <li>
          <h3>Correction</h3>
          {option ? (
            <p>You chose: {option.label.toLowerCase()}.</p>
          ) : (
            <p className="bl-muted">Waiting for an attorney’s answer on error 6.</p>
          )}
        </li>
        <li>
          <h3>Ruling</h3>
          {ruling ? (
            <p>
              <span className="bl-num">{ruling.id}</span>, consular route, effective{" "}
              <span className="bl-num">{ruling.effective}</span>. Scoped to transfers from a spouse into the
              investor’s sole account.
            </p>
          ) : (
            <p className="bl-muted">None yet.</p>
          )}
        </li>
        <li>
          <h3>Test</h3>
          <pre className="bl-code">
            <code>{`test("spouse transfer goes to the attorney with ${ruling?.id ?? "R-1"}", () => {
  const item = settle(secondFile, error6, { rulings });
  expect(item.hops[0].to).toBe("attorney");
  expect(item.hops[0].ruling.id).toBe("${ruling?.id ?? "R-1"}");
});`}</code>
          </pre>
          {ruling ? (
            passes ? (
              <StatusTag tone="proven" word="Passes, run in your browser" />
            ) : (
              <StatusTag tone="failed" word="Fails" />
            )
          ) : (
            <StatusTag tone="neutral" word="Not run yet" />
          )}
        </li>
        <li>
          <h3>Approved training data</h3>
          <p>
            The packet and the attorney’s answer are queued as a training example. No model sees it until an
            attorney signs off and the client’s consent covers it.
          </p>
          <StatusTag tone={ruling ? "unsure" : "neutral"} word={ruling ? "Waiting for sign-off" : "Nothing queued"} />
        </li>
      </ol>
      <p className="bl-loop__cta">
        {ruling ? (
          <button type="button" className="bl-btn" onClick={() => go(true)}>
            Replay error 6 on a second file
          </button>
        ) : (
          <button type="button" className="bl-btn" onClick={() => go(false)}>
            Rule on error 6
          </button>
        )}
      </p>
    </div>
  );
}
