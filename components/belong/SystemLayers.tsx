"use client";

import { useEffect, useRef, useState } from "react";
import { LAYERS, applyPatch, settle } from "@/lib/belong/checks";
import { FILES, SCENARIOS } from "@/lib/belong/data";
import { LAYER_INDEX, useDemo } from "./demo";

const COPY: Record<string, { job: string; shape: string }> = {
  read: {
    job: "Extracts text, tables and each value’s page position.",
    shape: "Parser chosen by a bake-off on Belong’s own files.",
  },
  sort: {
    job: "Labels each document and its gate, with a confidence score.",
    shape: "Builds on Sorting. Cross-document checks catch confident mistakes.",
  },
  normalize: {
    job: "Puts every financial document into one schema.",
    shape: "Keeps the original value, its page and its translation together.",
  },
  check: {
    job: "Runs versioned rules in plain code.",
    shape: "Fund trace nodes earn their labels here, on every file, at almost no cost.",
  },
  route: {
    job: "Sends each flagged item to the right resolver.",
    shape: "Extends “reserved to the attorney”.",
  },
  resolve: {
    job: "A model, the client or an attorney closes the item.",
    shape: "The attorney stays the final authority.",
  },
  learn: {
    job: "Turns corrections into rulings, tests and training data.",
    shape: "Rulings, not precedent: one correction is not law.",
  },
};

// Which layer each demo error stops at, computed by the same check code.
const CAUGHT_AT = SCENARIOS.map((scenario) => {
  const result = settle(applyPatch(FILES[0], scenario.patch), scenario);
  return { id: scenario.id, layer: result.primary ? LAYER_INDEX[result.primary.layer] : -1 };
});

function errorsFor(index: number): number[] {
  if (index <= 3) return CAUGHT_AT.filter((c) => c.layer === index).map((c) => c.id);
  if (index < 6) return SCENARIOS.map((s) => s.id);
  return SCENARIOS.filter((s) => s.ruling).map((s) => s.id);
}

export default function SystemLayers() {
  const { dispatch } = useDemo();
  const [open, setOpen] = useState<string | null>(null);
  const list = useRef<HTMLOListElement>(null);

  // Draw the diagram as it scrolls in. Rows already on screen, or any row
  // under reduced motion, are shown at once; without JS everything shows.
  useEffect(() => {
    const el = list.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-layer]"));
    const below = rows.filter((row) => row.getBoundingClientRect().top > window.innerHeight * 0.92);
    below.forEach((row) => row.setAttribute("data-pending", ""));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.removeAttribute("data-pending");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    below.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, []);

  const tryError = (id: number) => {
    dispatch({ type: "start", scenarioId: id });
    document.getElementById("instrument")?.scrollIntoView({ block: "start" });
  };

  return (
    <ol className="bl-layers" ref={list}>
      {LAYERS.map((layer, index) => {
        const copy = COPY[layer.id];
        const errors = errorsFor(index);
        const expanded = open === layer.id;
        const panel = `layer-${layer.id}`;
        return (
          <li key={layer.id} className="bl-layer" data-layer={layer.id}>
            <span className="bl-layer__node" aria-hidden="true" />
            <div className="bl-layer__body">
              <h3 className="bl-layer__name">
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panel}
                  onClick={() => setOpen(expanded ? null : layer.id)}
                >
                  {layer.name}
                </button>
              </h3>
              <p className="bl-layer__job">{copy.job}</p>
              {expanded && (
                <div id={panel} className="bl-layer__more">
                  <p>{copy.shape}</p>
                  <p className="bl-layer__catches">
                    {errors.length === 0 ? (
                      "A reader never knows it misread. The balance check catches error 1."
                    ) : (
                      <>
                        {index <= 3 ? "Catches" : "Handles"}{" "}
                        {errors.map((id) => (
                          <button key={id} type="button" className="bl-chip bl-chip--small" onClick={() => tryError(id)}>
                            <span className="bl-chip__n bl-num">{id}</span>
                            {SCENARIOS.find((s) => s.id === id)?.chip}
                          </button>
                        ))}
                      </>
                    )}
                  </p>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
