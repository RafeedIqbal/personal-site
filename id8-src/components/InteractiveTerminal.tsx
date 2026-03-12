"use client";

import { useState, useRef, useEffect, useMemo, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { runCommand, AVAILABLE_COMMANDS } from "../lib/terminal-commands";
import type { TerminalGameId } from "../lib/terminal-games";
import TerminalGamesPanel from "./terminal-games/TerminalGamesPanel";

interface HistoryEntry {
  command: string;
  output: string;
}

interface TerminalProps {
  width: number;
}

export default function InteractiveTerminal({ width }: TerminalProps) {
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

  // Auto-scroll to keep prompt visible
  useEffect(() => {
    bodyRef.current?.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history, gamePanelOpen, activeGameId, showHelp]);

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
    setGameHotkeysEnabled(false);
  };

  const closeGames = () => {
    setGamePanelOpen(false);
    setActiveGameId(null);
    setGameHotkeysEnabled(false);
    inputRef.current?.focus();
  };

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
    if (e.key === "Escape") {
      setShowHelp(false);
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      if (ghostSuggestion) setInput(input + ghostSuggestion);
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

  const Prompt = ({ children }: { children?: React.ReactNode }) => (
    <div className="flex items-start gap-2 text-xs">
      <span className="text-[#555555] shrink-0 select-none">$</span>
      {children}
    </div>
  );

  return (
    <div
      style={{ width }}
      className="hidden lg:flex flex-col shrink-0 sticky top-0 h-screen bg-transparent"
      onClick={focusPrompt}
    >
      {/* Header — matched height */}
      <div className="h-10 flex items-center px-4 border-b border-[rgba(255,255,255,0.12)] shrink-0 bg-[rgba(0,0,0,0.16)] backdrop-blur-[3px]">
        <span className="text-xs text-[#555555]">visitor@rafeed.dev</span>
      </div>

      {/* Terminal body — single scrollable area, input is part of the flow */}
      <div
        ref={bodyRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3 flex flex-col bg-transparent"
      >
        {/* Welcome */}
        <div className="text-xs text-[#555555] space-y-0.5">
          <p>Welcome to rafeed.dev</p>
          <p>Type <span className="text-white">help</span> for commands. Tab to autocomplete.</p>
          <p>Type <span className="text-white">games</span> if bored.</p>
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
              <div className="border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,10,0.42)] backdrop-blur-[4px] rounded text-xs my-1">
                <div className="flex items-center justify-between px-3 py-2 border-b border-[#1a1a1a]">
                  <span className="font-bold text-white">available commands</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowHelp(false); }}
                    className="text-[#555555] hover:text-white transition-colors"
                  >
                    [esc]
                  </button>
                </div>
                <div className="px-3 py-2 space-y-0.5">
                  {[
                    ["whoami", "display identity"],
                    ["cat about.txt", "education & background"],
                    ["cat experience.log", "work history"],
                    ["ls projects/", "list projects"],
                    ["cat projects/<name>", "project details"],
                    ["env", "skills & tools"],
                    ["contact --help", "contact information"],
                    ["games", "open terminal arcade"],
                    ["play tetris", "launch a game"],
                    ["open linkedin", "open LinkedIn"],
                    ["open github", "open GitHub"],
                    ["clear", "clear terminal"],
                  ].map(([cmd, desc]) => (
                    <div key={cmd} className="flex justify-between gap-4">
                      <button
                        className="text-white hover:underline text-left"
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
                      <span className="text-[#444444] text-right shrink-0">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {gamePanelOpen && (
          <TerminalGamesPanel
            activeGameId={activeGameId}
            hotkeysEnabled={gameHotkeysEnabled}
            onSelectGame={launchGame}
            onClose={closeGames}
            onEnableHotkeys={() => {
              if (!activeGameId) return;
              setGameHotkeysEnabled(true);
              inputRef.current?.blur();
            }}
          />
        )}

        {/* Past commands + output */}
        {history.map((entry, i) => (
          <div key={i} className="space-y-1">
            <Prompt>
              <span className="text-white">{entry.command}</span>
            </Prompt>
            <pre className="text-[#aaaaaa] whitespace-pre-wrap pl-5 text-xs leading-relaxed">
              {entry.output}
            </pre>
          </div>
        ))}

        {/* Active input prompt — part of the content flow */}
        <div className="flex items-start gap-2 text-xs">
          <span className="text-[#555555] shrink-0 select-none pt-px">$</span>
          <div className="flex-1 relative min-w-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setGameHotkeysEnabled(false)}
              className="absolute inset-0 w-full h-full opacity-0 z-10"
              autoComplete="off"
              spellCheck={false}
              autoFocus
            />
            <div className="flex items-center min-h-[1rem] pointer-events-none">
              <span className="text-white text-xs whitespace-pre">{input}</span>
              {ghostSuggestion && (
                <span className="text-[#333333] text-xs whitespace-pre">{ghostSuggestion}</span>
              )}
              <span className="cursor-blink" />
              {!input && !ghostSuggestion && (
                <span className="text-[#333333] text-xs absolute left-0">
                  type a command...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
