"use client";

import { useEffect, useRef } from "react";
import { KIND_NAMES, RULES, docById, fill, makeRuling, money } from "@/lib/belong/checks";
import { GATES } from "@/lib/belong/data";
import type {
  CaseFile,
  Destination,
  Finding,
  RouteHop,
  RunLog,
  Scenario,
  Treatment,
} from "@/lib/belong/types";
import { EMPTY_LOG, useDemo, type View } from "./demo";
import { DocSheet } from "./Sheet";
import { useFocusTrap } from "./useFocusTrap";

export type SheetMode = "none" | "peek" | "open" | "closed";

export function destinationName(view: View, to: Destination): string {
  if (to === "domain") return view.scenario?.model?.name ?? "Domain model";
  return { frontier: "Frontier model", client: "Client portal", attorney: "Attorney", domain: "" }[to];
}

const QUESTION_NAMES = {
  "re-read": "a re-read",
  "missing-evidence": "missing evidence",
  "document-meaning": "what a document means",
  "unexplained-funds": "unexplained money",
  "secured-debt": "secured debt",
  commingled: "commingled funds",
  "loan-or-gift": "gift or loan",
} as const;

function reason(hop: RouteHop): string {
  if (hop.reason === "ruling") {
    return `Ruling ${hop.ruling?.id} already covers ${QUESTION_NAMES[hop.question]}, so the attorney confirms instead of starting over.`;
  }
  if (hop.reason === "reserved") {
    return `Questions about ${QUESTION_NAMES[hop.question]} are reserved to the attorney by a hard rule.`;
  }
  if (hop.reason === "model-failed") return "The model's answer failed the arithmetic, so an attorney decides.";
  if (hop.reason === "unsure") return "The router was unsure, so an attorney decides.";
  return `The cheapest destination likely to resolve it (router score ${hop.score?.toFixed(2)}).`;
}

const ROUTES = {
  consular: "Consular, DS-160 and DS-156E",
  uscis: "Inside the US, Form I-129",
};

// The packet a resolver receives: the page crop and the one exact question.
export function Packet({
  file,
  scenario,
  primary,
}: {
  file: CaseFile;
  scenario: Scenario;
  primary: Finding;
}) {
  // When a domain model found the decisive line, the attorney sees that line.
  const src = (scenario.model?.kind === "domain" && scenario.model.src) || primary.src;
  const doc = src ? docById(file, src.doc) : undefined;
  return (
    <>
      {doc && src && <DocSheet doc={doc} highlight={src.line} tone="failed" crop />}
      <dl className="bl-facts">
        {primary.extracted && (
          <div>
            <dt>Extracted value</dt>
            <dd className="bl-num">{primary.extracted}</dd>
          </div>
        )}
        <div>
          <dt>Failed rule</dt>
          <dd>
            {RULES[primary.rule].name}. {primary.detail}
          </dd>
        </div>
        <div>
          <dt>Citation</dt>
          <dd className="bl-num">{RULES[primary.rule].citation ?? "Arithmetic"}</dd>
        </div>
        <div>
          <dt>Candidate answers</dt>
          <dd>
            <ul className="bl-candidates">
              {scenario.packet.candidates.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>The question</dt>
          <dd className="bl-question">{fill(scenario.packet.question, file)}</dd>
        </div>
      </dl>
    </>
  );
}

// Everything behind "Open packet": router inputs, the packet, and what the
// resolver sent back.
export function PacketPanel({ view }: { view: View }) {
  const { scenario, settlement, file } = view;
  const primary = settlement.primary;
  if (!scenario || !primary) return null;
  const doc = primary.src ? docById(file, primary.src.doc) : undefined;
  const hard = settlement.hops[0]?.hard;
  const inputs = [
    ["Gate", GATES.find((g) => g.id === doc?.gate)?.name ?? "Source of funds"],
    ["Document type", doc ? KIND_NAMES[doc.sort.label] : "Ledger"],
    ["Failed check", RULES[primary.rule].name],
    ["Confidence", doc ? doc.sort.confidence.toFixed(2) : "n/a"],
    [
      "Amount at issue",
      primary.amountLabel.startsWith("EUR")
        ? `${primary.amountLabel}, ${money("USD", primary.amountUsd)}`
        : primary.amountLabel,
    ],
    ["Language", doc?.lang === "de" ? "German" : "English"],
    ["Filing route", ROUTES[file.investor.route]],
    ["Past correction rate", hard ? "Not used, hard rule" : (scenario.router?.correctionRate ?? "")],
  ];
  return (
    <>
      <section className="bl-panel-sec">
        <h4>Router inputs</h4>
        <dl className="bl-facts bl-facts--grid">
          {inputs.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="bl-panel-sec">
        <h4>Packet</h4>
        <Packet file={file} scenario={scenario} primary={primary} />
      </section>
      {view.settled && scenario.model && settlement.hops.some((h) => h.to === scenario.model?.kind) && (
        <section className="bl-panel-sec">
          <h4>{scenario.model.name} answered</h4>
          <p>{scenario.model.output}</p>
        </section>
      )}
      {view.settled && scenario.client && settlement.hops.some((h) => h.to === "client") && (
        <section className="bl-panel-sec">
          <h4>Sent to the client, in {scenario.client.language}</h4>
          <p lang="de">{scenario.client.message}</p>
          <p className="bl-sheet__gloss">{scenario.client.gloss}</p>
        </section>
      )}
    </>
  );
}

function Actions() {
  const { state, dispatch, view } = useDemo();
  const { run, scenario, settlement, file } = view;
  const result = useRef<HTMLParagraphElement>(null);
  const decided = Boolean(run?.treatment || run?.confirmed);
  // The ruling buttons disappear once used, so focus moves to what they produced.
  useEffect(() => {
    if (decided) result.current?.focus({ preventScroll: true });
  }, [decided, run?.id]);
  if (!run || !scenario || !view.settled) return null;
  const { outcome, hops } = settlement;
  const attached = hops[0]?.ruling;
  const applied = run.treatment ?? (run.confirmed ? attached?.treatment : undefined);

  const rule = (treatment: Treatment) => {
    const ruling = makeRuling(
      scenario,
      treatment,
      file,
      run.id,
      new Date().toLocaleDateString("en-CA"),
      state.rulings.length,
    );
    const delta: RunLog = { ...EMPTY_LOG, rulings: 1, sentToClient: treatment === "trace" ? 1 : 0 };
    dispatch({ type: "rule", runId: run.id, ruling, delta });
  };
  const confirm = () => {
    const delta: RunLog = { ...EMPTY_LOG, sentToClient: attached?.treatment === "trace" ? 1 : 0 };
    dispatch({ type: "confirm", runId: run.id, delta });
  };

  if (outcome === "awaiting-ruling" && scenario.ruling) {
    return (
      <div className="bl-route__actions" role="group" aria-label="Rule as the attorney">
        {scenario.ruling.options.map((option) => (
          <button key={option.id} type="button" className="bl-btn bl-btn--small" onClick={() => rule(option.id)}>
            {option.label}
          </button>
        ))}
      </div>
    );
  }
  if (outcome === "ruling-attached" && attached) {
    return (
      <div className="bl-route__actions">
        <button type="button" className="bl-btn bl-btn--small bl-btn--primary" onClick={confirm}>
          Confirm ruling {attached.id}
        </button>
      </div>
    );
  }
  const text =
    outcome === "ruled"
      ? scenario.ruling?.options.find((o) => o.id === applied)?.effect
      : scenario.outcome;
  return (
    <>
      <p className="bl-route__outcome" ref={result} tabIndex={-1}>
        {outcome === "ruled" && !run.replay && <>Saved as ruling {state.rulings[state.rulings.length - 1]?.id}. </>}
        {outcome === "ruled" && run.replay && <>Ruling {attached?.id} applied. </>}
        {text}
      </p>
      {outcome === "ruled" && !run.replay && (
        <div className="bl-route__actions">
          <button
            type="button"
            className="bl-btn bl-btn--small bl-btn--primary"
            onClick={() => dispatch({ type: "start", scenarioId: scenario.id, replay: true })}
          >
            Replay on a second file
          </button>
        </div>
      )}
    </>
  );
}

export function RouteCard({
  sheet,
  mobile,
  onSheet,
}: {
  sheet: SheetMode;
  mobile: boolean;
  onSheet: (mode: "peek" | "open" | "closed") => void;
}) {
  const { dispatch, view } = useDemo();
  const { run, scenario, settlement, file } = view;
  const routed = run && ["routed", "resolved", "learned"].includes(run.phase);
  const panel = useRef<HTMLElement>(null);
  const modal = mobile && sheet === "open";
  useFocusTrap(panel, modal);
  useEffect(() => {
    if (!modal) return;
    panel.current?.querySelector<HTMLElement>(".bl-route__title")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onSheet("peek");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modal, onSheet]);

  const destinations = settlement.hops.map((h) => destinationName(view, h.to)).join(", then ");

  if (mobile && sheet === "peek" && run) {
    return (
      <aside className="bl-route" aria-label="Route card" data-sheet="peek">
        <p className="bl-peek__title">{run.singlePass ? "Single-pass pipeline" : `Routed to ${destinations}`}</p>
        <div className="bl-peek__actions">
          <button type="button" id="bl-open-route" className="bl-btn bl-btn--small" onClick={() => onSheet("open")}>
            Open
          </button>
          <button type="button" className="bl-btn bl-btn--small bl-btn--quiet" onClick={() => onSheet("closed")}>
            Hide
          </button>
        </div>
      </aside>
    );
  }

  let body: React.ReactNode;
  if (!run || !scenario) {
    body = (
      <p className="bl-route__idle">
        When a layer catches an error, this card shows where it goes and what the resolver is asked.
      </p>
    );
  } else if (run.singlePass) {
    body = (
      <>
        <div className="bl-route__head">
          <h3 className="bl-route__title" tabIndex={-1}>
            <span className="bl-pill" data-tone="proven">
              Single-pass pipeline
            </span>
          </h3>
        </div>
        <p className="bl-route__reason">One model reads the file and writes the draft. Nothing checks it.</p>
        {view.settled && (
          <>
            <blockquote className="bl-draft">{fill(scenario.singlePass.draft, file)}</blockquote>
            <p className="bl-route__outcome">{scenario.singlePass.result}</p>
          </>
        )}
      </>
    );
  } else if (!routed || !settlement.primary) {
    body = <p className="bl-route__idle">Waiting for a layer to catch the error.</p>;
  } else {
    const last = settlement.hops[settlement.hops.length - 1];
    body = (
      <>
        <div className="bl-route__head">
          <h3 className="bl-route__title" tabIndex={-1}>
            <span className="bl-pill" data-tone="routed">
              Routed to {destinations}
            </span>
          </h3>
          <button
            type="button"
            className="bl-link-btn"
            onClick={() => dispatch({ type: "panel", panel: { kind: "packet" } })}
          >
            Open packet
          </button>
        </div>
        <p className="bl-route__reason">{reason(last)}</p>
        <p className="bl-question">{fill(scenario.packet.question, file)}</p>
        <Actions />
      </>
    );
  }

  return (
    <aside
      ref={panel}
      className="bl-route"
      aria-label="Route card"
      data-sheet={sheet}
      role={modal ? "dialog" : undefined}
      aria-modal={modal || undefined}
    >
      {modal && (
        <button type="button" className="bl-route__hide" onClick={() => onSheet("peek")}>
          Close
        </button>
      )}
      {body}
    </aside>
  );
}
