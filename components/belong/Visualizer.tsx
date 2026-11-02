"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LAYERS, RULES, docById, logFor, money, nodeResults } from "@/lib/belong/checks";
import { GATES, SCENARIOS } from "@/lib/belong/data";
import type { Tiles } from "@/lib/belong/types";
import { HOLD_WORDS, docTone, nodeTone, useDemo, type View } from "./demo";
import { destinationName, RouteCard, type SheetMode } from "./RouteCard";
import { DocFacts, DocSheet, NodeChecks } from "./Sheet";
import { StatusTag, type Tone } from "./Status";
import { FundTrail } from "./Trail";
import { useFocusTrap } from "./useFocusTrap";

function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

const SINGLE_STAGES = [
  { id: "documents", name: "Documents" },
  { id: "model", name: "One model call" },
  { id: "draft", name: "Draft" },
];

// --------------------------------------------------------------- status copy

function statusText(view: View): string {
  const { run, scenario, settlement } = view;
  if (!run || !scenario) {
    return "Clean file. Every node is proven and the tiles are at baseline. Pick an error to inject.";
  }
  if (run.singlePass) {
    return view.settled
      ? `Generic single-pass pipeline: every label stays green. ${scenario.singlePass.result}`
      : "Generic single-pass pipeline: one model reads the whole file once.";
  }
  const primary = settlement.primary;
  switch (run.phase) {
    case "injected":
      return run.replay
        ? "Replaying error 6 on a second fictional file: EUR 8,000 of Tobias Probe's savings came from a spouse."
        : `Error ${scenario.id} injected. ${scenario.injection}`;
    case "running":
      return "The token is moving through the layers.";
    case "caught":
      return primary
        ? `Caught at ${LAYERS[view.catchIndex].name}. ${primary.detail}`
        : "No layer caught anything.";
    case "routed":
      return `Routed to ${settlement.hops.map((h) => destinationName(view, h.to)).join(", then ")}.`;
    case "resolved":
      if (settlement.outcome === "awaiting-ruling") {
        return "Reserved for the attorney. You play the attorney here: choose a treatment in the route card.";
      }
      if (settlement.outcome === "ruling-attached") {
        return `Sent straight to the attorney with ruling ${settlement.hops[0].ruling?.id} attached. Confirm it in the route card.`;
      }
      return scenario.outcome;
    case "learned":
      return run.replay
        ? `Ruling ${settlement.hops[0].ruling?.id} applied with one confirmation.`
        : "Ruling saved. Replay the same error on a second file to see it used.";
  }
}

const OUTCOME_NOTES = {
  clear: { tone: "proven", note: "Nothing to resolve" },
  closed: { tone: "proven", note: "Corrected" },
  "waiting-client": { tone: "unsure", note: "Waiting on the client" },
  reserved: { tone: "unsure", note: "Reserved for the attorney" },
  "awaiting-ruling": { tone: "unsure", note: "Waiting for your ruling" },
  "ruling-attached": { tone: "routed", note: "Ruling attached" },
  ruled: { tone: "proven", note: "Ruled" },
} as const;

type StageTone = Tone | "idle" | "skip";

function stageState(view: View, i: number): { tone: StageTone; note: string } {
  const { run, settlement, shown } = view;
  const docs = shown.documents.length;
  const passNotes = [`${docs} documents read`, `${docs} labeled`, "Schemas valid", "All checks pass"];
  if (!run) {
    return i < 4 ? { tone: "proven", note: passNotes[i] } : { tone: "idle", note: "Nothing flagged" };
  }
  if (run.singlePass) {
    const notes = [`${docs} documents`, "Labels and amounts", "Every label green"];
    return run.token >= i && run.phase !== "injected"
      ? { tone: "proven", note: notes[i] }
      : { tone: "idle", note: "" };
  }
  const c = view.catchIndex;
  const reached = run.phase !== "injected" && run.token >= i;
  if (i < c) return reached || view.checked ? { tone: "proven", note: passNotes[i] } : { tone: "idle", note: "" };
  if (i === c) {
    if (!view.checked) return { tone: reached ? "pending" : "idle", note: reached ? "Checking" : "" };
    const rule = settlement.primary ? RULES[settlement.primary.rule].name : "";
    return { tone: "failed", note: `Caught: ${rule}` };
  }
  if (i < 4) return view.checked ? { tone: "skip", note: "Not reached" } : { tone: "idle", note: "" };
  if (i === 4) {
    return run.token >= 4
      ? { tone: "routed", note: settlement.hops.map((h) => destinationName(view, h.to)).join(", then ") }
      : { tone: "idle", note: "" };
  }
  if (i === 5) return view.settled ? OUTCOME_NOTES[settlement.outcome] : { tone: "idle", note: "" };
  if (run.phase === "learned") {
    const id = settlement.hops[0]?.ruling?.id ?? "R-1";
    return { tone: "proven", note: run.replay ? `Ruling ${id} reused` : "Ruling saved" };
  }
  return { tone: "idle", note: run.scenarioId === 6 && view.settled ? "After your ruling" : "" };
}

// --------------------------------------------------------------- pieces

function ScenarioBar() {
  const { state, dispatch, view } = useDemo();
  const { run, scenario } = view;
  return (
    <div className="bl-bar">
      <div className="bl-bar__row">
        <div className="bl-bar__chips" role="group" aria-label="Errors you can inject">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              id={`chip-${s.id}`}
              type="button"
              className="bl-chip"
              aria-pressed={run?.scenarioId === s.id && !run.replay}
              onClick={() => dispatch({ type: "start", scenarioId: s.id })}
            >
              <span className="bl-chip__n bl-num">{s.id}</span>
              {s.chip}
            </button>
          ))}
        </div>
        <div className="bl-bar__tools">
          <button
            type="button"
            className="bl-btn bl-btn--quiet"
            onClick={() => dispatch({ type: "reset" })}
            disabled={!run}
          >
            Reset
          </button>
          <button
            type="button"
            role="switch"
            aria-checked={state.singlePass}
            className="bl-switch"
            onClick={() => dispatch({ type: "singlePass", on: !state.singlePass })}
          >
            <span className="bl-switch__track" aria-hidden="true" />
            Single-pass view
          </button>
        </div>
      </div>
      <p className="bl-bar__desc">
        {run && scenario ? (
          <>
            <span className="bl-bar__type">{run.replay ? "Replay, second file" : scenario.failureType}</span>
            {run.replay
              ? "EUR 8,000 of Tobias Probe's savings came from a spouse. Ruling R-1 already exists."
              : scenario.injection}
          </>
        ) : (
          <>
            <span className="bl-bar__type">Clean file</span>
            Mara Beispiel, Demo Street Coffee LLC, consular route. One error runs at a time.
          </>
        )}
      </p>
    </div>
  );
}

function Tray() {
  const { dispatch, view } = useDemo();
  const [open, setOpen] = useState(false);
  const docs = view.shown.documents;
  return (
    <div className="bl-tray">
      <button
        type="button"
        className="bl-tray__toggle"
        aria-expanded={open}
        aria-controls="bl-tray-list"
        onClick={() => setOpen((v) => !v)}
      >
        File tray <span className="bl-num">{docs.length} documents</span>
      </button>
      <h3 className="bl-tray__title">
        File tray <span className="bl-num">{docs.length}</span>
      </h3>
      <div id="bl-tray-list" className="bl-tray__list" data-open={open || undefined}>
        {GATES.map((gate) => {
          const inGate = docs.filter((doc) => doc.gate === gate.id);
          if (inGate.length === 0) return null;
          return (
            <div key={gate.id} className="bl-tray__gate">
              <p className="bl-tray__gname">{gate.name}</p>
              <ul>
                {inGate.map((doc) => {
                  const affected = Boolean(view.run) && view.affected.includes(doc.id);
                  return (
                    <li key={doc.id}>
                      <button
                        type="button"
                        className="bl-doc"
                        data-affected={affected || undefined}
                        onClick={() => dispatch({ type: "panel", panel: { kind: "doc", id: doc.id } })}
                      >
                        <span className="bl-doc__thumb" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                        </span>
                        <span className="bl-doc__title">
                          {doc.title}
                          {doc.lang === "de" && (
                            <abbr className="bl-doc__lang" title="German">
                              DE
                            </abbr>
                          )}
                        </span>
                        <span className="bl-doc__meta">
                          <StatusTag {...docTone(view, doc.id)} />
                          {affected && <span className="bl-doc__changed">Changed by this error</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Rail() {
  const { view } = useDemo();
  const { run } = view;
  const stages = run?.singlePass ? SINGLE_STAGES : LAYERS;
  const states = stages.map((_, i) => stageState(view, i));
  const token = run ? Math.max(0, run.token) : 0;
  const tokenTone =
    run && !run.singlePass && view.checked
      ? (states[Math.min(token, stages.length - 1)].tone as string)
      : "ink";
  return (
    <div className="bl-railwrap">
      <ol
        className="bl-rail"
        aria-label={run?.singlePass ? "Generic single-pass pipeline" : "Pipeline layers"}
        style={{ "--n": stages.length, "--t": token } as React.CSSProperties}
      >
        {stages.map((stage, i) => (
          <li key={stage.id} className="bl-stage" data-tone={states[i].tone}>
            <span className="bl-stage__dot" aria-hidden="true" />
            <span className="bl-stage__name">{stage.name}</span>
            <span className="bl-stage__note">{states[i].note}</span>
          </li>
        ))}
        {run && run.phase !== "injected" && (
          <span className="bl-token" data-tone={tokenTone} aria-hidden="true" />
        )}
      </ol>
    </div>
  );
}

const TILE_DEFS: { key: keyof Tiles; label: string; pct?: boolean }[] = [
  { key: "intoEnterprise", label: "Into the enterprise" },
  { key: "qualifying", label: "Qualifying" },
  { key: "atRisk", label: "At risk" },
  { key: "notYetDeployed", label: "Not yet deployed" },
  { key: "weakestControl", label: "Weakest control", pct: true },
];

export function TilesPanel({ view }: { view: View }) {
  const { tiles, baseline, holds } = view;
  const show = (value: number, pct?: boolean) => (pct ? `${value}%` : money("USD", value));
  return (
    <div className="bl-tilewrap">
      <dl className="bl-tiles">
        {TILE_DEFS.map(({ key, label, pct }) => {
          const changed = tiles[key] !== baseline[key];
          return (
            <div key={key} className="bl-tile" data-changed={changed || undefined}>
              <dt>{label}</dt>
              <dd className="bl-tile__v bl-num">{show(tiles[key], pct)}</dd>
              {changed && (
                <dd className="bl-tile__was">
                  was <span className="bl-num">{show(baseline[key], pct)}</span>
                </dd>
              )}
            </div>
          );
        })}
      </dl>
      {holds.length > 0 && (
        <ul className="bl-held" aria-label="Held back from qualifying">
          {holds.map((hold) => (
            <li key={hold.target}>
              <StatusTag {...HOLD_WORDS[hold.kind]} />
              <span className="bl-num">{money("USD", hold.amountUsd)}</span>
              {!hold.counts && <span className="bl-muted">never counted as investment</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Drawer() {
  const { state, dispatch, view } = useDemo();
  const panel = state.panel;
  const heading = useRef<HTMLHeadingElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const box = useRef<HTMLDivElement>(null);
  useFocusTrap(box, Boolean(panel));

  useEffect(() => {
    if (!panel) return;
    if (!returnTo.current && document.activeElement instanceof HTMLElement) {
      returnTo.current = document.activeElement;
    }
    heading.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatch({ type: "panel", panel: null });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel, dispatch]);

  useEffect(() => {
    if (panel || !returnTo.current) return;
    returnTo.current.focus({ preventScroll: true });
    returnTo.current = null;
  }, [panel]);

  if (!panel) return null;
  const doc = panel.kind === "doc" ? docById(view.shown, panel.id) : undefined;
  const node = panel.kind === "node" ? panel.id : null;
  const title = doc
    ? doc.title
    : (FundTrailLabel(view, node as string) ?? "Trail node");

  return (
    <div ref={box} className="bl-drawer" role="dialog" aria-modal="true" aria-labelledby="bl-drawer-title">
      <div className="bl-drawer__head">
        <h3 id="bl-drawer-title" ref={heading} tabIndex={-1}>
          {title}
        </h3>
        <button type="button" className="bl-btn bl-btn--quiet" onClick={() => dispatch({ type: "panel", panel: null })}>
          Close
        </button>
      </div>
      <div className="bl-drawer__body">
        {doc && (
          <>
            <DocFacts doc={doc} />
            <DocSheet doc={doc} highlight={view.settlement.primary?.src?.doc === doc.id ? view.settlement.primary.src.line : undefined} tone="failed" />
          </>
        )}
        {node && (
          <>
            <p className="bl-muted">
              {view.run?.singlePass
                ? "The single-pass pipeline ran no checks here. Below is what the checks find when run separately on the same file."
                : "Every check below ran in your browser on this file."}
            </p>
            <NodeChecks results={nodeResults(view.results, node)} file={view.shown} />
          </>
        )}
      </div>
    </div>
  );
}

function FundTrailLabel(view: View, nodeId: string): string | undefined {
  if (nodeId === "account:savings") return view.shown.accounts.savings.label;
  if (nodeId === "account:us") return view.shown.accounts.us.label;
  if (nodeId === "account:llc") return view.shown.accounts.llc.label;
  if (nodeId === "escrow") return "Purchase escrow";
  if (nodeId === "spend") return "Equipment and lease";
  if (nodeId === "idle") return "Not yet deployed";
  if (nodeId === "note:seller") return "Seller note";
  return view.shown.accounts.savings.credits.find((c) => `credit:${c.id}` === nodeId)?.label;
}

function RunLogBar() {
  const { state } = useDemo();
  const entries = [
    { label: "Closed without an attorney", value: state.log.closedNoAttorney },
    { label: "Sent to the client", value: state.log.sentToClient },
    { label: "Sent to an attorney", value: state.log.sentToAttorney },
    { label: "Rulings created", value: state.log.rulings },
  ];
  return (
    <div className="bl-log">
      <h3 className="bl-log__title">Run log</h3>
      <dl>
        {entries.map((entry) => (
          <div key={entry.label}>
            <dt>{entry.label}</dt>
            <dd className="bl-num">{entry.value}</dd>
          </div>
        ))}
      </dl>
      <p className="bl-log__note">Counts demo events in this visit only. It never claims time saved.</p>
    </div>
  );
}

// --------------------------------------------------------------- instrument

export default function Visualizer() {
  const { state, dispatch, view } = useDemo();
  const reduce = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [sheetFor, setSheetFor] = useState<{ run: number; mode: "peek" | "open" | "closed" } | null>(null);
  const mobile = useMedia("(max-width: 759px)");
  const { run } = state;

  // Drives a run through its phases. Reduced motion jumps to the same end state.
  useEffect(() => {
    if (!run) return;
    const step = (phase: typeof run.phase, token: number, delay: number) => {
      const timer = window.setTimeout(
        () => dispatch({ type: "step", runId: run.id, phase, token }),
        delay,
      );
      return () => window.clearTimeout(timer);
    };
    const last = run.singlePass ? 2 : view.catchIndex;
    if (reduce) {
      // Also settles a run that was mid-animation when reduced motion was turned on.
      if (run.phase === "resolved" || run.phase === "learned") return;
      return step("resolved", run.singlePass ? 2 : 5, 0);
    }
    switch (run.phase) {
      case "injected":
        return step("running", 0, 320);
      case "running":
        if (run.token < last) return step("running", run.token + 1, 240);
        return step(run.singlePass ? "resolved" : "caught", run.token, 240);
      case "caught":
        return step("routed", 4, 520);
      case "routed":
        return step("resolved", 5, 520);
    }
  }, [run, view.catchIndex, reduce, dispatch]);

  useEffect(() => {
    if (!run || run.singlePass || run.phase !== "resolved") return;
    dispatch({ type: "finish", runId: run.id, delta: logFor(view.settlement) });
  }, [run, view.settlement, dispatch]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.05,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const routed = run && !run.singlePass && ["routed", "resolved", "learned"].includes(run.phase);
  const ready = Boolean(run && (routed || (run.singlePass && view.settled)));
  const chosen = run && sheetFor?.run === run.id ? sheetFor.mode : "peek";
  const sheet: SheetMode = !run
    ? "none"
    : !ready
      ? "closed"
      : chosen === "open" || inView
        ? chosen
        : "closed";
  const setSheet = (mode: "peek" | "open" | "closed") => {
    if (!run) return;
    setSheetFor({ run: run.id, mode });
    if (mode === "open") return;
    // Focus follows the sheet: to its peek bar, or to "Show route card" when hidden.
    requestAnimationFrame(() => {
      const next =
        (mode === "peek" && document.querySelector<HTMLElement>("#bl-open-route")) ||
        document.querySelector<HTMLElement>(".bl-show-route");
      next?.focus();
    });
  };

  const edgeTone = (edgeId: string, _from: string, to: string): Tone => {
    const finding = view.settlement.findings.find((f) => f.target === edgeId);
    if (finding && view.checked && !run?.singlePass) return nodeTone(view, to).tone;
    return "neutral";
  };

  return (
    <div ref={root} className="bl-viz bl-ui" id="instrument">
      <ScenarioBar />
      <div className="bl-viz__body">
        <Tray />
        <div className="bl-viz__main">
          <Rail />
          <p className="bl-viz__status" role="status" aria-live="polite">
            {statusText(view)}
          </p>
          <FundTrail
            file={view.shown}
            toneOf={(id) => nodeTone(view, id)}
            edgeTone={edgeTone}
            selected={state.panel?.kind === "node" ? state.panel.id : null}
            onSelect={(id) => dispatch({ type: "panel", panel: { kind: "node", id } })}
            label="Fund trail. Select a node to see its checks."
          />
          <TilesPanel view={view} />
          {ready && sheet === "closed" && (
            <button type="button" className="bl-btn bl-btn--quiet bl-show-route" onClick={() => setSheet("open")}>
              Show route card
            </button>
          )}
        </div>
        <RouteCard sheet={sheet} mobile={mobile} onSheet={setSheet} />
        <Drawer />
      </div>
      <RunLogBar />
    </div>
  );
}
