"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const LINES = [
  "Initializing portfolio...",
  "Loading rafeed.sh...",
  "Reading experience.log...",
  "Mounting projects/...",
  "Mounting websites/...",
  "Done.",
];

interface BootSequenceProps {
  onComplete: () => void;
}

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const restoreFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (restoreFrameRef.current !== null) {
      cancelAnimationFrame(restoreFrameRef.current);
      restoreFrameRef.current = null;
    }

    const dialog = dialogRef.current;
    const skip = skipRef.current;
    if (!dialog || !skip) return;

    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    let ownsFocus = false;

    const handleFocusIn = (event: FocusEvent) => {
      ownsFocus = event.target instanceof Node && dialog.contains(event.target);
    };
    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || event.isComposing) return;
      event.preventDefault();
      skip.focus({ preventScroll: true });
    };

    document.addEventListener("focusin", handleFocusIn);
    window.addEventListener("keydown", handleTab);
    skip.focus({ preventScroll: true });

    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("keydown", handleTab);
      if (!ownsFocus && !dialog.contains(document.activeElement)) return;

      // Wait for the page shell to lose inert. A subsequent effect setup
      // cancels this frame, including React's development cleanup/replay.
      restoreFrameRef.current = requestAnimationFrame(() => {
        restoreFrameRef.current = null;
        const active = document.activeElement;
        if (active && active !== document.body && !dialog.contains(active)) return;

        const canRestorePrevious = previousFocus &&
          previousFocus !== document.body &&
          previousFocus.isConnected &&
          previousFocus.getClientRects().length > 0 &&
          !previousFocus.closest("[inert]");
        const target = canRestorePrevious
          ? previousFocus
          : document.getElementById("main-content");
        if (target && !target.closest("[inert]")) {
          target.focus({ preventScroll: true });
        }
      });
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      onComplete();
      return;
    }

    const timers = LINES.map((_, index) =>
      window.setTimeout(() => setVisibleLines(index + 1), (index + 1) * 280)
    );
    timers.push(window.setTimeout(() => setDone(true), LINES.length * 280 + 400));

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDone(true);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onComplete, reduceMotion]);

  return (
    <AnimatePresence onExitComplete={onComplete}>
      {!done && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="boot-title"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-bg p-6"
        >
          <h2 id="boot-title" className="sr-only">Loading portfolio</h2>
          <div aria-hidden="true" className="min-h-[184px] min-w-[260px] space-y-2 text-sm">
            {LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2"
              >
                <span className="text-accent">$</span>
                <span className={i === visibleLines - 1 && !done ? "text-white" : "text-muted"}>
                  {line}
                </span>
                {i === visibleLines - 1 && !done && (
                  <span className="cursor-blink" />
                )}
              </motion.div>
            ))}
          </div>
          <button
            ref={skipRef}
            type="button"
            onClick={() => setDone(true)}
            className="rounded border border-white/15 px-4 py-2 text-xs text-muted transition-colors hover:border-accent hover:text-white"
          >
            skip intro <span className="text-subtle">[esc]</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
