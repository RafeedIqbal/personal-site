"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { tourText, type TourContext, type TourStep } from "@/lib/publicus/tour";

type Box = { top: number; left: number; width: number; height: number };
type Layout = { hole: Box | null; card: { top: number; left: number } | null; docked: boolean; away: boolean; size: { width: number; height: number } };
type Side = "right" | "left" | "top" | "bottom";
const GAP = 12, PAD = 6, EDGE = 12, PHONE = 760, MIN_PANE = 240, MARGIN = 16;
const opposite: Record<Side, Side> = { right: "left", left: "right", top: "bottom", bottom: "top" };

// On a wide screen the tour shrinks the list and detail panes until the whole explorer fits the window,
// so every step is on screen at once and the page never has to move. Phones can't fit it.
function fit(shellNode: HTMLElement) {
  const panes = shellNode.querySelector<HTMLElement>(".px-master-detail");
  const top = shellNode.querySelector(".px-topbar"), bottom = shellNode.querySelector(".px-bottom");
  if (window.innerWidth < PHONE || !panes || !top || !bottom) return;
  // Measured from the content rather than the shell, which is the full screen's height in full screen.
  const chrome = bottom.getBoundingClientRect().bottom - top.getBoundingClientRect().top - panes.offsetHeight + shellNode.offsetHeight - shellNode.clientHeight;
  const height = `${Math.max(MIN_PANE, Math.floor(window.innerHeight - chrome - EDGE * 2))}px`;
  if (shellNode.style.getPropertyValue("--px-fit") !== height) shellNode.style.setProperty("--px-fit", height);
}
// Scrolls the explorer's own panes, never the page, until the target is in view.
function reveal(target: HTMLElement, shellNode: HTMLElement) {
  for (let node: HTMLElement | null = target.parentElement; node; node = node === shellNode ? null : node.parentElement) {
    if (!/auto|scroll/.test(getComputedStyle(node).overflowY) || node.scrollHeight <= node.clientHeight) continue;
    const inner = node.getBoundingClientRect().top + node.clientTop, box = target.getBoundingClientRect();
    if (box.top < inner || box.bottom > inner + node.clientHeight) node.scrollTop += box.top - inner - MARGIN;
  }
}
// The page moves only when the explorer doesn't fit the window: once to frame it, or, on phones and short
// screens, as little as the step needs. On phones the card covers the lower half, so the target goes on top.
function settle(shellNode: HTMLElement, target: HTMLElement | null) {
  const vh = window.innerHeight, frame = shellNode.getBoundingClientRect();
  if (window.innerWidth >= PHONE && frame.height <= vh) {
    if (frame.top < 0 || frame.bottom > vh) window.scrollBy({ top: frame.top - Math.max(0, (vh - frame.height) / 2) });
    return;
  }
  const box = target?.getBoundingClientRect();
  if (!target || !box) return;
  if (window.innerWidth < PHONE) { if (box.top < 0 || box.top > vh * 0.4) target.scrollIntoView({ block: "start" }); }
  else if (box.top < 0 || box.bottom > vh) target.scrollIntoView({ block: "nearest" });
}

function find(shell: HTMLElement, target: string) {
  const element = shell.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!element) return null;
  const box = element.getBoundingClientRect();
  return box.width && box.height ? element : null;
}
// The part of the target that its scrolling ancestors, and the shell itself, actually show.
function shown(target: HTMLElement, shell: HTMLElement) {
  let { top, left, right, bottom } = target.getBoundingClientRect();
  for (let node: HTMLElement | null = target.parentElement; node; node = node === shell ? null : node.parentElement) {
    const style = getComputedStyle(node);
    if (node !== shell && style.overflowX === "visible" && style.overflowY === "visible") continue;
    const box = node.getBoundingClientRect();
    top = Math.max(top, box.top); left = Math.max(left, box.left); right = Math.min(right, box.right); bottom = Math.min(bottom, box.bottom);
  }
  return bottom > top && right > left ? { top, left, right, bottom } : null;
}

// Where the cut-out and the card go for one step. The card sits beside the target, flipping to the side
// with room; on phones it docks to the bottom of the screen instead.
function placement(shellNode: HTMLElement, cardNode: HTMLElement, target: string, preferred: Side = "right"): Layout {
  const frame = shellNode.getBoundingClientRect();
  const found = find(shellNode, target);
  const area = found && shown(found, shellNode);
  const docked = window.innerWidth < PHONE, vw = window.innerWidth, vh = window.innerHeight;
  // Scrolled past the explorer: the card waits off screen instead of covering the rest of the page.
  const away = frame.bottom <= 0 || frame.top >= vh;
  // The scrim is positioned inside the shell, which scrolls on its own in full screen.
  const top = frame.top + shellNode.clientTop - shellNode.scrollTop, left = frame.left + shellNode.clientLeft - shellNode.scrollLeft;
  const hole = area && { top: area.top - top - PAD, left: area.left - left - PAD, width: area.right - area.left + PAD * 2, height: area.bottom - area.top + PAD * 2 };
  const size = { width: shellNode.scrollWidth, height: shellNode.scrollHeight };
  if (docked) return { hole, card: null, docked, away, size };
  const width = cardNode.offsetWidth, height = cardNode.offsetHeight;
  const clampTop = (value: number) => Math.max(EDGE, Math.min(value, vh - height - EDGE));
  const clampLeft = (value: number) => Math.max(EDGE, Math.min(value, vw - width - EDGE));
  if (!area) return { hole, card: { top: clampTop((vh - height) / 2), left: clampLeft((vw - width) / 2) }, docked, away, size };
  const r = { top: area.top - PAD, left: area.left - PAD, right: area.right + PAD, bottom: area.bottom + PAD };
  const sides: Record<Side, { fits: boolean; top: number; left: number }> = {
    right: { fits: r.right + GAP + width <= vw - EDGE, top: clampTop(r.top), left: r.right + GAP },
    left: { fits: r.left - GAP - width >= EDGE, top: clampTop(r.top), left: r.left - GAP - width },
    bottom: { fits: r.bottom + GAP + height <= vh - EDGE, top: r.bottom + GAP, left: clampLeft(r.left) },
    top: { fits: r.top - GAP - height >= EDGE, top: r.top - GAP - height, left: clampLeft(r.left) },
  };
  const side = ([preferred, opposite[preferred], "bottom", "top", "right", "left"] as Side[]).find((name) => sides[name].fits);
  return { hole, card: side ? { top: sides[side].top, left: sides[side].left } : { top: vh - height - EDGE, left: vw - width - EDGE }, docked, away, size };
}

// A spotlight on one explorer control and a card beside it. The scrim lives inside the shell, so it
// follows the explorer into full screen; the card is a manual popover, so nothing dismisses it by accident.
export default function Tour({ shell, steps, index, context, paused, next, back, close }: { shell: RefObject<HTMLDivElement | null>; steps: TourStep[]; index: number; context: TourContext; paused: boolean; next: () => void; back: () => void; close: () => void }) {
  const step = steps[index];
  const card = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const [layout, setLayout] = useState<Layout>({ hole: null, card: null, docked: false, away: false, size: { width: 0, height: 0 } });
  const titleId = useId(), bodyId = useId();
  const last = index === steps.length - 1;

  // The card joins the top layer once, and again after full screen changes, so it stays above the shell.
  useLayoutEffect(() => {
    const node = card.current;
    if (node && "showPopover" in node && !node.matches(":popover-open")) node.showPopover();
  }, []);
  // The panes go back to their usual height when the tour ends.
  useEffect(() => { const node = shell.current; return () => { node?.style.removeProperty("--px-fit"); }; }, [shell]);
  // Each step brings its target into view inside the explorer and moves focus to the card's heading.
  useLayoutEffect(() => {
    const shellNode = shell.current;
    if (!shellNode) return;
    fit(shellNode);
    const target = find(shellNode, step.target);
    if (target) reveal(target, shellNode);
    settle(shellNode, target);
    heading.current?.focus({ preventScroll: true });
  }, [index, shell, step.target]);
  useEffect(() => {
    if (paused) return;
    const measure = () => { if (!shell.current || !card.current) return; fit(shell.current); setLayout(placement(shell.current, card.current, step.target, step.placement)); };
    let frame = requestAnimationFrame(measure);
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(measure); };
    const observer = new ResizeObserver(schedule);
    const shellNode = shell.current, target = shellNode && find(shellNode, step.target);
    if (shellNode) observer.observe(shellNode);
    if (target) observer.observe(target);
    const restack = () => { const node = card.current; if (node && "showPopover" in node && node.matches(":popover-open")) { node.hidePopover(); node.showPopover(); } schedule(); };
    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("fullscreenchange", restack);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); window.removeEventListener("scroll", schedule, { capture: true }); window.removeEventListener("resize", schedule); document.removeEventListener("fullscreenchange", restack); };
  }, [paused, shell, step.target, step.placement]);
  useEffect(() => {
    if (paused) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      const target = event.target as Node;
      if (target === document.body || card.current?.contains(target) || shell.current?.contains(target)) { event.preventDefault(); close(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [paused, close, shell]);

  const { hole } = layout;
  const placed = layout.docked ? undefined : layout.card ? { top: layout.card.top, left: layout.card.left } : { opacity: 0 };
  return <>
    {!paused && <div className="px-tour" aria-hidden="true" style={layout.size.height ? layout.size : undefined}>{hole ? <>
      <div style={{ top: 0, left: 0, right: 0, height: Math.max(0, hole.top) }}/>
      <div style={{ top: hole.top + hole.height, left: 0, right: 0, bottom: 0 }}/>
      <div style={{ top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.height }}/>
      <div style={{ top: hole.top, left: hole.left + hole.width, right: 0, height: hole.height }}/>
      <i className="px-tour-ring" style={{ top: hole.top, left: hole.left, width: hole.width, height: hole.height }}/>
    </> : <div style={{ inset: 0 }}/>}</div>}
    <div ref={card} popover="manual" role="dialog" aria-labelledby={titleId} aria-describedby={bodyId} className={`px-tour-card${layout.docked ? " is-docked" : ""}${paused ? " is-paused" : ""}${layout.away ? " is-away" : ""}`} style={placed}>
      <div className="px-tour-meta"><span className="px-tour-count">{index + 1} of {steps.length}</span>{!last && <button type="button" className="px-text-button" onClick={close}>Skip tour</button>}</div>
      <h3 id={titleId} ref={heading} tabIndex={-1}>{tourText(step.title, context)}</h3>
      <p id={bodyId}>{tourText(step.body, context)}</p>
      {step.advanceOn && <p className="px-tour-try">Try it now, or select Next.</p>}
      <div className="px-tour-actions">
        {index > 0 && <button type="button" className="px-button px-button-white" onClick={back}>Back</button>}
        <button type="button" className="px-button" onClick={last ? close : next}>{last ? "Finish" : "Next"}</button>
      </div>
    </div>
  </>;
}
