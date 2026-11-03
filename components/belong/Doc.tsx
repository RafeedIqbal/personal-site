import type { ReactNode } from "react";

// Page primitives for /belong. A Module is a framed section (thin side rules,
// bracket corners, a heavy title over a light serif lede); a Figure carries a
// short "fig." caption; Numerals and Brace are the display devices.

export function Module({
  id,
  numeral,
  title,
  lede,
  tone,
  word,
  children,
  after,
}: {
  id: string;
  numeral: string;
  title: string;
  lede?: ReactNode;
  tone?: "band";
  word?: string;
  children?: ReactNode;
  after?: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="bl-module"
      data-tone={tone}
      data-section={`${numeral}. ${title}`}
    >
      {word && (
        <span className="bl-module__word" aria-hidden="true">
          {word}
        </span>
      )}
      <div className="bl-frame">
        <header className="bl-module__head">
          <h2 id={`${id}-title`} className="bl-title">
            <span className="bl-title__num">{numeral}.</span>
            {title}
          </h2>
          {lede && <p className="bl-module__lede">{lede}</p>}
        </header>
        {children}
      </div>
      {after && <div className="bl-wide">{after}</div>}
    </section>
  );
}

// The rest of a numbered section, on the light page after a band.
export function ModuleContinued({ section, children }: { section: string; children: ReactNode }) {
  return (
    <div className="bl-module bl-module--cont" data-section={section}>
      <div className="bl-frame">{children}</div>
    </div>
  );
}

export function Figure({
  n,
  caption,
  below,
  children,
}: {
  n: number;
  caption: ReactNode;
  below?: boolean;
  children: ReactNode;
}) {
  return (
    <figure className="bl-figure" data-below={below || undefined}>
      <div className="bl-figure__body">{children}</div>
      <figcaption className="bl-figure__cap">
        <span className="bl-figure__n">fig. {n}</span> {caption}
      </figcaption>
    </figure>
  );
}

export function Numerals({ items }: { items: { n: string; word: string }[] }) {
  return (
    <dl className="bl-numerals">
      {items.map((item) => (
        <div key={item.word}>
          <dt>{item.n}</dt>
          <dd>{item.word}</dd>
        </div>
      ))}
    </dl>
  );
}

// A horizontal curly brace that stretches to its container's width.
export function Brace({ label }: { label: string }) {
  return (
    <span className="bl-brace">
      <span className="bl-brace__label">{label}</span>
      <svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <path
          d="M 0.5 11 Q 0.5 6 4 6 L 46 6 Q 50 6 50 1 Q 50 6 54 6 L 96 6 Q 99.5 6 99.5 11"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
