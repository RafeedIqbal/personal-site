export type Tone = "proven" | "unsure" | "failed" | "routed" | "neutral" | "pending";

// Thin-line status glyphs. Colour is never the only signal: every icon
// travels with a word.
export function StatusIcon({ tone }: { tone: Tone }) {
  return (
    <svg
      className="bl-icon"
      data-tone={tone}
      viewBox="0 0 16 16"
      width="14"
      height="14"
      aria-hidden="true"
      focusable="false"
    >
      {tone === "proven" && <path d="M3.5 8.5l3 3 6-7" />}
      {tone === "failed" && <path d="M4.5 4.5l7 7M11.5 4.5l-7 7" />}
      {tone === "routed" && <path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" />}
      {tone === "unsure" && (
        <>
          <path d="M6 6.2a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6.9v.8" />
          <path d="M8 11.6v.4" />
        </>
      )}
      {tone === "neutral" && <path d="M4 8h8" />}
      {tone === "pending" && <circle cx="8" cy="8" r="3.5" />}
    </svg>
  );
}

export function StatusTag({ tone, word }: { tone: Tone; word: string }) {
  return (
    <span className="bl-tag" data-tone={tone}>
      <StatusIcon tone={tone} />
      {word}
    </span>
  );
}
