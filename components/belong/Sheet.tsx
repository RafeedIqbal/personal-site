"use client";

import { useState } from "react";
import { KIND_NAMES, RULES, docById } from "@/lib/belong/checks";
import type { CaseFile, CheckResult, Doc } from "@/lib/belong/types";
import { StatusTag, type Tone } from "./Status";

// Synthetic document rendering: fictional letterhead, original-language
// lines and an English reading aid. No photos, no real letterheads.
export function DocSheet({
  doc,
  highlight,
  tone = "routed",
  crop = false,
}: {
  doc: Doc;
  highlight?: string;
  tone?: Tone;
  crop?: boolean;
}) {
  const index = doc.lines.findIndex((line) => line.id === highlight);
  const lines =
    crop && index >= 0
      ? doc.lines.slice(Math.max(0, index - 1), index + 2)
      : doc.lines;
  return (
    <figure className="bl-sheet" data-crop={crop || undefined}>
      <div className="bl-sheet__head">
        <span className="bl-sheet__issuer">{doc.issuer}</span>
        <span className="bl-num">{doc.date}</span>
      </div>
      <p className="bl-sheet__title" lang={doc.lang}>
        {doc.original ?? doc.title}
      </p>
      <ol className="bl-sheet__lines">
        {lines.map((line) => (
          <li key={line.id} data-hl={line.id === highlight ? tone : undefined}>
            <span lang={doc.lang}>{line.text}</span>
            {line.gloss && <span className="bl-sheet__gloss">{line.gloss}</span>}
            <span className="bl-sheet__pg bl-num">p.&nbsp;{line.page ?? 1}</span>
          </li>
        ))}
      </ol>
      {doc.lang === "de" && (
        <figcaption className="bl-sheet__cap">
          English lines are simulated machine translation, a reading aid only.
          A filing needs a certified translation.
        </figcaption>
      )}
    </figure>
  );
}

export function DocFacts({ doc }: { doc: Doc }) {
  return (
    <dl className="bl-facts">
      <div>
        <dt>Labeled as</dt>
        <dd>
          {KIND_NAMES[doc.sort.label]}, <span className="bl-num">{doc.sort.confidence.toFixed(2)}</span>{" "}
          <span className="bl-sim">Simulated model output</span>
        </dd>
      </div>
      <div>
        <dt>Pages</dt>
        <dd className="bl-num">{doc.pages}</dd>
      </div>
      <div>
        <dt>Language</dt>
        <dd>{doc.lang === "de" ? "German" : "English"}</dd>
      </div>
    </dl>
  );
}

const RESULT_TONE: Record<CheckResult["status"], { tone: Tone; word: string }> = {
  pass: { tone: "proven", word: "Proven" },
  fail: { tone: "failed", word: "Failed" },
  info: { tone: "neutral", word: "Not counted" },
};

function CheckRow({ result, file }: { result: CheckResult; file: CaseFile }) {
  const [open, setOpen] = useState(false);
  const rule = RULES[result.rule];
  const doc = result.src ? docById(file, result.src.doc) : undefined;
  const line = doc?.lines.find((l) => l.id === result.src?.line);
  const status = RESULT_TONE[result.status];
  const panelId = `ev-${result.rule}-${result.target}`.replace(/[^a-z0-9-]/gi, "-");
  return (
    <li className="bl-check">
      <div className="bl-check__head">
        <span className="bl-check__name">{rule.name}</span>
        <StatusTag {...status} />
      </div>
      <p className="bl-check__detail">{result.detail}</p>
      <button
        type="button"
        className="bl-link-btn"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        {result.status === "pass" ? "Why is this green?" : "Show the evidence"}
      </button>
      {open && (
        <div className="bl-evidence" id={panelId}>
          {doc && (
            <DocSheet
              doc={doc}
              highlight={result.src?.line}
              tone={status.tone === "neutral" ? "routed" : status.tone}
              crop
            />
          )}
          <dl className="bl-facts">
            {result.extracted && (
              <div>
                <dt>Extracted value</dt>
                <dd className="bl-num">{result.extracted}</dd>
              </div>
            )}
            {doc && (
              <div>
                <dt>Source</dt>
                <dd>
                  {doc.title}, page <span className="bl-num">{line?.page ?? 1}</span>
                </dd>
              </div>
            )}
            <div>
              <dt>Rule</dt>
              <dd>{rule.text}</dd>
            </div>
            <div>
              <dt>Citation</dt>
              <dd className="bl-num">{rule.citation ?? "Arithmetic, no citation needed"}</dd>
            </div>
            <div>
              <dt>Reviewer</dt>
              <dd>{result.reviewer}</dd>
            </div>
          </dl>
        </div>
      )}
    </li>
  );
}

export function NodeChecks({
  results,
  file,
}: {
  results: CheckResult[];
  file: CaseFile;
}) {
  if (results.length === 0) {
    return <p className="bl-muted">No checks attach to this item.</p>;
  }
  return (
    <ul className="bl-checks">
      {results.map((result) => (
        <CheckRow key={`${result.rule}-${result.target}-${result.status}`} result={result} file={file} />
      ))}
    </ul>
  );
}
