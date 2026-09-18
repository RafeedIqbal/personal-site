"use client";

import { useEffect, useRef, useState } from "react";
import { NAV_ITEMS, PROFILE } from "@/lib/content";

interface NavProps {
  onOpenTerminal: () => void;
  terminalAvailable: boolean;
}

export default function Nav({ onOpenTerminal, terminalAvailable }: NavProps) {
  const [activeId, setActiveId] = useState("whoami");
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const sections = NAV_ITEMS.map(({ id }) =>
      document.getElementById(id),
    ).filter((el): el is HTMLElement => el !== null);
    let frame = 0;
    const update = () => {
      frame = 0;
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 40
      ) {
        setActiveId("contact");
        return;
      }
      let current = "whoami";
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= window.innerHeight * 0.3)
          current = section.id;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("toggle", schedule, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("toggle", schedule, true);
    };
  }, []);

  const closeMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  return (
    <>
      <header className="mobile-header lg:hidden">
        <div className="flex min-h-16 items-center justify-between gap-3 px-5 sm:px-8">
          <a href="#whoami" onClick={closeMenu} className="font-mono text-xs">
            <span className="text-accent">~</span>/rafeed.dev
          </a>
          <a
            href={PROFILE.resumeUrl}
            download
            className="small-link font-mono text-xs"
          >
            Résumé <span aria-hidden="true">↓</span>
            <span className="sr-only"> (PDF download)</span>
          </a>
        </div>
        <details
          ref={mobileMenuRef}
          className="mobile-menu"
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              closeMenu();
              mobileMenuRef.current?.querySelector("summary")?.focus();
            }
          }}
        >
          <summary className="flex min-h-11 cursor-pointer items-center justify-between gap-4 px-5 font-mono text-xs sm:px-8">
            <span>
              Explore{" "}
              <span className="ml-2 text-muted">
                / {NAV_ITEMS.find(({ id }) => id === activeId)?.label}
              </span>
            </span>
            <span className="menu-indicator" aria-hidden="true">
              +
            </span>
          </summary>
          <nav
            aria-label="Page sections"
            className="border-t border-line px-3 py-2 sm:px-6"
          >
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                aria-current={activeId === item.id ? "location" : undefined}
                className="mobile-nav-link"
                onClick={closeMenu}
              >
                <span>{item.label}</span>
                <span className="font-mono text-xs text-muted">
                  {item.file}
                </span>
              </a>
            ))}
          </nav>
        </details>
      </header>
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-line bg-surface/25 lg:flex">
        <a
          href="#whoami"
          className="flex h-14 shrink-0 items-center border-b border-line px-6 font-mono text-xs"
        >
          <span className="text-accent">~</span>/rafeed.dev
        </a>
        <div className="px-6 pt-9 pb-5">
          <span className="font-mono text-[11px] text-muted">explorer</span>
          <p className="mt-2 text-sm font-medium">Rafeed Iqbal</p>
        </div>
        <nav
          aria-label="Page sections"
          className="min-h-0 flex-1 overflow-y-auto px-3"
        >
          {NAV_ITEMS.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "location" : undefined}
              className="desktop-nav-link"
            >
              <span aria-hidden="true" className="tree-branch" />
              <span>
                <span className="block text-[13px]">{item.label}</span>
                <span className="mt-0.5 block font-mono text-[10px] text-muted">
                  {item.file}
                </span>
              </span>
            </a>
          ))}
        </nav>
        <div className="space-y-4 border-t border-line p-5">
          {terminalAvailable && (
            <button
              type="button"
              onClick={onOpenTerminal}
              aria-haspopup="dialog"
              className="terminal-launcher"
              title="Open terminal (backtick)"
            >
              <span>
                <span className="mr-2 text-accent" aria-hidden="true">
                  &gt;_
                </span>
                Open terminal
              </span>
              <kbd className="kbd">`</kbd>
            </button>
          )}
          <a
            href={PROFILE.resumeUrl}
            download
            className="flex min-h-8 items-center justify-between font-mono text-[11px] text-muted hover:text-fg"
          >
            Download résumé <span aria-hidden="true">↓</span>
            <span className="sr-only"> (PDF)</span>
          </a>
        </div>
      </aside>
    </>
  );
}
