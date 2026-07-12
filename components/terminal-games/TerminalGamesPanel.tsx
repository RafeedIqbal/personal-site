"use client";

import { TERMINAL_GAMES, type TerminalGameId } from "../../lib/terminal-games";
import HanoiGame from "./HanoiGame";
import SpaceInvadersGame from "./SpaceInvadersGame";
import TetrisGame from "./TetrisGame";
import TicTacToeGame from "./TicTacToeGame";

interface TerminalGamesPanelProps {
  activeGameId: TerminalGameId | null;
  hotkeysEnabled: boolean;
  onSelectGame: (gameId: TerminalGameId) => void;
  onClose: () => void;
  onBackToLibrary: () => void;
  onEnableHotkeys: () => void;
}

function renderGame(gameId: TerminalGameId, hotkeysEnabled: boolean) {
  if (gameId === "hanoi") {
    return <HanoiGame />;
  }

  if (gameId === "tetris") {
    return <TetrisGame hotkeysEnabled={hotkeysEnabled} />;
  }

  if (gameId === "spaceinvaders") {
    return <SpaceInvadersGame hotkeysEnabled={hotkeysEnabled} />;
  }

  return <TicTacToeGame />;
}

export default function TerminalGamesPanel({
  activeGameId,
  hotkeysEnabled,
  onSelectGame,
  onClose,
  onBackToLibrary,
  onEnableHotkeys,
}: TerminalGamesPanelProps) {
  const activeGame = TERMINAL_GAMES.find((game) => game.id === activeGameId) ?? null;

  return (
    <div
      className="rounded-md border border-white/10 bg-white/[0.02] text-xs"
      onClick={(event) => {
        event.stopPropagation();
        onEnableHotkeys();
      }}
    >
      <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-3 py-2">
        <div>
          <p className="font-bold text-fg">terminal arcade</p>
          <p className="text-subtle">
            Run <span className="text-fg">games</span> to reopen this list or{" "}
            <span className="text-fg">close game</span> to dismiss it.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {activeGame && (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onBackToLibrary();
              }}
              className="text-subtle transition-colors hover:text-white"
            >
              [library]
            </button>
          )}
          <button
            onClick={(event) => {
              event.stopPropagation();
              onClose();
            }}
            className="text-subtle transition-colors hover:text-white"
          >
            [close]
          </button>
        </div>
      </div>

      <div className="space-y-4 px-3 py-3">
        {activeGame ? (
          <div className="rounded border border-white/[0.07] bg-black/30">
            <div className="flex items-center justify-between gap-4 border-b border-white/[0.07] px-3 py-2">
              <div>
                <p className="font-bold text-fg">{activeGame.title}</p>
                <p className="text-subtle">{activeGame.controls}</p>
              </div>
              <span className={`shrink-0 ${hotkeysEnabled ? "text-accent" : "text-subtle"}`}>
                {hotkeysEnabled ? "[controls armed]" : "[click panel to arm controls]"}
              </span>
            </div>
            <div className="p-3">{renderGame(activeGame.id, hotkeysEnabled)}</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {TERMINAL_GAMES.map((game) => (
              <button
                key={game.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectGame(game.id);
                }}
                className="rounded border border-white/10 px-3 py-2 text-left transition-colors hover:border-accent/60 hover:bg-white/[0.03]"
              >
                <p className="font-bold text-fg">{game.title}</p>
                <p className="mt-1 text-accent">{game.command}</p>
                <p className="mt-2 leading-relaxed text-subtle">{game.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
