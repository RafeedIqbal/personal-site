"use client";

import { useEffect, useRef } from "react";
import {
  KIND_NAMES,
  RULES,
  docById,
  fill,
  makeRuling,
  money,
} from "@/lib/belong/checks";
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
import { Simulated, StatusTag } from "./Status";
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

function reason(view: View, hop: RouteHop, index: number): string {
  const name = destinationName(view, hop.to);
  if (hop.reason === "ruling") {
    return `A hard rule sends ${QUESTION_NAMES[hop.question]} questions to the attorney. Ruling ${hop.ruling?.id} is attached, so the attorney confirms instead of starting over.`;
  }
  if (hop.reason === "reserved") {
    const lead = index > 0 ? `The ${destinationName(view, "domain").toLowerCase()} raised a ${QUESTION_NAMES[hop.question]} question. ` : "";
    return `${lead}A hard rule reserves ${QUESTION_NAMES[hop.question]} questions to the attorney. No model can override it.`;
  }
  if (hop.reason === "model-failed") {
    return "The model's answer did not satisfy the arithmetic, so the item goes to the attorney.";
  }
  if (hop.reason === "unsure") return "The router was unsure, so the item goes to an attorney.";
  return `The ${name.toLowerCase()} is the cheapest destination likely to resolve this. Router score ${hop.score?.toFixed(2)}, simulated.`;
}

const ROUTES = {
  consular: "Consular, DS-160 and DS-156E",
  uscis: "Inside the US, Form I-129",
};

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
            <dd>
              <span className="bl-num">{primary.extracted}</span>
              {primary.reviewer.includes("simulated") && (
                <>
                  {" "}
                  <Simulated />
                </>
              )}
            </dd>
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
          <dd className="bl-num">{RULES[primary.rule].citation ?? "Arithmetic, no citation needed"}</dd>
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

function Resolution() {
  const { state, dispatch, view } = useDemo();
  const { run, scenario, settlement, file } = view;
  const result = useRef<HTMLDivElement>(null);
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

  return (
    <div className="bl-route__section">
      <h4 className="bl-route__k">Resolution</h4>
      {scenario.model && hops.some((h) => h.to === scenario.model?.kind) && (
        <div className="bl-model">
          <p className="bl-model__who">{scenario.model.name}</p>
          <p>{scenario.model.output}</p>
          <Simulated />
          {outcome === "closed" && (
            <p className="bl-model__check">
              <StatusTag tone="proven" word="Proven" /> The balance check re-ran on the new value and passed.
            </p>
          )}
        </div>
      )}
      {scenario.client && hops.some((h) => h.to === "client") && (
        <div className="bl-model">
          <p className="bl-model__who">Client portal message, in {scenario.client.language}</p>
          <p lang="de">{scenario.client.message}</p>
          <p className="bl-sheet__gloss">{scenario.client.gloss}</p>
          <Simulated>Simulated message and translation</Simulated>
        </div>
      )}

      {outcome === "awaiting-ruling" && scenario.ruling && (
        <fieldset className="bl-ruling">
          <legend>You are the attorney. How should this be treated?</legend>
          <p className="bl-ruling__flag">Simulated ruling, not legal advice</p>
          {scenario.ruling.options.map((option) => (
            <button key={option.id} type="button" className="bl-ruling__opt" onClick={() => rule(option.id)}>
              <span className="bl-ruling__label">{option.label}</span>
              <span className="bl-ruling__effect">{option.effect}</span>
            </button>
          ))}
        </fieldset>
      )}

      {outcome === "ruling-attached" && attached && (
        <div className="bl-ruling">
          <p className="bl-ruling__flag">Simulated ruling, not legal advice</p>
          <p>
            <span className="bl-num">{attached.id}</span>, effective{" "}
            <span className="bl-num">{attached.effective}</span>: {attached.text}
          </p>
          <button type="button" className="bl-btn" onClick={confirm}>
            Confirm ruling {attached.id}
          </button>
        </div>
      )}

      {outcome === "ruled" && (
        <div className="bl-ruling" ref={result} tabIndex={-1}>
          <p className="bl-ruling__flag">Simulated ruling, not legal advice</p>
          <p>
            {run.replay
              ? `Ruling ${attached?.id} applied after one confirmation. No new policy was needed.`
              : `Saved as ruling ${state.rulings[state.rulings.length - 1]?.id}: ${state.rulings[state.rulings.length - 1]?.text}`}
          </p>
          {!run.replay && (
            <button
              type="button"
              className="bl-btn"
              onClick={() => dispatch({ type: "start", scenarioId: scenario.id, replay: true })}
            >
              Replay on a second file
            </button>
          )}
        </div>
      )}

      <p className="bl-route__outcome">
        {outcome === "ruled"
          ? scenario.ruling?.options.find((o) => o.id === applied)?.effect
          : scenario.outcome}
      </p>
      <p className="bl-muted">
        <span className="bl-route__k-inline">Captured:</span> {scenario.capture}
      </p>
    </div>
  );
}

function SinglePassCard({ view }: { view: View }) {
  const { scenario, file, settled } = view;
  return (
    <>
      <h3 className="bl-route__title" tabIndex={-1}>Generic single-pass pipeline</h3>
      <p>
        One model reads the file and writes the draft. No checks run, so every
        label stays green. This is a generic pattern, not Belong&rsquo;s product.
      </p>
      {scenario && settled && (
        <div className="bl-route__section">
          <h4 className="bl-route__k">Draft line it writes</h4>
          <blockquote className="bl-draft">{fill(scenario.singlePass.draft, file)}</blockquote>
          <p>
            <StatusTag tone="proven" word="Proven" /> {scenario.singlePass.result}
          </p>
          <Simulated />
          <p className="bl-muted">Turn off the single-pass view to see the same error caught.</p>
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
  const { view } = useDemo();
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

  if (mobile && sheet === "peek" && run) {
    const title = run.singlePass
      ? "Generic single-pass pipeline"
      : `Routed to ${settlement.hops.map((h) => destinationName(view, h.to)).join(", then ")}`;
    return (
      <aside className="bl-route" aria-label="Route card" data-sheet="peek">
        <p className="bl-peek__title">{title}</p>
        <div className="bl-peek__actions">
          <button type="button" id="bl-open-route" className="bl-btn" onClick={() => onSheet("open")}>
            Open route card
          </button>
          <button type="button" className="bl-btn bl-btn--quiet" onClick={() => onSheet("closed")}>
            Hide
          </button>
        </div>
      </aside>
    );
  }

  let body: React.ReactNode;
  if (!run || !scenario) {
    body = (
      <>
        <h3 className="bl-route__title" tabIndex={-1}>Route card</h3>
        <p className="bl-muted">
          When a layer catches an error, this card shows where the item goes,
          why it goes there, and the packet the resolver receives.
        </p>
      </>
    );
  } else if (run.singlePass) {
    body = <SinglePassCard view={view} />;
  } else if (!routed || !settlement.primary) {
    body = (
      <>
        <h3 className="bl-route__title" tabIndex={-1}>Route card</h3>
        <p className="bl-muted">Waiting for a layer to catch the error.</p>
      </>
    );
  } else {
    const primary = settlement.primary;
    const doc = primary.src ? docById(file, primary.src.doc) : undefined;
    const gate = GATES.find((g) => g.id === doc?.gate)?.name ?? "Lawful source";
    const usdNote = primary.amountLabel.startsWith("EUR")
      ? `, ${money("USD", primary.amountUsd)}`
      : "";
    const hard = settlement.hops[0].hard;
    body = (
      <>
        <h3 className="bl-route__title" tabIndex={-1}>
          Routed to{" "}
          {settlement.hops.map((hop, i) => (
            <span key={i}>
              {i > 0 && ", then "}
              {destinationName(view, hop.to)}
            </span>
          ))}
        </h3>
        {settlement.hops.map((hop, i) => (
          <p key={i}>{reason(view, hop, i)}</p>
        ))}

        <div className="bl-route__section">
          <h4 className="bl-route__k">Router inputs</h4>
          <dl className="bl-facts bl-facts--grid">
            <div>
              <dt>Gate</dt>
              <dd>{gate}</dd>
            </div>
            <div>
              <dt>Document type</dt>
              <dd>{doc ? KIND_NAMES[doc.sort.label] : "Ledger"}</dd>
            </div>
            <div>
              <dt>Failed check</dt>
              <dd>{RULES[primary.rule].name}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>
                <span className="bl-num">{doc ? doc.sort.confidence.toFixed(2) : "n/a"}</span>{" "}
                <span className="bl-sim">Demo value</span>
              </dd>
            </div>
            <div>
              <dt>Amount at issue</dt>
              <dd className="bl-num">
                {primary.amountLabel}
                {usdNote}
              </dd>
            </div>
            <div>
              <dt>Language</dt>
              <dd>{doc?.lang === "de" ? "German" : "English"}</dd>
            </div>
            <div>
              <dt>Filing route</dt>
              <dd>{ROUTES[file.investor.route]}</dd>
            </div>
            <div>
              <dt>Past correction rate</dt>
              <dd>
                {hard ? "Not used, hard rule" : scenario.router?.correctionRate}{" "}
                {!hard && <span className="bl-sim">Demo value</span>}
              </dd>
            </div>
          </dl>
        </div>

        <div className="bl-route__section">
          <h4 className="bl-route__k">Packet</h4>
          <Packet file={file} scenario={scenario} primary={primary} />
        </div>
        <Resolution />
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
