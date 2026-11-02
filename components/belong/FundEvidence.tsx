"use client";

import { useState } from "react";
import { evaluate, nodeResults } from "@/lib/belong/checks";
import { FILES } from "@/lib/belong/data";
import { NodeChecks } from "./Sheet";
import type { Tone } from "./Status";
import { FundTrail } from "./Trail";

const CLEAN = FILES[0];
const RESULTS = evaluate(CLEAN);

function toneOf(nodeId: string): { tone: Tone; word: string } {
  const own = nodeResults(RESULTS, nodeId);
  if (own.length > 0 && own.every((r) => r.status === "info")) return { tone: "neutral", word: "Not counted" };
  return { tone: "proven", word: "Proven" };
}

export default function FundEvidence() {
  const [selected, setSelected] = useState("account:savings");
  return (
    <div className="bl-evid bl-ui">
      <FundTrail
        file={CLEAN}
        toneOf={toneOf}
        selected={selected}
        onSelect={setSelected}
        label="Clean fund trail. Select a node to see why it is green."
      />
      <div className="bl-evid__panel" aria-live="polite">
        <NodeChecks key={selected} results={nodeResults(RESULTS, selected)} file={CLEAN} />
      </div>
    </div>
  );
}
