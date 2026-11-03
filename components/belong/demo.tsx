"use client";

import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import {
  applyPatch,
  computeTiles,
  computeTilesSinglePass,
  evaluate,
  nodeResults,
  settle,
} from "@/lib/belong/checks";
import { FILES, SCENARIOS, fileById } from "@/lib/belong/data";
import type {
  CaseFile,
  CheckResult,
  Hold,
  HoldKind,
  Ruling,
  RunLog,
  Scenario,
  Settlement,
  Tiles,
  Treatment,
} from "@/lib/belong/types";
import type { Tone } from "./Status";

// State for the "Break this file" instrument, shared with the sections that
// reuse its ruling (knowledge graph, feedback loop).

export type Phase =
  | "injected"
  | "running"
  | "caught"
  | "routed"
  | "resolved"
  | "learned";

export interface Run {
  id: number;
  scenarioId: number;
  replay: boolean;
  singlePass: boolean;
  phase: Phase;
  token: number;
  treatment: Treatment | null;
  confirmed: boolean;
}

export type Panel =
  | { kind: "doc"; id: string }
  | { kind: "node"; id: string }
  | { kind: "gate"; id: string }
  | { kind: "packet" };

interface State {
  seq: number;
  run: Run | null;
  singlePass: boolean;
  rulings: Ruling[];
  log: RunLog;
  logged: number[];
  done: number[];
  panel: Panel | null;
}

type Action =
  | { type: "start"; scenarioId: number; replay?: boolean }
  | { type: "step"; runId: number; phase: Phase; token: number }
  | { type: "finish"; runId: number; scenarioId: number; delta: RunLog }
  | { type: "rule"; runId: number; ruling: Ruling; delta: RunLog }
  | { type: "confirm"; runId: number; delta: RunLog }
  | { type: "reset" }
  | { type: "singlePass"; on: boolean }
  | { type: "panel"; panel: Panel | null };

const EMPTY_LOG: RunLog = {
  closedNoAttorney: 0,
  sentToClient: 0,
  sentToAttorney: 0,
  rulings: 0,
};

const addLog = (a: RunLog, b: RunLog): RunLog => ({
  closedNoAttorney: a.closedNoAttorney + b.closedNoAttorney,
  sentToClient: a.sentToClient + b.sentToClient,
  sentToAttorney: a.sentToAttorney + b.sentToAttorney,
  rulings: a.rulings + b.rulings,
});

function freshRun(id: number, scenarioId: number, replay: boolean, singlePass: boolean): Run {
  return {
    id,
    scenarioId,
    replay,
    singlePass,
    phase: "injected",
    token: -1,
    treatment: null,
    confirmed: false,
  };
}

function reducer(state: State, action: Action): State {
  const current = (runId: number) => state.run?.id === runId;
  switch (action.type) {
    case "start": {
      const replay = Boolean(action.replay);
      const singlePass = replay ? false : state.singlePass;
      const seq = state.seq + 1;
      return {
        ...state,
        seq,
        singlePass,
        run: freshRun(seq, action.scenarioId, replay, singlePass),
        panel: null,
      };
    }
    case "step":
      if (!state.run || !current(action.runId)) return state;
      return { ...state, run: { ...state.run, phase: action.phase, token: action.token } };
    case "finish":
      if (state.logged.includes(action.runId)) return state;
      return {
        ...state,
        log: addLog(state.log, action.delta),
        logged: [...state.logged, action.runId],
        done: state.done.includes(action.scenarioId) ? state.done : [...state.done, action.scenarioId],
      };
    case "rule":
      if (!state.run || !current(action.runId)) return state;
      return {
        ...state,
        run: { ...state.run, treatment: action.ruling.treatment, phase: "learned", token: 6 },
        rulings: [...state.rulings, action.ruling],
        log: addLog(state.log, action.delta),
      };
    case "confirm":
      if (!state.run || !current(action.runId)) return state;
      return {
        ...state,
        run: { ...state.run, confirmed: true, phase: "learned", token: 6 },
        log: addLog(state.log, action.delta),
      };
    case "reset":
      return { ...state, run: null, panel: null };
    case "singlePass": {
      // Toggling restarts the current error; a replay restarts on the first file.
      if (!state.run) return { ...state, singlePass: action.on };
      const seq = state.seq + 1;
      return {
        ...state,
        seq,
        singlePass: action.on,
        run: freshRun(seq, state.run.scenarioId, false, action.on),
      };
    }
    case "panel":
      return { ...state, panel: action.panel };
  }
}

export const LAYER_INDEX = { sort: 1, normalize: 2, check: 3 } as const;
const AFTER_CHECKS: Phase[] = ["caught", "routed", "resolved", "learned"];
const SETTLED: Phase[] = ["resolved", "learned"];

export interface View {
  run: Run | null;
  scenario: Scenario | null;
  base: CaseFile;
  file: CaseFile;
  shown: CaseFile;
  settlement: Settlement;
  results: CheckResult[];
  catchIndex: number;
  tiles: Tiles;
  baseline: Tiles;
  holds: Hold[];
  checked: boolean;
  settled: boolean;
  affected: string[];
}

const CLEAN = FILES[0];
const CLEAN_RESULTS = evaluate(CLEAN);

export function derive(state: State): View {
  const { run } = state;
  const scenario = run ? SCENARIOS.find((s) => s.id === run.scenarioId) ?? null : null;
  if (!run || !scenario) {
    const settlement = settle(CLEAN, null);
    const tiles = computeTiles(CLEAN);
    return {
      run: null,
      scenario: null,
      base: CLEAN,
      file: CLEAN,
      shown: CLEAN,
      settlement,
      results: CLEAN_RESULTS,
      catchIndex: -1,
      tiles,
      baseline: tiles,
      holds: [],
      checked: true,
      settled: true,
      affected: [],
    };
  }
  const replay = run.replay && scenario.replay;
  const base = replay ? fileById(replay.file) : CLEAN;
  const file = applyPatch(base, replay ? replay.patch : scenario.patch);
  const rulings = state.rulings.filter((r) => r.runId !== run.id);
  const settlement = settle(file, scenario, {
    rulings,
    treatment: run.treatment,
    confirmed: run.confirmed,
  });
  const checked = AFTER_CHECKS.includes(run.phase);
  const settled = SETTLED.includes(run.phase);
  const baseline = computeTiles(base);
  const shown = settled && !run.singlePass ? settlement.file : file;

  let tiles: Tiles;
  let holds: Hold[] = [];
  if (run.singlePass) tiles = computeTilesSinglePass(file);
  else if (settled) {
    holds = settlement.holds;
    tiles = computeTiles(settlement.file, holds);
  } else if (checked) {
    holds = settlement.flagged;
    tiles = computeTiles(file, holds);
  } else tiles = computeTiles(file);

  const primary = settlement.primary;
  return {
    run,
    scenario,
    base,
    file,
    shown,
    settlement,
    results: settled && !run.singlePass ? evaluate(settlement.file) : settlement.results,
    catchIndex: primary ? LAYER_INDEX[primary.layer] : 3,
    tiles,
    baseline,
    holds,
    checked,
    settled,
    affected: replay ? replay.affected : scenario.affected,
  };
}

export const HOLD_WORDS: Record<HoldKind, { tone: Tone; word: string }> = {
  flagged: { tone: "failed", word: "Flagged" },
  unproven: { tone: "unsure", word: "Unproven" },
  reserved: { tone: "unsure", word: "Reserved" },
  unexplained: { tone: "unsure", word: "Unexplained" },
  excluded: { tone: "failed", word: "Excluded" },
};

const holdNodes = (view: View, hold: Hold) => {
  const finding = view.settlement.findings.find((f) => f.target === hold.target);
  return [hold.target, ...(finding?.nodes ?? [])];
};

// Tone and word for a trail node in the current phase.
export function nodeTone(view: View, nodeId: string): { tone: Tone; word: string } {
  const { run } = view;
  const own = nodeResults(view.results, nodeId);
  const notCounted = own.length > 0 && own.every((r) => r.status === "info");
  if (notCounted) return { tone: "neutral", word: "Not counted" };
  if (run?.singlePass) return { tone: "proven", word: "Proven" };
  if (!run) return { tone: "proven", word: "Proven" };
  if (!view.checked) return { tone: "pending", word: "Checking" };

  const { primary } = view.settlement;
  const isPrimary = primary ? [primary.target, ...primary.nodes].includes(nodeId) : false;
  if (run.phase === "caught" || (run.phase === "routed" && !isPrimary)) {
    const failed = view.settlement.findings.some((f) =>
      [f.target, ...f.nodes].includes(nodeId),
    );
    return failed ? { tone: "failed", word: "Failed" } : { tone: "proven", word: "Proven" };
  }
  if (run.phase === "routed") return { tone: "routed", word: "Routed" };

  const outcome = view.settlement.outcome;
  if (isPrimary && outcome === "ruling-attached") return { tone: "routed", word: "With attorney" };
  const hold = view.holds.find((h) => holdNodes(view, h).includes(nodeId));
  return hold ? HOLD_WORDS[hold.kind] : { tone: "proven", word: "Proven" };
}

export function docTone(view: View, docId: string): { tone: Tone; word: string } {
  const { run } = view;
  if (!run || run.singlePass || !view.checked) return { tone: "proven", word: "Accepted" };
  const flagged = view.settlement.findings.some(
    (f) => f.src?.doc === docId || f.target === `doc:${docId}`,
  );
  if (!flagged) return { tone: "proven", word: "Accepted" };
  if (view.settled) {
    const closed = view.settlement.outcome === "closed";
    return closed ? { tone: "proven", word: "Corrected" } : { tone: "unsure", word: "Open" };
  }
  return { tone: "failed", word: "Flagged" };
}

// Belong-style gate marker: worst document status in the gate, with a count.
export function gateTone(view: View, gateId: string): { tone: Tone; word: string; count: string } {
  const docs = view.shown.documents.filter((doc) => doc.gate === gateId);
  if (docs.length === 0) return { tone: "neutral", word: "Not in this demo", count: "—" };
  const tones = docs.map((doc) => docTone(view, doc.id));
  const accepted = tones.filter((t) => t.tone === "proven").length;
  const worst =
    tones.find((t) => t.tone === "failed") ?? tones.find((t) => t.tone === "unsure") ?? tones[0];
  return { tone: worst.tone, word: worst.word, count: `${accepted}/${docs.length}` };
}

interface DemoContext {
  state: State;
  dispatch: Dispatch<Action>;
  view: View;
}

const Context = createContext<DemoContext | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    seq: 0,
    run: null,
    singlePass: false,
    rulings: [],
    log: EMPTY_LOG,
    logged: [],
    done: [],
    panel: null,
  });
  const view = useMemo(() => derive(state), [state]);
  const value = useMemo(() => ({ state, dispatch, view }), [state, view]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("useDemo needs DemoProvider");
  return value;
}

export { EMPTY_LOG };
