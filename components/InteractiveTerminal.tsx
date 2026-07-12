"use client";

import { useState, useRef, useEffect, useMemo, KeyboardEvent } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { runCommand, AVAILABLE_COMMANDS, HELP_COMMANDS } from "../lib/terminal-commands";
import type { TerminalGameId } from "../lib/terminal-games";

// The games only load when the panel first opens, keeping them out of the
// terminal's initial chunk.
const TerminalGamesPanel = dynamic(() => import("./terminal-games/TerminalGamesPanel"), {
  ssr: false,
  loading: () => <p className="text-xs text-subtle">loading arcade...</p>,
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
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showHelp, setShowHelp] = useState(false);
  const [gamePanelOpen, setGamePanelOpen] = useState(false);
  const [activeGameId, setActiveGameId] = useState<TerminalGameId | null>(null);
  const [gameHotkeysEnabled, setGameHotkeysEnabled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const gamePanelRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Auto-scroll to keep prompt visible
  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history, showHelp]);

  // Opening a game grows the panel; align the arcade heading with the top of
  // the body so the game title and controls stay visible.
  useEffect(() => {
    const body = bodyRef.current;
    const panel = gamePanelRef.current;
    if (!gamePanelOpen || !body || !panel) return;
    const delta = panel.getBoundingClientRect().top - body.getBoundingClientRect().top;
    body.scrollTo({ top: body.scrollTop + delta - 4, behavior: "smooth" });
  }, [gamePanelOpen, activeGameId]);

  // Focus the prompt whenever the overlay opens (the input's onFocus handler
  // disarms game hotkeys, so reopening always starts with the prompt live),
  // and hand focus back to whatever opened the overlay when it closes.
  useEffect(() => {
    if (open) {
      lastFocusedRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      inputRef.current?.focus();
    } else {
      lastFocusedRef.current?.focus();
      lastFocusedRef.current = null;
    }
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

  // Keep Tab cycling inside the dialog (it's aria-modal) — including while a
  // game has the input blurred — without stealing Tab from autocomplete.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Tab" || e.defaultPrevented) return;
      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>("button, input, a[href]")
      ).filter((el) => !el.hasAttribute("disabled"));
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

    if (trimmed.toLowerCase() === "help" || trimmed.toLowerCase() === "--help") {
      setShowHelp((prev) => !prev);
      setCmdHistory((prev) => [trimmed, ...prev]);
      setHistoryIndex(-1);
      setInput("");
      return;
    }

    const result = runCommand(trimmed);

    if (result?.output === "__CLEAR__") {
      setHistory([]);
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
        behavior: "smooth",
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
    // Tab only completes the ghost suggestion; otherwise it stays a focus key
    // (Shift+Tab always is) so keyboard users can reach the dialog's buttons.
    if (e.key === "Tab") {
      if (!e.shiftKey && ghostSuggestion) {
        e.preventDefault();
        setInput(input + ghostSuggestion);
      }
      return;
    }
    if (e.key === "ArrowRight" && ghostSuggestion && inputRef.current) {
      if (inputRef.current.selectionStart === input.length) {
        e.preventDefault();
        setInput(input + ghostSuggestion);
      }
      return;
    }
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(next);
      setInput(cmdHistory[next] ?? "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(historyIndex - 1, -1);
      setHistoryIndex(next);
      setInput(next === -1 ? "" : cmdHistory[next] ?? "");
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
        className="absolute bottom-11 left-1/2 flex w-[min(760px,calc(100vw-48px))] -translate-x-1/2 flex-col overflow-hidden rounded-xl border border-white/[0.12] bg-[rgba(9,10,12,0.92)] shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-[16px]"
        style={{ height: gamePanelOpen ? "min(78vh, 700px)" : 440 }}
        onClick={focusPrompt}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-2.5">
          <span className="text-xs text-subtle">
            <span className="text-accent">●</span> visitor@rafeed.dev
          </span>
          <button
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
          className="flex flex-1 flex-col space-y-3 overflow-y-auto px-4 py-3"
        >
          {/* Welcome */}
          <div className="space-y-0.5 text-xs text-subtle">
            <p>Welcome to rafeed.dev — you found the terminal.</p>
            <p>Type <span className="text-fg">help</span> for commands. Tab to autocomplete.</p>
            <p>Type <span className="text-fg">games</span> if bored.</p>
          </div>

          {/* Help card */}
          <AnimatePresence>
            {showHelp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <div className="my-1 rounded-md border border-white/10 bg-white/[0.02] text-xs">
                  <div className="flex items-center justify-between border-b border-white/[0.07] px-3 py-2">
                    <span className="font-bold text-fg">available commands</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowHelp(false); }}
                      className="text-subtle transition-colors hover:text-white"
                    >
                      [esc]
                    </button>
                  </div>
                  <div className="space-y-0.5 px-3 py-2">
                    {HELP_COMMANDS.map(({ command: cmd, description: desc }) => (
                      <div key={cmd} className="flex justify-between gap-4">
                        <button
                          className="text-left text-fg hover:underline"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (cmd && !cmd.includes("<")) {
                              setInput(cmd);
                              setShowHelp(false);
                              inputRef.current?.focus();
                            }
                          }}
                        >
                          {cmd}
                        </button>
                        <span className="shrink-0 text-right text-subtle">{desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {gamePanelOpen && (
            <div ref={gamePanelRef}>
              <TerminalGamesPanel
                activeGameId={activeGameId}
                hotkeysEnabled={gameHotkeysEnabled}
                onSelectGame={launchGame}
                onClose={closeGames}
                onBackToLibrary={openGameLibrary}
                onEnableHotkeys={() => {
                  if (!activeGameId) return;
                  setGameHotkeysEnabled(true);
                  inputRef.current?.blur();
                }}
              />
            </div>
          )}

          {/* Past commands + output */}
          {history.map((entry, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-start gap-2 text-xs">
                <span className="shrink-0 select-none text-accent">$</span>
                <span className="text-fg">{entry.command}</span>
              </div>
              <pre className="whitespace-pre-wrap pl-5 text-xs leading-relaxed text-muted">
                {entry.output}
              </pre>
            </div>
          ))}

          {/* Active input prompt — part of the content flow */}
          <div className="flex items-start gap-2 text-xs">
            <span className="shrink-0 select-none pt-px text-accent">$</span>
            <div className="relative min-w-0 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setGameHotkeysEnabled(false)}
                className="terminal-input absolute inset-0 z-10 h-full w-full opacity-0"
                aria-label="Terminal command input"
                autoComplete="off"
                spellCheck={false}
              />
              <div className="pointer-events-none flex min-h-[1rem] items-center">
                <span className="whitespace-pre text-xs text-fg">{input}</span>
                {ghostSuggestion && (
                  <span className="whitespace-pre text-xs text-faint">{ghostSuggestion}</span>
                )}
                <span className="cursor-blink" />
                {!input && !ghostSuggestion && (
                  <span className="absolute left-0 text-xs text-faint">
                    type a command...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
