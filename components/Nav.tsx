"use client";

import { useEffect, useState } from "react";
import { PROFILE } from "../lib/content";

const TREE_ITEMS = [
  { href: "#whoami", label: "whoami" },
  { href: "#about", label: "about.txt" },
  { href: "#experience", label: "experience.log" },
  { href: "#projects", label: "projects/" },
  { href: "#websites", label: "websites/" },
  { href: "#env", label: "skills.env" },
  { href: "#contact", label: "contact.sh" },
];

interface NavProps {
  onOpenTerminal: () => void;
}

export default function Nav({ onOpenTerminal }: NavProps) {
  const [activeId, setActiveId] = useState<string>("whoami");

  useEffect(() => {
    const sections = TREE_ITEMS.map((item) =>
      document.getElementById(item.href.replace("#", ""))
    ).filter((el): el is HTMLElement => el !== null);

    if (sections.length === 0) return;

    // Scanline scroll-spy: the active section is the last one whose top has
    // crossed ~40% down the viewport. An IntersectionObserver band breaks on
    // short final sections that never reach it, so at the bottom of the page
    // the last section is forced active.
    let ticking = false;
    const update = () => {
      ticking = false;
      const doc = document.documentElement;
      if (window.innerHeight + window.scrollY >= doc.scrollHeight - 100) {
        setActiveId(sections[sections.length - 1].id);
        return;
      }
      const scanline = window.innerHeight * 0.4;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= scanline) {
          current = section.id;
        }
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <aside className="sticky top-0 hidden h-screen w-52 shrink-0 flex-col border-r border-white/[0.07] md:flex">
      {/* Brand */}
      <div className="shrink-0 px-5 pt-6 pb-4">
        <a
          href="#whoami"
          className="text-[12.5px] text-muted transition-colors hover:text-white"
        >
          <span className="text-accent">~</span>/rafeed.dev
        </a>
      </div>

      <nav className="flex-1 overflow-y-auto px-5 py-2">
        <div className="space-y-0 text-xs">
          {TREE_ITEMS.map((item, i) => {
            const isLast = i === TREE_ITEMS.length - 1;
            const branch = isLast ? "└── " : "├── ";
            const isActive = activeId === item.href.replace("#", "");
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={isActive ? "true" : undefined}
                className={`block w-full text-left leading-6 transition-colors ${
                  isActive ? "text-white" : "text-muted hover:text-white"
                }`}
              >
                <span className={isActive ? "text-accent" : "text-faint"}>{branch}</span>
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>

      {/* Terminal + resume */}
      <div className="flex shrink-0 flex-col gap-3 px-5 pt-4 pb-6">
        <button
          onClick={onOpenTerminal}
          title="open terminal ( ` )"
          className="w-full rounded-md bg-accent py-2 text-xs font-bold text-black transition-opacity hover:opacity-80"
        >
          &gt;_ terminal
        </button>
        <a
          href={PROFILE.resumeUrl}
          download
          className="text-xs text-muted transition-colors hover:text-white"
        >
          <span className="text-accent">[↓]</span> resume
        </a>
      </div>
    </aside>
  );
}
