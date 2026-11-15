"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Nav from "@/components/Nav";

const loadTerminal = () => import("@/components/InteractiveTerminal");
const InteractiveTerminal = dynamic(loadTerminal, { ssr: false });
// Desktop-only decoration: phones never download it.
const BackgroundEffect = dynamic(() => import("@/components/BackgroundEffect"), { ssr: false });

export default function PortfolioShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [desktop, setDesktop] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalReady, setTerminalReady] = useState(false);

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
    setTerminalReady(true);
    setTerminalOpen(true);
  };

  useEffect(() => {
    if (!desktop) return;
    const onKey = (event: KeyboardEvent) => {
      if (
        (event.key !== "`" && event.code !== "Backquote") ||
        event.metaKey ||
        !event.ctrlKey ||
        event.altKey ||
        event.shiftKey ||
        event.repeat ||
        event.isComposing
      )
        return;
      // Leave other open dialogs (image viewers) alone; the terminal is itself a
      // dialog, so the shortcut still closes it from inside.
      const target = event.target as HTMLElement | null;
      if (target?.closest("dialog[open]:not(.terminal-dialog)")) return;
      event.preventDefault();
      setTerminalReady(true);
      setTerminalOpen((value) => !value);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [desktop]);

  return (
    <>
      {desktop && <BackgroundEffect />}
      <div className="portfolio-shell relative z-10 min-h-dvh lg:grid lg:grid-cols-[224px_minmax(0,1fr)]">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Nav onOpenTerminal={openTerminal} onPrepareTerminal={() => void loadTerminal()} />
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
      {/* The terminal is a native modal dialog: showModal() makes this shell inert and
          returns focus to the launcher or shortcut target when it closes. */}
      {desktop && terminalReady && (
        <InteractiveTerminal
          open={terminalOpen}
          onClose={() => setTerminalOpen(false)}
        />
      )}
    </>
  );
}
