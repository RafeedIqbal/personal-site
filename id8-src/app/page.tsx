"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import BackgroundEffect from "../components/BackgroundEffect";
import BootSequence from "../components/BootSequence";
import Nav from "../components/Nav";
import InteractiveTerminal from "../components/InteractiveTerminal";
import Hero from "../sections/Hero";
import About from "../sections/About";
import Experience from "../sections/Experience";
import Projects from "../sections/Projects";
import Skills from "../sections/Skills";
import Contact from "../sections/Contact";

export default function Page() {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [booted, setBooted] = useState(false);
  const [terminalWidth, setTerminalWidth] = useState(1000);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const syncLayout = (matches: boolean) => {
      setIsMobile(matches);
      if (matches) {
        setBooted(true);
      }
    };

    syncLayout(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      syncLayout(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragRef.current = { startX: e.clientX, startWidth: terminalWidth };
      setIsDragging(true);
    },
    [terminalWidth]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = dragRef.current.startX - e.clientX;
      const newWidth = Math.min(
        Math.max(dragRef.current.startWidth + delta, 320),
        1200
      );
      setTerminalWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (isMobile === null) {
    return null;
  }

  return (
    <>
      {!isMobile && !booted && <BootSequence onComplete={() => setBooted(true)} />}

      {booted && (
        <div className="relative min-h-screen">
          {!isMobile && <BackgroundEffect />}

          <div className="relative z-10 flex min-h-screen">
            {!isMobile && <Nav />}

            {/* Main content */}
            <main className="flex-1 flex flex-col min-w-0">
              {/* Header — matched height */}
              {!isMobile && (
                <div className="hidden md:flex items-center px-6 h-10 border-b border-[rgba(255,255,255,0.12)] sticky top-0 bg-[rgba(0,0,0,0.16)] backdrop-blur-[3px] z-10">
                  <span className="text-xs text-[#888888]">rafeed@portfolio:~</span>
                </div>
              )}

              {/* Sections */}
              <div className="flex-1 w-full px-6 md:px-10 py-10 md:py-10 space-y-12 md:space-y-16 pb-16">
                <Hero />
                <hr className="hidden md:block border-[#1a1a1a]" />
                <About />
                <hr className="hidden md:block border-[#1a1a1a]" />
                <Experience />
                <hr className="hidden md:block border-[#1a1a1a]" />
                <Projects />
                <hr className="hidden md:block border-[#1a1a1a]" />
                <Skills />
                <hr className="hidden md:block border-[#1a1a1a]" />
                <Contact />
              </div>
            </main>

            {!isMobile && (
              <>
                {/* Drag handle */}
                <div
                  className="hidden lg:block w-1 shrink-0 cursor-col-resize bg-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.22)] active:bg-[rgba(255,255,255,0.32)] transition-colors relative z-20"
                  style={{ background: isDragging ? "rgba(255,255,255,0.32)" : undefined }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="absolute inset-y-0 -left-1 -right-1" />
                </div>

                <InteractiveTerminal width={terminalWidth} />
              </>
            )}
          </div>

          {/* Prevent text selection while dragging */}
          {!isMobile && isDragging && (
            <div className="fixed inset-0 z-50 cursor-col-resize" />
          )}
        </div>
      )}
    </>
  );
}
