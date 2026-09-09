"use client";

import { useState, useRef, useEffect, useMemo, KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { runCommand, AVAILABLE_COMMANDS, HELP_COMMANDS } from "../lib/terminal-commands";
import type { TerminalGameId } from "../lib/terminal-games";

// The games only load when the panel first opens, keeping them out of the
// terminal's initial chunk.
const TerminalGamesPanel = dynamic(() => import("./terminal-games/TerminalGamesPanel"), {
  ssr: false,
  loading: () => <p className="text-xs text-subtle" role="status">loading arcade...</p>,
});

interface HistoryEntry {
  command: string;
  output: string;
}

interface TerminalProps {
  open: boolean;
  onClose: () => void;
}

export default function InteractiveTerminal({ open, onClose }: TerminalProps) {
  const reduceMotion = useReducedMotion();
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showHelp, setShowHelp] = useState(false);
  const [gamePanelOpen, setGamePanelOpen] = useState(false);
  const [activeGameId, setActiveGameId] = useState<TerminalGameId | null>(null);
  const [gameHotkeysEnabled, setGameHotkeysEnabled] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const draftInputRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gamePanelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to keep prompt visible
  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: reduceMotion ? "instant" : "smooth",
    });
  }, [history, showHelp, reduceMotion]);

  // Opening a game grows the panel; align the arcade heading with the top of
  // the body so the game title and controls stay visible.
  useEffect(() => {
    const body = bodyRef.current;
    const panel = gamePanelRef.current;
    if (!gamePanelOpen || !body || !panel) return;
    const delta = panel.getBoundingClientRect().top - body.getBoundingClientRect().top;
    body.scrollTo({ top: body.scrollTop + delta - 4, behavior: reduceMotion ? "instant" : "smooth" });
    panel.focus({ preventScroll: true });
  }, [gamePanelOpen, activeGameId, reduceMotion]);

  // The page restores launcher focus after closing. Reopening always starts
  // with the prompt live, which also pauses game keyboard controls.
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Inline ghost suggestion (fish-shell style)
  const ghostSuggestion = useMemo(() => {
    const trimmed = input.toLowerCase();
    if (!trimmed) return "";
    const match = AVAILABLE_COMMANDS.find(
      (cmd) => cmd.startsWith(trimmed) && cmd !== trimmed
    );
    return match ? match.slice(trimmed.length) : "";
  }, [input]);

  const focusPrompt = () => {
    setGameHotkeysEnabled(false);
    inputRef.current?.focus();
  };

  const launchGame = (gameId: TerminalGameId) => {
    setGamePanelOpen(true);
    setActiveGameId(gameId);
    setGameHotkeysEnabled(true);
    setShowHelp(false);
    inputRef.current?.blur();
  };

  const openGameLibrary = () => {
    setGamePanelOpen(true);
    setActiveGameId(null);
    setGameHotkeysEnabled(false);
  };

  const closeGames = () => {
    setGamePanelOpen(false);
    setActiveGameId(null);
    setGameHotkeysEnabled(false);
    inputRef.current?.focus();
  };

  // Escape cascade lives on window because the input is blurred while a game
  // is armed: help card → games panel → overlay.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (e.isComposing) return;
      e.preventDefault();
      if (showHelp) {
        setShowHelp(false);
      } else if (gamePanelOpen) {
        closeGames();
      } else {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Disarm game hotkeys whenever focus lands outside the games panel (e.g.
  // tabbing to the [esc] button) so Space/arrows activate the focused control
  // instead of being captured by the game. Clicking the panel re-arms.
  useEffect(() => {
    if (!open || !gameHotkeysEnabled) return;
    const onFocusIn = (e: FocusEvent) => {
      const panel = gamePanelRef.current;
      if (panel && e.target instanceof Node && panel.contains(e.target)) return;
      setGameHotkeysEnabled(false);
    };
    const onWindowBlur = () => setGameHotkeysEnabled(false);
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("blur", onWindowBlur);
    return () => {
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [open, gameHotkeysEnabled]);

  // Keep Tab cycling inside the dialog (it's aria-modal) — including while a
  // game has the input blurred — without stealing Tab from autocomplete.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Tab" || e.defaultPrevented) return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>("button, input, a[href], [tabindex='0']")
      ).filter((el) => !el.hasAttribute("disabled") && el.getClientRects().length > 0);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || !panel.contains(active)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    draftInputRef.current = "";
    setAnnouncement("");

    if (trimmed.toLowerCase() === "help" || trimmed.toLowerCase() === "--help") {
      setShowHelp((prev) => !prev);
      setAnnouncement(showHelp ? "Command help closed." : "Command help opened above the prompt.");
      setCmdHistory((prev) => [trimmed, ...prev]);
      setHistoryIndex(-1);
      setInput("");
      return;
    }

    const result = runCommand(trimmed);

    if (result?.output === "__CLEAR__") {
      setHistory([]);
      setAnnouncement("Terminal cleared.");
      setInput("");
      setShowHelp(false);
      setGamePanelOpen(false);
      setActiveGameId(null);
      setGameHotkeysEnabled(false);
      setCmdHistory((prev) => [trimmed, ...prev]);
      setHistoryIndex(-1);
      return;
    }

    if (result?.gameAction?.type === "open-library") {
      openGameLibrary();
    } else if (result?.gameAction?.type === "launch" && result.gameAction.gameId) {
      launchGame(result.gameAction.gameId);
    } else if (result?.gameAction?.type === "close") {
      closeGames();
    }

    if (result?.scrollTarget) {
      document.getElementById(result.scrollTarget)?.scrollIntoView({
        behavior: reduceMotion ? "instant" : "smooth",
        block: "start",
      });
    }

    setHistory((prev) => [
      ...prev,
      { command: trimmed, output: result?.output ?? `zsh: command not found: ${trimmed}` },
    ]);
    setCmdHistory((prev) => [trimmed, ...prev]);
    setHistoryIndex(-1);
    setInput("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.metaKey || e.ctrlKey || e.altKey) return;
    // Tab only completes the ghost suggestion; otherwise it stays a focus key
    // (Shift+Tab always is) so keyboard users can reach the dialog's buttons.
    if (e.key === "Tab") {
      if (!e.shiftKey && ghostSuggestion) {
        e.preventDefault();
        setInput(input + ghostSuggestion);
      }
      return;
    }
    if (e.key === "ArrowRight" && !e.shiftKey && ghostSuggestion && inputRef.current) {
      if (inputRef.current.selectionStart === input.length && inputRef.current.selectionEnd === input.length) {
        e.preventDefault();
        setInput(input + ghostSuggestion);
      }
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      if (cmdHistory.length === 0) return;
      e.preventDefault();
      if (historyIndex === -1) draftInputRef.current = input;
      const next = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(next);
      setInput(cmdHistory[next] ?? "");
    } else if (e.key === "ArrowDown") {
      if (historyIndex === -1) return;
      e.preventDefault();
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setInput(next === -1 ? draftInputRef.current : cmdHistory[next] ?? "");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Terminal">
      {/* Dim backdrop — click to close. Page keeps scrolling behind it so
          scrollTarget commands stay visible. */}
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />

      <div
        ref={panelRef}
        className="absolute bottom-4 left-1/2 flex max-h-[calc(100dvh-32px)] w-[min(760px,calc(100vw-32px))] -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-white/[0.12] bg-[rgba(9,10,12,0.92)] shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-[16px] sm:bottom-11 sm:max-h-[calc(100dvh-60px)]"
        style={{ height: gamePanelOpen ? "min(78dvh, 700px)" : 440 }}
        onClick={focusPrompt}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-2.5">
          <span className="text-xs text-subtle">
            <span className="text-accent">●</span> visitor@rafeed.dev
          </span>
          <button
            aria-label="Close terminal"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="text-xs text-subtle transition-colors hover:text-white"
          >
            [esc]
          </button>
        </div>

        {/* Terminal body — single scrollable area, input is part of the flow */}
        <div
          ref={bodyRef}
          className="flex min-h-0 flex-1 flex-col space-y-3 overflow-y-auto overscroll-contain px-4 py-3"
        >
          {/* Welcome */}
          <div className="space-y-0.5 text-xs text-subtle">
            <p>Welcome to rafeed.dev — you found the terminal.</p>
            <p id="terminal-instructions">Type <span className="text-fg">help</span> for commands. Tab to autocomplete; Shift+Tab to move focus.</p>
            <p>Type <span className="text-fg">games</span> if bored.</p>
          </div>

          {/* Help card */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.15 }}
                className="overflow-hidden"
              >
                <div className="my-1 rounded-md border border-white/10 bg-white/[0.02] text-xs">
                  <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2">
                    <span className="font-bold text-fg">available commands</span>
                    <button
                      aria-label="Close command help"
                      onClick={(e) => { e.stopPropagation(); setShowHelp(false); focusPrompt(); }}
                      className="text-subtle transition-colors hover:text-white"
                    >
                      [esc]
                    </button>
                  </div>
                  <div className="space-y-0.5 px-3 py-2">
                    {HELP_COMMANDS.map(({ command: cmd, description: desc }) => (
                      <div key={cmd} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5">
                        <button
                          className="text-left text-fg hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cmd) {
                              setInput(cmd.replace(/<[^>]+>/g, ""));
                              setHistoryIndex(-1);
                              setShowHelp(false);
                              inputRef.current?.focus();
                            }
                          }}
                        >
                          {cmd}
                        </button>
                        <span className="text-subtle">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {gamePanelOpen && (
            <div ref={gamePanelRef} tabIndex={-1} role="group" aria-label="Terminal arcade">
              <TerminalGamesPanel
                activeGameId={activeGameId}
                hotkeysEnabled={gameHotkeysEnabled}
                onSelectGame={launchGame}
                onClose={closeGames}
                onBackToLibrary={openGameLibrary}
                onEnableHotkeys={(focusControls = false) => {
                  if (!activeGameId) return;
                  setGameHotkeysEnabled(true);
                  if (focusControls) gamePanelRef.current?.focus({ preventScroll: true });
                  else inputRef.current?.blur();
                }}
              />
            </div>
          )}

          {/* Past commands + output */}
          <div role="log" aria-label="Terminal history" aria-live="polite" aria-relevant="additions" className="space-y-3">
            {history.map((entry, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-start gap-2 text-xs">
                  <span className="shrink-0 select-none text-accent">$</span>
                  <span className="min-w-0 break-words text-fg">{entry.command}</span>
                </div>
                <pre className="whitespace-pre-wrap break-words pl-5 text-xs leading-relaxed text-muted">
                  {entry.output}
                </pre>
              </div>
            ))}
          </div>
          <p role="status" className="sr-only">{announcement}</p>

          {/* Active input prompt — part of the content flow */}
          <div className="flex items-start gap-2 text-xs">
            <span className="shrink-0 select-none pt-px text-accent">$</span>
            <div className="relative min-w-0 flex-1 overflow-hidden rounded-sm focus-within:ring-1 focus-within:ring-accent/70">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => { setInput(e.target.value); setHistoryIndex(-1); }}
                onKeyDown={handleKeyDown}
                onFocus={() => setGameHotkeysEnabled(false)}
                className="relative z-10 block min-h-5 w-full bg-transparent text-xs text-fg caret-accent outline-none placeholder:text-subtle"
                aria-label="Terminal command input"
                aria-describedby="terminal-instructions"
                aria-autocomplete="inline"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                placeholder="type a command..."
                spellCheck={false}
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex min-h-5 items-center whitespace-pre text-xs">
                <span className="invisible">{input}</span>
                {ghostSuggestion && (
                  <span className="text-subtle">{ghostSuggestion}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
