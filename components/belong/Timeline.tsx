const SPRINTS = 13;

const MILESTONES = [
  { id: "M0", name: "Listen", from: 1, to: 2, gate: "Attorneys approve the error taxonomy and the data rules." },
  { id: "M1", name: "Measure", from: 1, to: 3, gate: "Baselines published; no AI change ships without a replay." },
  { id: "M2", name: "Prove the money", from: 3, to: 6, gate: "Every critical funds error on the gold set is caught." },
  { id: "M3", name: "Sort and route", from: 5, to: 9, gate: "Silent label errors fall against baseline." },
  { id: "M4", name: "Learn", from: 8, to: 11, gate: "A repeated mistake fails CI." },
  { id: "M5", name: "Scale", from: 10, to: 13, gate: "The weekly review runs without Achint." },
];

export default function Timeline() {
  return (
    <ol className="bl-time bl-ui" style={{ "--sprints": SPRINTS } as React.CSSProperties}>
      {MILESTONES.map((m) => (
        <li key={m.id} className="bl-time__row">
          <span className="bl-time__label">
            <span className="bl-num">{m.id}</span> {m.name}
          </span>
          <span className="bl-time__track" aria-hidden="true">
            <span className="bl-time__bar" style={{ gridColumn: `${m.from} / ${m.to + 1}` }} />
          </span>
          <span className="bl-time__gate">{m.gate}</span>
          <span className="sr-only">
            Sprints {m.from} to {m.to}.
          </span>
        </li>
      ))}
    </ol>
  );
}
