import type { ReactNode } from "react";
import { SOURCES, type SourceId } from "@/lib/belong/sources";

// Page primitives for /belong: a numbered section on the reading grid, a row
// with margin notes, and the dotted-underline inference marker.

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
        <div className="bl-row bl-head">
          <span className="bl-sec" aria-hidden="true">
            §&thinsp;{n}
          </span>
          <h2 id={`${id}-title`} className="bl-h2">
            {title}
          </h2>
        </div>
        {children}
      </div>
      {after && <div className="bl-wide">{after}</div>}
    </section>
  );
}

export function Row({
  notes,
  wide,
  children,
}: {
  notes?: SourceId[];
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="bl-row">
      <div className={wide ? "bl-main bl-main--wide" : "bl-main"}>
        {children}
      </div>
      {notes && notes.length > 0 && (
        <aside className="bl-notes" aria-label="Sources">
          {notes.map((id) => {
            const source = SOURCES[id];
            return (
              <p key={id}>
                {"href" in source ? (
                  <a href={source.href} target="_blank" rel="noreferrer">
                    {source.label}
                  </a>
                ) : (
                  source.label
                )}
              </p>
            );
          })}
        </aside>
      )}
    </div>
  );
}

export function Inf({ children }: { children: ReactNode }) {
  return (
    <span className="bl-inf">
      {children}
      <span className="sr-only"> (inference from Belong’s public pages)</span>
    </span>
  );
}
