"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const terminalTriggerRef = useRef<HTMLElement | null>(null);

  const rememberTerminalTrigger = () => {
    terminalTriggerRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  };

  const openTerminal = () => {
    rememberTerminalTrigger();
    setTerminalReady(true);
    setTerminalOpen(true);
  };

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Skip the boot animation if it already played this session, or if the
    // visitor prefers reduced motion.
    let alreadyBooted = false;
    try {
      alreadyBooted = sessionStorage.getItem("rafeed:booted") === "1";
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }

    const syncLayout = (matches: boolean) => {
      setIsMobile(matches);
      if (matches || alreadyBooted || reduceMotion.matches) {
        setBooted(true);
      }
      if (matches) setTerminalOpen(false);
    };

    syncLayout(mobileQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      syncLayout(event.matches);
    };
    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) setBooted(true);
    };

    mobileQuery.addEventListener("change", handleChange);
    reduceMotion.addEventListener("change", handleMotionChange);
    return () => {
      mobileQuery.removeEventListener("change", handleChange);
      reduceMotion.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // Backtick toggles the terminal overlay (desktop only).
  useEffect(() => {
    if (isMobile !== false || !booted) return;

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "`" && e.code !== "Backquote") return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey || e.repeat || e.isComposing) return;
      const target = e.target as HTMLElement | null;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (typing) return;
      e.preventDefault();
      if (!terminalOpen) rememberTerminalTrigger();
      setTerminalReady(true);
      setTerminalOpen((prev) => !prev);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, booted, terminalOpen]);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
    try {
      sessionStorage.setItem("rafeed:booted", "1");
    } catch {
      // Completing the optional animation must not depend on browser storage.
    }
  }, []);

  const bootVisible = isMobile === false && !booted;
  const terminalVisible = isMobile === false && terminalOpen;

  // Save the launcher before the page becomes inert, even on the first lazy
  // load. A resize can unmount the terminal and hide its desktop launcher.
  useEffect(() => {
    if (terminalVisible || !terminalTriggerRef.current) return;
    const trigger = terminalTriggerRef.current;
    terminalTriggerRef.current = null;
    const frame = requestAnimationFrame(() => {
      const fallback = isMobile
        ? document.querySelector<HTMLElement>("header a[href='#whoami']")
        : document.getElementById("main-content");
      const target = trigger.isConnected && trigger.getClientRects().length > 0
        && trigger !== document.body ? trigger : fallback;
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [terminalVisible, isMobile]);

  return (
    <div className="relative min-h-screen">
      {/* Desktop-only animated background (client-only, hydrates in) */}
      {isMobile === false && <BackgroundEffect />}

      {/* Desktop-only boot overlay — sits over already-rendered content, then fades */}
      {bootVisible && (
        <BootSequence onComplete={handleBootComplete} />
      )}

      <div
        className="relative z-10 flex min-h-screen flex-col md:flex-row"
        inert={bootVisible || terminalVisible}
      >
        <a href="#main-content" className="skip-link">Skip to content</a>
        <Nav onOpenTerminal={openTerminal} terminalAvailable={isMobile === false && booted} />

        {/* Main content — always rendered so it ships in the server HTML */}
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">
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
