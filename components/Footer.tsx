"use client";

export default function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-6 pb-9 text-[11px] text-subtle">
      <span>© 2026 rafeed iqbal</span>
      <span className="hidden md:inline">
        press <kbd className="kbd">`</kbd> to open the terminal
      </span>
      <span>built with next.js</span>
    </footer>
  );
}
