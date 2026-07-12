"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import BackgroundEffect from "../components/BackgroundEffect";
import BootSequence from "../components/BootSequence";
import Nav from "../components/Nav";
import Footer from "../components/Footer";

// Keep the terminal (and everything it drags in) out of the first-load
// bundle; the chunk is only fetched on the first open (see terminalReady).
const InteractiveTerminal = dynamic(
  () => import("../components/InteractiveTerminal"),
  { ssr: false }
);
import Hero from "../sections/Hero";
import About from "../sections/About";
import Experience from "../sections/Experience";
import Projects from "../sections/Projects";
import Websites from "../sections/Websites";
import Skills from "../sections/Skills";
import Contact from "../sections/Contact";

export default function Page() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [booted, setBooted] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  // Latches on the first open so the terminal chunk isn't fetched until it's
  // actually wanted, then stays mounted so command history survives toggles.
  const [terminalReady, setTerminalReady] = useState(false);

  const openTerminal = () => {
    setTerminalReady(true);
    setTerminalOpen(true);
  };

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Skip the boot animation if it already played this session, or if the
    // visitor prefers reduced motion.
    const skipBoot =
      sessionStorage.getItem("rafeed:booted") === "1" || reduceMotion.matches;

    const syncLayout = (matches: boolean) => {
      setIsMobile(matches);
      if (matches || skipBoot) {
        setBooted(true);
      }
    };

    syncLayout(mobileQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      syncLayout(event.matches);
    };

    mobileQuery.addEventListener("change", handleChange);
    return () => mobileQuery.removeEventListener("change", handleChange);
  }, []);

  // Backtick toggles the terminal overlay (desktop only).
  useEffect(() => {
    if (isMobile !== false) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "`" && e.code !== "Backquote") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (typing) return;
      e.preventDefault();
      setTerminalReady(true);
      setTerminalOpen((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile]);

  const handleBootComplete = () => {
    setBooted(true);
    sessionStorage.setItem("rafeed:booted", "1");
  };

  return (
    <div className="relative min-h-screen">
      {/* Desktop-only animated background (client-only, hydrates in) */}
      {isMobile === false && <BackgroundEffect />}

      {/* Desktop-only boot overlay — sits over already-rendered content, then fades */}
      {isMobile === false && !booted && (
        <BootSequence onComplete={handleBootComplete} />
      )}

      <div className="relative z-10 flex min-h-screen">
        {/* Nav — desktop only */}
        {isMobile === false && (
          <Nav onOpenTerminal={openTerminal} />
        )}

        {/* Main content — always rendered so it ships in the server HTML */}
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1080px] px-6 md:px-8">
            <Hero />
            <About />
            <Experience />
            <Projects />
            <Websites />
            <Skills />
            <Contact />
            <Footer />
          </div>
        </main>
      </div>

      {/* Terminal overlay — desktop only; mounts on first open, then stays
          mounted so history survives toggles */}
      {isMobile === false && terminalReady && (
        <InteractiveTerminal
          open={terminalOpen}
          onClose={() => setTerminalOpen(false)}
        />
      )}
    </div>
  );
}
