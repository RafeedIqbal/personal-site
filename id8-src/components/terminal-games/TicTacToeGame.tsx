"use client";

import { useMemo, useState } from "react";

type Cell = "X" | "O" | null;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board: Cell[]) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  return null;
}

function chooseComputerMove(board: Cell[]) {
  const emptyCells = board
    .map((cell, index) => (cell === null ? index : -1))
    .filter((index) => index !== -1);

  const tryLine = (mark: Exclude<Cell, null>) => {
    for (const [a, b, c] of WIN_LINES) {
      const line = [board[a], board[b], board[c]];
      const openSpots = [a, b, c].filter((index) => board[index] === null);

      if (line.filter((cell) => cell === mark).length === 2 && openSpots.length === 1) {
        return openSpots[0];
      }
    }

    return null;
  };

  return (
    tryLine("O") ??
    tryLine("X") ??
    (board[4] === null ? 4 : null) ??
    [0, 2, 6, 8].find((index) => board[index] === null) ??
    emptyCells[0] ??
    null
  );
}

export default function TicTacToeGame() {
  const [board, setBoard] = useState<Cell[]>(Array<Cell>(9).fill(null));

  const winner = useMemo(() => getWinner(board), [board]);
  const isDraw = useMemo(
    () => !winner && board.every((cell) => cell !== null),
    [board, winner]
  );

  const status = winner
    ? winner === "X"
      ? "You win."
      : "Terminal wins."
    : isDraw
      ? "Draw."
      : "Your move.";

  const handleMove = (index: number) => {
    if (board[index] || winner || isDraw) return;

    const nextBoard = [...board];
    nextBoard[index] = "X";

    if (getWinner(nextBoard) || nextBoard.every((cell) => cell !== null)) {
      setBoard(nextBoard);
      return;
    }

    const computerMove = chooseComputerMove(nextBoard);
    if (computerMove !== null) {
      nextBoard[computerMove] = "O";
    }

    setBoard(nextBoard);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[#aaaaaa]">{status}</p>
        <button
          onClick={() => setBoard(Array<Cell>(9).fill(null))}
          className="border border-[#333333] px-2 py-1 text-white hover:border-white transition-colors"
        >
          reset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 max-w-[240px]">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleMove(index)}
            className="aspect-square border border-[#333333] text-white text-2xl font-bold hover:border-white transition-colors disabled:opacity-60"
            disabled={Boolean(cell) || Boolean(winner) || isDraw}
          >
            {cell ?? "·"}
          </button>
        ))}
      </div>
    </div>
  );
}
