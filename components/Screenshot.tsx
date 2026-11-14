"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { PortfolioImage } from "@/lib/content";

export default function Screenshot({
  image,
  compact = false,
}: {
  image: PortfolioImage;
  compact?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const linkRef = useRef<HTMLAnchorElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const captionId = useId();

  useEffect(() => {
    if (!open) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

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
              ? "(max-width: 639px) calc(100vw - 40px), (max-width: 1023px) 45vw, 30vw"
              : "(max-width: 1023px) calc(100vw - 40px), 48vw"
          }
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
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              "a[href], button:not([disabled]), [tabindex='0']",
            ),
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (document.activeElement === (event.shiftKey ? first : last)) {
            event.preventDefault();
            (event.shiftKey ? last : first)?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
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
                autoFocus
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
