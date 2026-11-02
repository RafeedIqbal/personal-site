const MILESTONES = [
  {
    id: "M0",
    name: "Listen",
    from: 1,
    to: 3,
    ships: "Attorney shadowing, a pipeline review, tagged errors from recent files and an error taxonomy.",
    gate: "Attorneys approve the taxonomy, and the firm approves the data rules.",
  },
  {
    id: "M1",
    name: "Measure",
    from: 2,
    to: 6,
    ships: "An anonymized gold set, replay in CI, correction capture in the review screens and scorecard v1.",
    gate: "Baselines are published, and no AI change ships without a replay.",
  },
  {
    id: "M2",
    name: "Prove the money",
    from: 5,
    to: 12,
    ships: "The statement schema, the seven checks and trail labels linked to evidence, first in shadow mode.",
    gate: "It catches every critical funds error on the gold set, then goes live on new E-2 files.",
  },
  {
    id: "M3",
    name: "Sort and route",
    from: 10,
    to: 18,
    ships: "A parser bake-off, a tuned classifier, cross-document checks, hard rules, the decision router and attorney packets.",
    gate: "Silent label errors fall against baseline. Proposed target: 9 in 10 items close at the first destination.",
  },
  {
    id: "M4",
    name: "Learn",
    from: 16,
    to: 22,
    ships: "KAG v1, scoped rulings, a correction-to-test pipeline and cap-exempt H-1B gates.",
    gate: "Every correction becomes a ruling or a test within a week, and a repeated mistake fails CI.",
  },
  {
    id: "M5",
    name: "Scale",
    from: 20,
    to: 26,
    ships: "Domain models that earned a place, multilingual extraction, L-1 by configuration and runbooks.",
    gate: "The scorecard improves for two straight months, and the weekly review runs without Achint.",
  },
];

const TICKS = [1, 6, 12, 18, 26];

export default function Timeline() {
  return (
    <div className="bl-time bl-ui">
      <p className="bl-time__caption">Weeks from the start date</p>
      <div className="bl-time__scale" aria-hidden="true">
        {TICKS.map((week) => (
          <span key={week} className="bl-num" style={{ gridColumn: week }}>
            {week}
          </span>
        ))}
      </div>
      <ol className="bl-time__list">
        {MILESTONES.map((m) => (
          <li key={m.id} className="bl-time__row">
            <div className="bl-time__label">
              <span className="bl-num">{m.id}</span> {m.name}
              <span className="bl-time__weeks">
                Weeks <span className="bl-num">{m.from}</span> to <span className="bl-num">{m.to}</span>
              </span>
            </div>
            <div className="bl-time__track" aria-hidden="true">
              <span
                className="bl-time__bar"
                style={{ gridColumn: `${m.from} / ${m.to + 1}` }}
              />
            </div>
            <div className="bl-time__text">
              <p>
                <span className="bl-time__k">Ships</span> {m.ships}
              </p>
              <p>
                <span className="bl-time__k">Gate</span> {m.gate}
              </p>
            </div>
          </li>
        ))}
      </ol>
      <p className="bl-time__exit">
        Exit test: the weekly accuracy review runs without Achint.
      </p>
    </div>
  );
}
