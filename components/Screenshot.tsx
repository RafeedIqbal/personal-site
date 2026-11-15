"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import type { PortfolioImage } from "@/lib/content";
import { closedByAny, lightDismissFallback } from "@/lib/dialog";

export default function Screenshot({
  image,
  compact = false,
  eager = false,
}: {
  image: PortfolioImage;
  compact?: boolean;
  // The first featured screenshot can be the LCP element on tall desktop windows.
  eager?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const captionId = useId();

  const close = () => dialogRef.current?.close();

  return (
    <>
      <a
        ref={linkRef}
        href={image.src}
        className="screenshot"
        aria-labelledby={captionId}
        aria-haspopup="dialog"
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
            return;
          event.preventDefault();
          setOpen(true);
          dialogRef.current?.showModal();
          closeButtonRef.current?.focus();
        }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes={
            compact
              ? "(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 45vw, min(30vw, 360px)"
              : "(max-width: 1023px) calc(100vw - 40px), min(48vw, 600px)"
          }
          loading={eager ? "eager" : undefined}
          className="preview-image"
        />
        <span className="screenshot-expand" aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6" />
          </svg>
        </span>
        <span id={captionId} className="screenshot-caption">
          <span>{image.label}</span>
          <span>View image</span>
        </span>
      </a>
      <dialog
        ref={dialogRef}
        className="image-dialog"
        aria-labelledby={titleId}
        {...closedByAny}
        onClick={lightDismissFallback}
        onClose={() => {
          setOpen(false);
          linkRef.current?.focus({ preventScroll: true });
        }}
      >
        <div className="image-dialog-content">
          <div className="image-dialog-toolbar flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line px-4 py-2 font-mono text-xs">
            <p id={titleId}>{image.label}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <a
                href={image.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-fg underline decoration-line underline-offset-4 hover:decoration-muted"
              >
                Open full-size image
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={close}
                className="min-h-11 shrink-0 px-2 text-muted hover:text-fg"
              >
                Close <span aria-hidden="true">[esc]</span>
              </button>
            </div>
          </div>
          {open && (
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="95vw"
              className="image-dialog-image"
            />
          )}
        </div>
      </dialog>
    </>
  );
}
