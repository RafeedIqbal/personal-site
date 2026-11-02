"use client";

import { useSyncExternalStore } from "react";

const KEY = "belong-theme";
const listeners = new Set<() => void>();

function current(): "light" | "dark" {
  const set = document.getElementById("belong")?.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", notify);
  return () => {
    listeners.delete(notify);
    query.removeEventListener("change", notify);
  };
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, current, () => null);
  const toggle = () => {
    const next = current() === "dark" ? "light" : "dark";
    const root = document.getElementById("belong");
    if (root) root.dataset.theme = next;
    try {
      localStorage.setItem(KEY, next);
    } catch {}
    listeners.forEach((notify) => notify());
  };
  return (
    <button type="button" className="bl-theme" aria-pressed={theme === "dark"} onClick={toggle}>
      <span className="bl-theme__dot" aria-hidden="true" />
      Dark theme
    </button>
  );
}
