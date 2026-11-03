"use client";

import { useEffect, useRef, useState } from "react";
import { LAYERS, applyPatch, settle } from "@/lib/belong/checks";
import { FILES, SCENARIOS } from "@/lib/belong/data";
import { Brace } from "./Doc";
import { LAYER_INDEX, showDemo, useDemo } from "./demo";

type LayerId = (typeof LAYERS)[number]["id"];
type StoreId = "documents" | "ledger" | "rules" | "rulings" | "gold";

// The proposed architecture, one layer at a time: what it does, what I would
// build it with, and the contract it keeps with the next layer.
const DETAIL: Record<LayerId, { job: string; built: string; contract: string; stores: StoreId[] }> = {
  read: {
    job: "Turns every page into text, tables and values, each with its page position.",
    built:
      "A parser chosen by a bake-off on Belong’s own anonymized files: a frontier vision model, a document-AI service such as Textract or Document AI, and Docling. Every value keeps its page and bounding box.",
    contract: "PDF pages → extractions { value, page, box, parser version }",
    stores: ["documents"],
  },
  sort: {
    job: "Labels each document and the gate it serves, with a calibrated confidence.",
    built:
      "Belong’s existing fine-tuned model if it wins the eval, otherwise a small classifier. Temperature-scaled, so a confidence of 0.80 is right 80% of the time.",
    contract: "extractions → { document type, gate, confidence }",
    stores: ["documents"],
  },
  normalize: {
    job: "Puts every financial document into one typed schema.",
    built:
      "Pydantic schemas for statements, transfers, contracts and letters. The original text, its page and any translation stay attached to each value.",
    contract: "labeled document → Statement | Transfer | Contract | Letter",
    stores: ["ledger"],
  },
  check: {
    job: "Runs versioned rules in plain code, on every file, at almost no cost.",
    built:
      "Pure Python functions with pytest. Each rule carries an id, version, effective date, filing route and citation. The demo below runs the same shape in TypeScript.",
    contract: "ledger + rules → pass | fail | info, with evidence pointers",
    stores: ["ledger", "rules"],
  },
  route: {
    job: "Decides who should look next at each flagged item.",
    built:
      "Hard rules first, so reserved questions always reach an attorney. Then a small, inspectable model (logistic regression or gradient-boosted trees) trained on reassignments.",
    contract: "finding → destination + packet",
    stores: ["rulings"],
  },
  resolve: {
    job: "A model, the client or an attorney closes the item.",
    built:
      "A frontier model API under zero data retention, whose answer must pass the checks again. Domain models only where evals show they win. Client requests in the client’s language. An attorney queue led by the matter owner.",
    contract: "packet → answer → checks run again",
    stores: ["ledger"],
  },
  learn: {
    job: "Turns each correction into a ruling, a test and training data.",
    built:
      "Rulings live in a knowledge graph: Postgres nodes and edges, with pgvector for retrieval. Each correction becomes a fixture-based regression test. Training examples wait for sign-off.",
    contract: "correction → ruling + regression test + training example",
    stores: ["rulings", "gold"],
  },
};

const STORES: { id: StoreId; name: string; what: string }[] = [
  { id: "documents", name: "Document store", what: "S3-compatible, encrypted per matter" },
  { id: "ledger", name: "Evidence ledger", what: "Postgres; every row points to its page" },
  { id: "rules", name: "Rule registry", what: "Versioned, dated, scoped by route" },
  { id: "rulings", name: "Ruling graph", what: "Postgres graph with pgvector" },
  { id: "gold", name: "Gold set", what: "Attorney-labeled, replayed in CI" },
];

// Layers grouped by what they cost to run: braces over the row on desktop,
// labels on the rail on phones.
const TIERS = [
  { from: 0, label: "Every file, plain code" },
  { from: 4, label: "Only flagged items" },
  { from: 6, label: "Every correction" },
];

// Which layer each demo error stops at, computed by the same check code.
const CAUGHT_AT = SCENARIOS.map((scenario) => {
  const result = settle(applyPatch(FILES[0], scenario.patch), scenario);
  return { id: scenario.id, layer: result.primary ? LAYER_INDEX[result.primary.layer] : -1 };
});

function errorsFor(index: number): number[] {
  if (index === 0) return [];
  if (index <= 3) return CAUGHT_AT.filter((c) => c.layer === index).map((c) => c.id);
  if (index < 6) return SCENARIOS.map((s) => s.id);
  return SCENARIOS.filter((s) => s.ruling).map((s) => s.id);
}

// One layer's job, stack and contract. Desktop shows it in a panel under the
// row; phones open it inside the tapped layer on the rail, with its stores.
function LayerDetail({
  index,
  id,
  inline = false,
  onTry,
}: {
  index: number;
  id: string;
  inline?: boolean;
  onTry: (scenarioId: number) => void;
}) {
  const layer = LAYERS[index];
  const detail = DETAIL[layer.id];
  const errors = errorsFor(index);
  return (
    <div
      id={id}
      className={`bl-sys__detail ${inline ? "bl-sys__detail--inline" : "bl-sys__detail--wide"}`}
      aria-live={inline ? undefined : "polite"}
    >
      {!inline && <h3 className="bl-sys__name">{layer.name}</h3>}
      <p className="bl-sys__job">{detail.job}</p>
      <dl className="bl-sys__facts">
        <div>
          <dt>Built with</dt>
          <dd>{detail.built}</dd>
        </div>
        <div>
          <dt>Contract</dt>
          <dd className="bl-num">{detail.contract}</dd>
        </div>
        {inline && (
          <div>
            <dt>Stores</dt>
            <dd>
              <ul className="bl-sys__keeps">
                {STORES.filter((store) => detail.stores.includes(store.id)).map((store) => (
                  <li key={store.id}>
                    <span className="bl-sys__store">{store.name}</span>
                    <span className="bl-sys__what">{store.what}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        )}
        <div>
          <dt>{index <= 3 ? "Catches in the demo" : "Handles in the demo"}</dt>
          <dd className="bl-sys__errors">
            {errors.length === 0
              ? "Nothing on its own. A parser never knows it misread; the balance check catches error 1."
              : errors.map((scenarioId) => (
                  <button key={scenarioId} type="button" className="bl-chip" onClick={() => onTry(scenarioId)}>
                    <span className="bl-chip__n bl-num">{scenarioId}</span>
                    {SCENARIOS.find((s) => s.id === scenarioId)?.chip}
                  </button>
                ))}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export default function SystemFigure() {
  const { dispatch } = useDemo();
  const [selected, setSelected] = useState<LayerId>("check");
  const index = LAYERS.findIndex((layer) => layer.id === selected);
  const detail = DETAIL[selected];

  const tryError = (scenarioId: number) => {
    dispatch({ type: "start", scenarioId });
    showDemo();
  };

  // The detail exists twice and CSS shows one per breakpoint. When a tablet
  // rotates across 900px with focus in the copy being hidden, hand focus to
  // the selected layer instead of letting it drop to the page.
  // The browser has already blurred it by then, so remember the last focus.
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let last: HTMLElement | null = null;
    const onFocus = (event: FocusEvent) => {
      last = event.target instanceof HTMLElement ? event.target : null;
    };
    const list = window.matchMedia("(max-width: 899px)");
    const onChange = () => {
      const lost = document.activeElement === document.body || document.activeElement === last;
      if (lost && last?.closest(".bl-sys__detail") && !last.offsetParent) {
        el.querySelector<HTMLElement>('.bl-sys__layer[aria-pressed="true"]')?.focus();
      }
    };
    el.addEventListener("focusin", onFocus);
    list.addEventListener("change", onChange);
    return () => {
      el.removeEventListener("focusin", onFocus);
      list.removeEventListener("change", onChange);
    };
  }, []);

  return (
    <div ref={root} className="bl-sys">
      <div className="bl-sys__tiers" aria-hidden="true">
        {TIERS.map((tier, i) => (
          <span
            key={tier.label}
            style={{ gridColumn: `${tier.from + 1} / ${(TIERS[i + 1]?.from ?? LAYERS.length) + 1}` }}
          >
            <Brace label={tier.label} />
          </span>
        ))}
      </div>
      <ol className="bl-sys__layers" aria-label="The seven layers">
        {LAYERS.map((layer, i) => {
          const tier = TIERS.find((t) => t.from === i);
          const open = layer.id === selected;
          return (
            <li key={layer.id} data-open={open || undefined}>
              {tier && <span className="bl-sys__tier">{tier.label}</span>}
              <button
                type="button"
                className="bl-sys__layer"
                aria-pressed={open}
                aria-controls="bl-sys-detail bl-sys-detail-inline"
                onClick={() => setSelected(layer.id)}
              >
                <span className="bl-sys__n">{String(i + 1).padStart(2, "0")}</span>
                {layer.name}
              </button>
              {open && <LayerDetail index={i} id="bl-sys-detail-inline" inline onTry={tryError} />}
            </li>
          );
        })}
      </ol>
      <p className="bl-sys__loop">
        <span aria-hidden="true">↺</span> Rulings and tests from Learn feed Check and Route on the next file.
      </p>

      <LayerDetail index={index} id="bl-sys-detail" onTry={tryError} />

      <ul className="bl-sys__stores" aria-label="Where the layers keep their state">
        {STORES.map((store) => (
          <li key={store.id} data-active={detail.stores.includes(store.id) || undefined}>
            <span className="bl-sys__store">{store.name}</span>
            <span className="bl-sys__what">{store.what}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
