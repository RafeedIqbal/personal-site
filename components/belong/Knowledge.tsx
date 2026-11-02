"use client";

import { RULES, RULE_EFFECTIVE } from "@/lib/belong/checks";
import { useDemo } from "./demo";

// One path through the knowledge graph, from the visa down to a ruling. The
// ruling is whatever the reader decided in error 6.
export default function Knowledge() {
  const { state } = useDemo();
  const ruling = state.rulings[0];
  const nodes = [
    { kind: "Visa", text: "E-2 treaty investor", meta: "Consular and USCIS routes" },
    { kind: "Gate", text: "Lawful source", meta: "Root of this branch" },
    {
      kind: "Requirement",
      text: "Each large deposit traces to a lawful source the investor controls.",
      meta: "Attorney-reviewed wording, pending",
    },
    { kind: "Document types", text: "Savings statement, spouse’s statement", meta: "Both feed the Origin check" },
    {
      kind: "Rule",
      text: `${RULES.origin.name}: ${RULES.origin.text}`,
      meta: `Version 1, effective ${RULE_EFFECTIVE}, plain code`,
    },
    { kind: "Citation", text: RULES.origin.citation ?? "", meta: "Cited at section level" },
  ];
  return (
    <ol className="bl-kag">
      {nodes.map((node) => (
        <li key={node.kind} className="bl-kag__node">
          <span className="bl-kag__kind">{node.kind}</span>
          <span className="bl-kag__text">{node.text}</span>
          <span className="bl-kag__meta">{node.meta}</span>
        </li>
      ))}
      <li className="bl-kag__node" data-empty={!ruling || undefined}>
        <span className="bl-kag__kind">Ruling</span>
        {ruling ? (
          <>
            <span className="bl-kag__text">
              <span className="bl-num">{ruling.id}</span>: {ruling.text}
            </span>
            <span className="bl-kag__meta">
              Consular route, effective <span className="bl-num">{ruling.effective}</span>. Simulated ruling, not
              legal advice.
            </span>
          </>
        ) : (
          <>
            <span className="bl-kag__text">Empty until an attorney rules.</span>
            <span className="bl-kag__meta">Play the attorney in error 6 to add one.</span>
          </>
        )}
      </li>
    </ol>
  );
}
