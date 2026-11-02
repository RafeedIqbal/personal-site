"use client";

import { money, trail } from "@/lib/belong/checks";
import type { CaseFile, TrailNode } from "@/lib/belong/types";
import { StatusTag, type Tone } from "./Status";

const ROW_H = 100;
const ROWS = 5;

type ToneOf = (nodeId: string) => { tone: Tone; word: string };

function NodeButton({
  node,
  status,
  selected,
  onSelect,
  style,
}: {
  node: TrailNode;
  status: { tone: Tone; word: string };
  selected: boolean;
  onSelect: (id: string) => void;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type="button"
      className="bl-node"
      data-tone={status.tone}
      aria-pressed={selected}
      onClick={() => onSelect(node.id)}
      style={style}
    >
      <span className="bl-node__label">{node.label}</span>
      <span className="bl-node__amt bl-num">{money(node.ccy, node.amount)}</span>
      <StatusTag {...status} />
    </button>
  );
}

// The fund trail drawn top-down: sources, savings, the wire, the US account,
// then escrow and the operating account. Below ~560px of its own width it
// becomes a list (container query in belong.css).
export function FundTrail({
  file,
  toneOf,
  edgeTone,
  selected,
  onSelect,
  label,
}: {
  file: CaseFile;
  toneOf: ToneOf;
  edgeTone?: (edgeId: string, from: string, to: string) => Tone;
  selected?: string | null;
  onSelect: (id: string) => void;
  label: string;
}) {
  const { nodes, edges } = trail(file);
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const y = (row: number) => row * ROW_H + ROW_H / 2;
  const height = ROWS * ROW_H;
  const wire = edges.find((e) => e.id === "edge:wire");

  return (
    <div className="bl-trail" role="group" aria-label={label}>
      <div className="bl-trail__graph" style={{ height }}>
        <svg
          className="bl-trail__edges"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {edges.map((edge) => {
            const a = byId.get(edge.from) as TrailNode;
            const b = byId.get(edge.to) as TrailNode;
            const mid = (y(a.row) + y(b.row)) / 2;
            const tone = edgeTone?.(edge.id, edge.from, edge.to) ?? "neutral";
            return (
              <path
                key={edge.id}
                d={`M ${a.x} ${y(a.row)} C ${a.x} ${mid}, ${b.x} ${mid}, ${b.x} ${y(b.row)}`}
                data-tone={tone}
                data-dashed={edge.dashed || undefined}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        {wire?.label && (
          <span className="bl-trail__wire bl-num" style={{ top: ROW_H * 2 - 8 }}>
            Wire {wire.label}
          </span>
        )}
        {nodes.map((node) => (
          <NodeButton
            key={node.id}
            node={node}
            status={toneOf(node.id)}
            selected={selected === node.id}
            onSelect={onSelect}
            style={{ left: `${node.x}%`, top: y(node.row) }}
          />
        ))}
      </div>
      <ol className="bl-trail__list">
        {[...nodes]
          .sort((a, b) => a.row - b.row || a.x - b.x)
          .map((node) => (
            <li key={node.id} data-row={node.row}>
              {node.id === "account:us" && wire?.label && (
                <span className="bl-trail__wire-inline bl-num">Wire {wire.label}</span>
              )}
              <NodeButton
                node={node}
                status={toneOf(node.id)}
                selected={selected === node.id}
                onSelect={onSelect}
              />
            </li>
          ))}
      </ol>
    </div>
  );
}
