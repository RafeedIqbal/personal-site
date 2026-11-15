"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { GalleryItem } from "@/lib/publicus/work";

// Thumbnails link to the full image, so the gallery works without JavaScript. With it, a thumbnail
// opens one native dialog that steps through every screen.
export default function Gallery({ items, caption }: { items: GalleryItem[]; caption: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const thumbs = useRef<(HTMLAnchorElement | null)[]>([]);
  const last = useRef(0);
  const [index, setIndex] = useState<number | null>(null);
  const titleId = useId();
  const captionId = useId();
  const item = index === null ? null : items[index];

  useEffect(() => {
    if (index === null) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = previous; };
  }, [index]);

  const open = (i: number) => { last.current = i; setIndex(i); dialog.current?.showModal(); };
  const step = (by: number) => setIndex((current) => { const next = ((current ?? 0) + by + items.length) % items.length; last.current = next; return next; });

  return (
    <figure className="pu-gallery" aria-labelledby={captionId}>
      <ul>
        {items.map((shot, i) => (
          <li key={shot.src}>
            <a ref={(node) => { thumbs.current[i] = node; }} href={shot.src} aria-haspopup="dialog" onClick={(event) => { if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); open(i); }}>
              <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="(min-width: 1024px) 220px, 45vw"/>
              <span><strong>{shot.product}</strong> {shot.title}</span>
            </a>
          </li>
        ))}
      </ul>
      <figcaption id={captionId}>{caption}</figcaption>
      <dialog
        ref={dialog}
        className="pu-lightbox"
        aria-labelledby={titleId}
        onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") { event.preventDefault(); step(1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); step(-1); }
        }}
        onClose={() => { setIndex(null); thumbs.current[last.current]?.focus({ preventScroll: true }); }}
      >
        <div className="pu-lightbox-head">
          <p id={titleId}>{item ? <><strong>{item.product}</strong> {item.title}</> : "Screens"}</p>
          <button type="button" onClick={() => dialog.current?.close()} autoFocus>Close</button>
        </div>
        {item && <Image src={item.src} alt={item.alt} width={item.width} height={item.height} sizes="(min-width: 1240px) 1200px, 100vw" loading="eager"/>}
        <div className="pu-lightbox-foot">
          <p className="pu-data" aria-live="polite">{index === null ? "" : `${index + 1} of ${items.length}`}</p>
          <div>
            <button type="button" onClick={() => step(-1)}>Previous</button>
            <button type="button" onClick={() => step(1)}>Next</button>
            {item && <a href={item.src} target="_blank" rel="noopener noreferrer">Full size<span className="pu-sr"> (opens in a new tab)</span></a>}
          </div>
        </div>
      </dialog>
    </figure>
  );
}
