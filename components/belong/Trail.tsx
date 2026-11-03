"use client";

import { money, trail } from "@/lib/belong/checks";
import type { CaseFile, TrailNode } from "@/lib/belong/types";
import { StatusIcon, type Tone } from "./Status";

const HEIGHT = 210;
const COLUMNS = [8.5, 29, 50, 71, 91.5];

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
  // State shows as border colour plus a distinct icon; the word is in the
  // tooltip and for screen readers, and the trail header names held amounts.
  return (
    <button
      type="button"
      className="bl-node"
      data-tone={status.tone}
      aria-pressed={selected}
      title={`${node.label}: ${status.word}`}
      onClick={() => onSelect(node.id)}
      style={style}
    >
      <span className="bl-node__label">{node.label}</span>
      <span className="bl-node__row">
        <span className="bl-node__amt bl-num">{money(node.ccy, node.amount)}</span>
        <span className="bl-node__state" data-tone={status.tone}>
          <StatusIcon tone={status.tone} />
          <span className="sr-only">{status.word}</span>
        </span>
      </span>
    </button>
  );
}

// The fund-flow trail, left to right like Belong's Fund trace: sources,
// savings, US account, escrow and the operating account, then where the money
// went. Below ~560px of its own width it becomes a list (container query).
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
  const x = (node: TrailNode) => COLUMNS[node.col];
  const y = (node: TrailNode) => node.y * HEIGHT;

  return (
    <div className="bl-trail" role="group" aria-label={label}>
      <div className="bl-trail__graph" style={{ height: HEIGHT }}>
        <svg
          className="bl-trail__edges"
          viewBox={`0 0 100 ${HEIGHT}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          {edges.map((edge) => {
            const a = byId.get(edge.from) as TrailNode;
            const b = byId.get(edge.to) as TrailNode;
            const mid = (x(a) + x(b)) / 2;
            return (
              <path
                key={edge.id}
                d={`M ${x(a)} ${y(a)} C ${mid} ${y(a)}, ${mid} ${y(b)}, ${x(b)} ${y(b)}`}
                data-tone={edgeTone?.(edge.id, edge.from, edge.to) ?? "neutral"}
                data-dashed={edge.dashed || undefined}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        {nodes.map((node) => (
          <NodeButton
            key={node.id}
            node={node}
            status={toneOf(node.id)}
            selected={selected === node.id}
            onSelect={onSelect}
            style={{ left: `${x(node)}%`, top: y(node) }}
          />
        ))}
      </div>
      <ol className="bl-trail__list">
        {[...nodes]
          .sort((a, b) => a.col - b.col || a.y - b.y)
          .map((node) => (
            <li key={node.id} data-col={node.col}>
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
