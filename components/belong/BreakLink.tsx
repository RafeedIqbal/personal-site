"use client";

// "Break a file" works as a plain anchor without JS; with JS it also puts
// keyboard focus on the first error so Enter injects it.
export default function BreakLink() {
  return (
    <a
      href="#break"
      className="bl-btn bl-btn--primary"
      onClick={(event) => {
        const target = document.getElementById("break");
        if (!target) return;
        event.preventDefault();
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        document.getElementById("chip-1")?.focus({ preventScroll: true });
        history.replaceState(null, "", "#break");
      }}
    >
      Break a file
    </a>
  );
}
