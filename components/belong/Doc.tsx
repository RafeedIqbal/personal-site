import type { ReactNode } from "react";

// Page primitives for /belong: a numbered section in the reading column, with
// an optional wide slot for the demo.
export function Section({
  id,
  n,
  title,
  children,
  after,
}: {
  id: string;
  n: number;
  title: string;
  children: ReactNode;
  after?: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="bl-section">
      <div className="bl-col">
        <header className="bl-head">
          <span className="bl-sec" aria-hidden="true">
            §&thinsp;{n}
          </span>
          <h2 id={`${id}-title`} className="bl-h2">
            {title}
          </h2>
        </header>
        {children}
      </div>
      {after && <div className="bl-wide">{after}</div>}
    </section>
  );
}
