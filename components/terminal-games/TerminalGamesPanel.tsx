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
  onEnableHotkeys,
}: TerminalGamesPanelProps) {
  const activeGame = TERMINAL_GAMES.find((game) => game.id === activeGameId) ?? null;

  return (
    <div
      className="border border-[rgba(255,255,255,0.1)] bg-[rgba(10,10,10,0.42)] backdrop-blur-[4px] rounded text-xs"
      onClick={(event) => {
        event.stopPropagation();
        onEnableHotkeys();
      }}
    >
      <div className="flex items-center justify-between gap-4 px-3 py-2 border-b border-[#1a1a1a]">
        <div>
          <p className="text-white font-bold">terminal arcade</p>
          <p className="text-[#555555]">
            Run <span className="text-white">games</span> to reopen this list or{" "}
            <span className="text-white">close game</span> to dismiss it.
          </p>
        </div>
        <button
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="text-[#555555] hover:text-white transition-colors shrink-0"
        >
          [close]
        </button>
      </div>

      <div className="px-3 py-3 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {TERMINAL_GAMES.map((game) => {
            const isActive = game.id === activeGameId;

            return (
              <button
                key={game.id}
                onClick={(event) => {
                  event.stopPropagation();
                  onSelectGame(game.id);
                }}
                className={`border px-3 py-2 text-left transition-colors ${
                  isActive
                    ? "border-white bg-[rgba(255,255,255,0.08)]"
                    : "border-[#333333] hover:border-[#666666] hover:bg-[rgba(255,255,255,0.03)]"
                }`}
              >
                <p className="text-white font-bold">{game.title}</p>
                <p className="text-[#888888] mt-1">{game.command}</p>
                <p className="text-[#555555] mt-2 leading-relaxed">{game.description}</p>
              </button>
            );
          })}
        </div>

        {activeGame ? (
          <div className="border border-[#1a1a1a] bg-[rgba(0,0,0,0.28)] rounded">
            <div className="flex items-center justify-between gap-4 px-3 py-2 border-b border-[#1a1a1a]">
              <div>
                <p className="text-white font-bold">{activeGame.title}</p>
                <p className="text-[#555555]">{activeGame.controls}</p>
              </div>
              <span className="text-[#555555] shrink-0">
                {hotkeysEnabled ? "[controls armed]" : "[click panel to arm controls]"}
              </span>
            </div>
            <div className="p-3">{renderGame(activeGame.id, hotkeysEnabled)}</div>
          </div>
        ) : (
          <div className="border border-dashed border-[#333333] px-3 py-4 text-[#555555]">
            Select a game above or run a command like <span className="text-white">play tetris</span>.
          </div>
        )}
      </div>
    </div>
  );
}
