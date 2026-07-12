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

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          );
        if (visible[0]) {
          setActiveId(visible[0].target.id);
        }
      },
      // Active band sits ~40% down the viewport.
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (href: string) => {
    const id = href.replace("#", "");
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-52 shrink-0 flex-col border-r border-white/[0.07] md:flex">
      {/* Brand */}
      <div className="shrink-0 px-5 pt-6 pb-4">
        <button
          onClick={() => handleNavClick("#whoami")}
          className="text-[12.5px] text-muted transition-colors hover:text-white"
        >
          <span className="text-accent">~</span>/rafeed.dev
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-5 py-2">
        <div className="space-y-0 text-xs">
          {TREE_ITEMS.map((item, i) => {
            const isLast = i === TREE_ITEMS.length - 1;
            const branch = isLast ? "└── " : "├── ";
            const isActive = activeId === item.href.replace("#", "");
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                aria-current={isActive ? "true" : undefined}
                className={`block w-full text-left leading-6 transition-colors ${
                  isActive ? "text-white" : "text-muted hover:text-white"
                }`}
              >
                <span className={isActive ? "text-accent" : "text-faint"}>{branch}</span>
                {item.label}
              </button>
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
