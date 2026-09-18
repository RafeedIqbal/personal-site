"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Nav from "@/components/Nav";
import BackgroundEffect from "@/components/BackgroundEffect";

const InteractiveTerminal = dynamic(
  () => import("@/components/InteractiveTerminal"),
  { ssr: false },
);

export default function PortfolioShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [desktop, setDesktop] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setDesktop(query.matches);
      if (!query.matches) setTerminalOpen(false);
    };
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const openTerminal = () => {
    triggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setTerminalReady(true);
    setTerminalOpen(true);
  };

  useEffect(() => {
    if (!desktop) return;
    const onKey = (event: KeyboardEvent) => {
      if (
        (event.key !== "`" && event.code !== "Backquote") ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        event.repeat ||
        event.isComposing
      )
        return;
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable='true'], dialog[open]",
        )
      )
        return;
      event.preventDefault();
      if (!terminalOpen) triggerRef.current = target;
      setTerminalReady(true);
      setTerminalOpen((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [desktop, terminalOpen]);

  useEffect(() => {
    if (terminalOpen || !triggerRef.current) return;
    const trigger = triggerRef.current;
    triggerRef.current = null;
    const frame = requestAnimationFrame(() => {
      const fallback = document.getElementById("main-content");
      (trigger.isConnected &&
      trigger.getClientRects().length > 0 &&
      trigger !== document.body
        ? trigger
        : fallback
      )?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [terminalOpen]);

  return (
    <>
      {desktop && <BackgroundEffect />}
      <div
        className="relative z-10 min-h-dvh lg:grid lg:grid-cols-[224px_minmax(0,1fr)]"
        inert={terminalOpen}
      >
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Nav onOpenTerminal={openTerminal} terminalAvailable={desktop} />
        <div className="min-w-0">
          <header
            className="workspace-bar hidden lg:flex"
            aria-label="Portfolio workspace"
          >
            <span>
              <span className="text-muted">~/rafeed.dev / </span>portfolio
            </span>
            <span className="flex items-center gap-2 text-muted">
              <span
                className="h-1.5 w-1.5 rounded-full bg-accent"
                aria-hidden="true"
              />
              Open to opportunities
            </span>
          </header>
          <main
            id="main-content"
            tabIndex={-1}
            className="mx-auto max-w-[1256px] px-5 sm:px-8 lg:px-12 xl:px-16"
          >
            {children}
          </main>
        </div>
      </div>
      {desktop && terminalReady && (
        <InteractiveTerminal
          open={terminalOpen}
          onClose={() => setTerminalOpen(false)}
        />
      )}
    </>
  );
}
