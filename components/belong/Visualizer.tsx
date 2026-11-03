"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LAYERS, RULES, docById, logFor, nodeResults } from "@/lib/belong/checks";
import { GATES, SCENARIOS } from "@/lib/belong/data";
import type { Tiles } from "@/lib/belong/types";
import { HOLD_WORDS, docTone, gateTone, nodeTone, useDemo, type View } from "./demo";
import { destinationName, PacketPanel, RouteCard, type SheetMode } from "./RouteCard";
import { DocFacts, DocSheet, NodeChecks } from "./Sheet";
import { StatusIcon, StatusTag, type Tone } from "./Status";
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

// Phase timing, in ms. One error takes about six seconds end to end.
const PACE = { inject: 900, step: 700, caught: 1300, routed: 1300 };

const SINGLE_STAGES = [
  { id: "documents", name: "Documents" },
  { id: "model", name: "One model call" },
  { id: "draft", name: "Draft" },
];

const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const usd = (value: number) => `$${NUM.format(value)}`;

// --------------------------------------------------------------- copy

const RESOLVED = {
  clear: "Nothing to resolve.",
  closed: "Corrected without an attorney.",
  "waiting-client": "Waiting on the client.",
  reserved: "Reserved for the attorney.",
  "awaiting-ruling": "Your call: pick a treatment in the route card.",
  "ruling-attached": "Ruling attached. Confirm it in the route card.",
  ruled: "Ruled.",
} as const;

function statusText(view: View): string {
  const { run, scenario, settlement } = view;
  if (!run || !scenario) return "Clean file: every node is proven. Pick an error to inject.";
  if (run.singlePass) {
    return view.settled
      ? `Every label stays green. ${scenario.singlePass.result}`
      : "One model reads the whole file once.";
  }
  switch (run.phase) {
    case "injected":
      return run.replay
        ? "Second file: EUR 8,000 of Tobias Probe's savings came from a spouse."
        : scenario.injection;
    case "running":
      return "Running the file through the layers.";
    case "caught":
      return settlement.primary
        ? `Caught at ${LAYERS[view.catchIndex].name}. ${settlement.primary.detail}`
        : "No layer caught anything.";
    case "routed":
      return `Routed to ${settlement.hops.map((h) => destinationName(view, h.to)).join(", then ")}.`;
    case "resolved":
      return RESOLVED[settlement.outcome];
    case "learned":
      return run.replay ? "Ruling reused with one confirmation." : "Ruling saved. Replay it on a second file.";
  }
}

type StageTone = Tone | "idle" | "skip";

function stageTone(view: View, i: number): StageTone {
  const { run, settlement } = view;
  if (!run) return i < 4 ? "proven" : "idle";
  const reached = run.phase !== "injected" && run.token >= i;
  if (run.singlePass) return reached ? "proven" : "idle";
  const c = view.catchIndex;
  if (i < c) return reached || view.checked ? "proven" : "idle";
  if (i === c) return view.checked ? "failed" : reached ? "pending" : "idle";
  if (i < 4) return view.checked ? "skip" : "idle";
  if (i === 4) return run.token >= 4 ? "routed" : "idle";
  if (i === 5) {
    if (!view.settled) return "idle";
    const outcome = settlement.outcome;
    if (outcome === "closed" || outcome === "ruled") return "proven";
    return outcome === "ruling-attached" ? "routed" : "unsure";
  }
  return run.phase === "learned" ? "proven" : "idle";
}

// --------------------------------------------------------------- pieces

function Sidebar() {
  const { state, dispatch, view } = useDemo();
  const { run } = view;
  const log = state.log;
  return (
    <nav className="bl-side" aria-label="Errors you can inject">
      <p className="bl-cap">Break the file</p>
      <ul className="bl-side__list">
        {SCENARIOS.map((s) => {
          const active = run?.scenarioId === s.id && !run.replay;
          const done = state.done.includes(s.id);
          return (
            <li key={s.id}>
              <button
                id={`chip-${s.id}`}
                type="button"
                className="bl-side__item"
                aria-pressed={active}
                data-done={done || undefined}
                onClick={() => dispatch({ type: "start", scenarioId: s.id })}
              >
                <span className="bl-side__mark bl-num" aria-hidden="true">
                  {done && !active ? <StatusIcon tone="proven" /> : s.id}
                </span>
                <span className="bl-side__text">
                  <span className="bl-side__name">{s.chip}</span>
                  <span className="bl-side__sub">{s.failureType}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="bl-side__tools">
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
        <button type="button" className="bl-link-btn" onClick={() => dispatch({ type: "reset" })} disabled={!run}>
          Reset file
        </button>
      </div>
      <dl className="bl-side__log" aria-label="Run log">
        <div>
          <dt>Closed by a model</dt>
          <dd className="bl-num">{log.closedNoAttorney}</dd>
        </div>
        <div>
          <dt>Sent to the client</dt>
          <dd className="bl-num">{log.sentToClient}</dd>
        </div>
        <div>
          <dt>Sent to an attorney</dt>
          <dd className="bl-num">{log.sentToAttorney}</dd>
        </div>
        <div>
          <dt>Rulings</dt>
          <dd className="bl-num">{log.rulings}</dd>
        </div>
      </dl>
    </nav>
  );
}

function Stepper() {
  const { view } = useDemo();
  const { run } = view;
  const stages = run?.singlePass ? SINGLE_STAGES : LAYERS;
  const token = run ? Math.max(0, run.token) : 0;
  const tones = stages.map((_, i) => stageTone(view, i));
  return (
    <div className="bl-stepwrap">
      <ol
        className="bl-steps"
        aria-label={run?.singlePass ? "Single-pass pipeline" : "Pipeline layers"}
        style={{ "--n": stages.length, "--t": token } as React.CSSProperties}
      >
        {stages.map((stage, i) => (
          <li key={stage.id} data-tone={tones[i]}>
            <span className="bl-steps__dot" aria-hidden="true" />
            {stage.name}
            {tones[i] === "failed" && view.settlement.primary && (
              <span className="sr-only">, caught by {RULES[view.settlement.primary.rule].name}</span>
            )}
          </li>
        ))}
        {run && run.phase !== "injected" && (
          <span className="bl-steps__token" data-tone={tones[Math.min(token, stages.length - 1)]} aria-hidden="true" />
        )}
      </ol>
    </div>
  );
}

function useTween(target: number, reduce: boolean) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const origin = from.current;
    const tick = (now: number) => {
      const p = reduce ? 1 : Math.min(1, (now - start) / 700);
      const next = origin + (target - origin) * (1 - (1 - p) ** 3);
      from.current = next;
      setValue(next);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduce]);
  return Math.round(value);
}

const TILE_DEFS: { key: keyof Tiles; label: string; sub: string; tone?: "proven" | "unsure" }[] = [
  { key: "intoEnterprise", label: "Into the enterprise", sub: "Capital contributed" },
  { key: "qualifying", label: "Qualifying", sub: "Traced and committed", tone: "proven" },
  { key: "atRisk", label: "At risk", sub: "Spent or in escrow", tone: "proven" },
  { key: "notYetDeployed", label: "Not yet deployed", sub: "Still in the bank", tone: "unsure" },
  { key: "weakestControl", label: "Weakest control", sub: "Lowest on any route" },
];

function Tile({ def, value, base, reduce }: { def: (typeof TILE_DEFS)[number]; value: number; base: number; reduce: boolean }) {
  const shown = useTween(value, reduce);
  const pct = def.key === "weakestControl";
  const format = (n: number) => (pct ? `${n}%` : usd(n));
  const changed = value !== base;
  return (
    <div className="bl-tile" data-changed={changed || undefined}>
      <dt>{def.label}</dt>
      <dd className="bl-tile__v" data-tone={def.tone}>
        {format(shown)}
      </dd>
      <dd className="bl-tile__sub">{changed ? `was ${format(base)}` : def.sub}</dd>
    </div>
  );
}

function TilesPanel({ view, reduce }: { view: View; reduce: boolean }) {
  return (
    <dl className="bl-tiles">
      {TILE_DEFS.map((def) => (
        <Tile key={def.key} def={def} value={view.tiles[def.key]} base={view.baseline[def.key]} reduce={reduce} />
      ))}
    </dl>
  );
}

function GatesRail() {
  const { dispatch, view } = useDemo();
  const [open, setOpen] = useState(false);
  return (
    <aside className="bl-gates" aria-label="The nine gates">
      <button
        type="button"
        className="bl-gates__toggle"
        aria-expanded={open}
        aria-controls="bl-gate-list"
        onClick={() => setOpen((v) => !v)}
      >
        The nine gates
      </button>
      <p className="bl-cap bl-gates__title">The nine gates</p>
      <ul id="bl-gate-list" className="bl-gates__list" data-open={open || undefined}>
        {GATES.map((gate) => {
          const status = gateTone(view, gate.id);
          const empty = status.count === "—";
          return (
            <li key={gate.id}>
              <button
                type="button"
                className="bl-gate"
                disabled={empty}
                onClick={() => dispatch({ type: "panel", panel: { kind: "gate", id: gate.id } })}
              >
                <span className="bl-gate__mark" data-tone={status.tone} aria-hidden="true" />
                <span className="bl-gate__name">{gate.name}</span>
                <span className="bl-gate__count bl-num">{status.count}</span>
                <span className="sr-only">, {status.word}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

function trailLabel(view: View, nodeId: string): string | undefined {
  const labels: Record<string, string> = {
    "account:savings": view.shown.accounts.savings.label,
    "account:us": view.shown.accounts.us.label,
    "account:llc": view.shown.accounts.llc.label,
    escrow: "Purchase escrow",
    spend: "Equipment and lease",
    idle: "Not yet deployed",
    "note:seller": "Seller note",
  };
  return labels[nodeId] ?? view.shown.accounts.savings.credits.find((c) => `credit:${c.id}` === nodeId)?.label;
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
  let title = "Packet";
  let body: React.ReactNode = <PacketPanel view={view} />;
  if (panel.kind === "doc") {
    const doc = docById(view.shown, panel.id);
    title = doc?.title ?? "Document";
    const primary = view.settlement.primary;
    body = doc && (
      <>
        <DocFacts doc={doc} />
        <DocSheet doc={doc} highlight={primary?.src?.doc === doc.id ? primary.src.line : undefined} tone="failed" />
      </>
    );
  } else if (panel.kind === "node") {
    title = trailLabel(view, panel.id) ?? "Trail node";
    body = (
      <>
        {view.run?.singlePass && (
          <p className="bl-muted">The single-pass pipeline ran none of these checks.</p>
        )}
        <NodeChecks results={nodeResults(view.results, panel.id)} file={view.shown} />
      </>
    );
  } else if (panel.kind === "gate") {
    const gate = GATES.find((g) => g.id === panel.id);
    title = gate?.name ?? "Gate";
    body = (
      <ul className="bl-gate-docs">
        {view.shown.documents
          .filter((doc) => doc.gate === panel.id)
          .map((doc) => (
            <li key={doc.id}>
              <button
                type="button"
                className="bl-gate-doc"
                data-affected={(view.run && view.affected.includes(doc.id)) || undefined}
                onClick={() => dispatch({ type: "panel", panel: { kind: "doc", id: doc.id } })}
              >
                <span>{doc.title}</span>
                <StatusTag {...docTone(view, doc.id)} />
              </button>
            </li>
          ))}
      </ul>
    );
  }

  return (
    <div ref={box} className="bl-drawer" role="dialog" aria-modal="true" aria-labelledby="bl-drawer-title">
      <div className="bl-drawer__head">
        <h3 id="bl-drawer-title" ref={heading} tabIndex={-1}>
          {title}
        </h3>
        <button type="button" className="bl-btn bl-btn--small bl-btn--quiet" onClick={() => dispatch({ type: "panel", panel: null })}>
          Close
        </button>
      </div>
      <div className="bl-drawer__body">{body}</div>
    </div>
  );
}

// --------------------------------------------------------------- the window

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
        return step("running", 0, PACE.inject);
      case "running":
        if (run.token < last) return step("running", run.token + 1, PACE.step);
        return step(run.singlePass ? "resolved" : "caught", run.token, PACE.step);
      case "caught":
        return step("routed", 4, PACE.caught);
      case "routed":
        return step("resolved", 5, PACE.routed);
    }
  }, [run, view.catchIndex, reduce, dispatch]);

  useEffect(() => {
    if (!run || run.singlePass || run.phase !== "resolved") return;
    dispatch({ type: "finish", runId: run.id, scenarioId: run.scenarioId, delta: logFor(view.settlement) });
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
  const sheet: SheetMode = !run ? "none" : !ready ? "closed" : chosen === "open" || inView ? chosen : "closed";
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

  const { scenario, shown, holds } = view;
  const caption = !run || !scenario
    ? "Clean file"
    : run.replay
      ? "Replay, second file"
      : run.singlePass
        ? `Single-pass view, error ${scenario.id} of 6`
        : `Error ${scenario.id} of 6`;
  const caseId = shown.id === "demo-2" ? "DEMO-2026-0002" : "DEMO-2026-0001";
  const trailNote = run?.singlePass
    ? "No checks ran"
    : holds.length === 0
      ? "Every route traced to a lawful origin"
      : `${holds.length} item${holds.length === 1 ? "" : "s"} held back`;
  const status = statusText(view);

  return (
    <div ref={root} className="bl-app bl-ui" id="instrument">
      <div className="bl-app__chrome" aria-hidden="true">
        <i />
        <i />
        <i />
        <span>Break this file · {caption}</span>
      </div>
      <div className="bl-app__top">
        <span className="bl-app__brand">
          <span className="bl-app__mark">Belong</span>
          <span className="bl-app__product">E-2 petition assembly</span>
        </span>
        <span className="bl-app__nav" aria-hidden="true">
          <span>Petitions</span>
          <span>Reference</span>
        </span>
        <span className="bl-app__user">
          <span>
            <b>You</b>
            <small>Immigration attorney</small>
          </span>
          <span className="bl-app__avatar" aria-hidden="true">
            Y
          </span>
        </span>
      </div>
      <div className="bl-app__body">
        <Sidebar />
        <div className="bl-app__main">
          <div className="bl-crumbs">
            <span className="bl-crumbs__path">Petitions /</span>
            <b>{shown.investor.name}</b>
            <span className="bl-num bl-crumbs__id">{caseId}</span>
            <span className="bl-pill bl-pill--soft">E-2</span>
            <span className="bl-crumbs__route">DE → US</span>
          </div>
          <Stepper />
          <p className="bl-status" role="status" aria-live="polite">
            <span key={status} className="bl-fade">
              {status}
            </span>
          </p>
          <TilesPanel view={view} reduce={reduce} />
          <section className="bl-card" aria-labelledby="bl-trail-title">
            <header className="bl-card__head">
              <h3 id="bl-trail-title">Fund-flow trail</h3>
              <p>{trailNote}</p>
              {holds.length > 0 && !run?.singlePass && (
                <ul className="bl-held">
                  {holds.map((hold) => (
                    <li key={hold.target}>
                      <StatusTag {...HOLD_WORDS[hold.kind]} />
                      <span className="bl-num">{usd(hold.amountUsd)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </header>
            <FundTrail
              file={shown}
              toneOf={(id) => nodeTone(view, id)}
              edgeTone={edgeTone}
              selected={state.panel?.kind === "node" ? state.panel.id : null}
              onSelect={(id) => dispatch({ type: "panel", panel: { kind: "node", id } })}
              label="Fund-flow trail. Select a node to see why it is green."
            />
          </section>
          <RouteCard sheet={sheet} mobile={mobile} onSheet={setSheet} />
          {ready && sheet === "closed" && (
            <button type="button" className="bl-btn bl-btn--small bl-btn--quiet bl-show-route" onClick={() => setSheet("open")}>
              Show route card
            </button>
          )}
        </div>
        <GatesRail />
      </div>
      <Drawer />
    </div>
  );
}
