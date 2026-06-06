"use client";

import { useEffect, useState } from "react";

const TREE_ITEMS = [
  { href: "#whoami", label: "whoami" },
  { href: "#about", label: "about.txt" },
  { href: "#experience", label: "experience.log" },
  { href: "#projects", label: "projects/" },
  { href: "#websites", label: "websites/" },
  { href: "#env", label: "skills.env" },
  { href: "#contact", label: "contact.sh" },
];

export default function Nav() {
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
    <aside className="hidden md:flex flex-col w-52 shrink-0 sticky top-0 h-screen border-r border-[rgba(255,255,255,0.12)]">
      {/* Header — matched height */}
      <div className="h-10 flex items-center px-4 border-b border-[rgba(255,255,255,0.12)] shrink-0 bg-[rgba(0,0,0,0.16)] backdrop-blur-[3px]">
        <span className="text-xs text-[#888888]">~/rafeed.dev</span>
      </div>
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="text-xs space-y-0 font-mono">
          {TREE_ITEMS.map((item, i) => {
            const isLast = i === TREE_ITEMS.length - 1;
            const branch = isLast ? "└── " : "├── ";
            const isActive = activeId === item.href.replace("#", "");
            return (
              <button
                key={item.href}
                onClick={() => handleNavClick(item.href)}
                aria-current={isActive ? "true" : undefined}
                className={`block w-full text-left transition-colors leading-6 ${
                  isActive
                    ? "text-white font-bold"
                    : "text-[#cccccc] hover:text-white"
                }`}
              >
                <span className="text-[#444444]">{branch}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
