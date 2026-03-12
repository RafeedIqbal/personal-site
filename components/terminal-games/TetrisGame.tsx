"use client";

import { useEffect, useMemo, useState } from "react";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 18;
const DROP_INTERVAL_MS = 420;

const PIECES = [
  [[1, 1, 1, 1]],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 0, 0],
    [1, 1, 1],
  ],
  [
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
];

type Board = number[][];

interface ActivePiece {
  shape: number[][];
  x: number;
  y: number;
}

interface TetrisState {
  board: Board;
  activePiece: ActivePiece;
  score: number;
  lines: number;
  gameOver: boolean;
}

interface TetrisGameProps {
  hotkeysEnabled: boolean;
}

function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
}

function cloneShape(shape: number[][]) {
  return shape.map((row) => [...row]);
}

function createRandomPiece(): ActivePiece {
  const shape = cloneShape(PIECES[Math.floor(Math.random() * PIECES.length)]);

  return {
    shape,
    x: Math.floor((BOARD_WIDTH - shape[0].length) / 2),
    y: 0,
  };
}

function createInitialState(): TetrisState {
  return {
    board: createEmptyBoard(),
    activePiece: createRandomPiece(),
    score: 0,
    lines: 0,
    gameOver: false,
  };
}

function collides(board: Board, piece: ActivePiece) {
  for (let y = 0; y < piece.shape.length; y += 1) {
    for (let x = 0; x < piece.shape[y].length; x += 1) {
      if (!piece.shape[y][x]) continue;

      const boardX = piece.x + x;
      const boardY = piece.y + y;

      if (boardX < 0 || boardX >= BOARD_WIDTH || boardY >= BOARD_HEIGHT) {
        return true;
      }

      if (boardY >= 0 && board[boardY][boardX]) {
        return true;
      }
    }
  }

  return false;
}

function rotateShape(shape: number[][]) {
  return shape[0].map((_, columnIndex) =>
    shape.map((row) => row[columnIndex]).reverse()
  );
}

function mergePiece(board: Board, piece: ActivePiece) {
  const nextBoard = board.map((row) => [...row]);

  for (let y = 0; y < piece.shape.length; y += 1) {
    for (let x = 0; x < piece.shape[y].length; x += 1) {
      if (!piece.shape[y][x]) continue;

      const boardY = piece.y + y;
      if (boardY >= 0) {
        nextBoard[boardY][piece.x + x] = 1;
      }
    }
  }

  return nextBoard;
}

function clearLines(board: Board) {
  const keptRows = board.filter((row) => row.some((cell) => cell === 0));
  const cleared = BOARD_HEIGHT - keptRows.length;

  while (keptRows.length < BOARD_HEIGHT) {
    keptRows.unshift(Array(BOARD_WIDTH).fill(0));
  }

  return { board: keptRows, cleared };
}

function withSpawnedPiece(board: Board, score: number, lines: number): TetrisState {
  const activePiece = createRandomPiece();
  const gameOver = collides(board, activePiece);

  return {
    board,
    activePiece,
    score,
    lines,
    gameOver,
  };
}

function translateState(state: TetrisState, dx: number, dy: number) {
  if (state.gameOver) return state;

  const movedPiece = {
    ...state.activePiece,
    x: state.activePiece.x + dx,
    y: state.activePiece.y + dy,
  };

  if (!collides(state.board, movedPiece)) {
    return { ...state, activePiece: movedPiece };
  }

  if (dy === 0) {
    return state;
  }

  const mergedBoard = mergePiece(state.board, state.activePiece);
  const { board, cleared } = clearLines(mergedBoard);

  return withSpawnedPiece(
    board,
    state.score + cleared * 100 + 10,
    state.lines + cleared
  );
}

function rotateState(state: TetrisState) {
  if (state.gameOver) return state;

  const rotatedPiece = {
    ...state.activePiece,
    shape: rotateShape(state.activePiece.shape),
  };

  if (!collides(state.board, rotatedPiece)) {
    return { ...state, activePiece: rotatedPiece };
  }

  for (const offset of [-1, 1, -2, 2]) {
    const nudgedPiece = {
      ...rotatedPiece,
      x: rotatedPiece.x + offset,
    };

    if (!collides(state.board, nudgedPiece)) {
      return { ...state, activePiece: nudgedPiece };
    }
  }

  return state;
}

function hardDropState(state: TetrisState) {
  if (state.gameOver) return state;

  let droppedPiece = state.activePiece;

  while (
    !collides(state.board, {
      ...droppedPiece,
      y: droppedPiece.y + 1,
    })
  ) {
    droppedPiece = {
      ...droppedPiece,
      y: droppedPiece.y + 1,
    };
  }

  return translateState(
    {
      ...state,
      activePiece: droppedPiece,
    },
    0,
    1
  );
}

function getRenderedBoard(board: Board, piece: ActivePiece) {
  const renderedBoard = board.map((row) => [...row]);

  for (let y = 0; y < piece.shape.length; y += 1) {
    for (let x = 0; x < piece.shape[y].length; x += 1) {
      if (!piece.shape[y][x]) continue;

      const boardX = piece.x + x;
      const boardY = piece.y + y;

      if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
        renderedBoard[boardY][boardX] = 2;
      }
    }
  }

  return renderedBoard;
}

export default function TetrisGame({ hotkeysEnabled }: TetrisGameProps) {
  const [state, setState] = useState<TetrisState>(createInitialState);

  useEffect(() => {
    if (state.gameOver) return;

    const interval = window.setInterval(() => {
      setState((currentState) => translateState(currentState, 0, 1));
    }, DROP_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [state.gameOver]);

  useEffect(() => {
    if (!hotkeysEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (
        [
          "arrowleft",
          "arrowright",
          "arrowdown",
          "arrowup",
          "a",
          "d",
          "s",
          "w",
          " ",
        ].includes(key)
      ) {
        event.preventDefault();
      }

      if (key === "arrowleft" || key === "a") {
        setState((currentState) => translateState(currentState, -1, 0));
      } else if (key === "arrowright" || key === "d") {
        setState((currentState) => translateState(currentState, 1, 0));
      } else if (key === "arrowdown" || key === "s") {
        setState((currentState) => translateState(currentState, 0, 1));
      } else if (key === "arrowup" || key === "w") {
        setState((currentState) => rotateState(currentState));
      } else if (event.key === " ") {
        setState((currentState) => hardDropState(currentState));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkeysEnabled]);

  const renderedBoard = useMemo(
    () => getRenderedBoard(state.board, state.activePiece),
    [state.board, state.activePiece]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[#aaaaaa]">
          score: {state.score} · lines: {state.lines}
          {state.gameOver ? " · game over" : ""}
        </p>
        <button
          onClick={() => setState(createInitialState())}
          className="border border-[#333333] px-2 py-1 text-white hover:border-white transition-colors"
        >
          reset
        </button>
      </div>

      <div className="flex gap-4 items-start">
        <div className="grid gap-px bg-[#111111] p-px" style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))` }}>
          {renderedBoard.flatMap((row, rowIndex) =>
            row.map((cell, columnIndex) => (
              <div
                key={`${rowIndex}-${columnIndex}`}
                className={`h-4 w-4 ${
                  cell === 0
                    ? "bg-black"
                    : cell === 1
                      ? "bg-[#777777]"
                      : "bg-white"
                }`}
              />
            ))
          )}
        </div>

        <div className="space-y-2 text-[#666666] leading-relaxed max-w-[180px]">
          <p>rows clear for points; hard drop with space.</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setState((currentState) => rotateState(currentState))}
              className="border border-[#333333] px-2 py-1 text-white hover:border-white transition-colors col-span-3"
            >
              rotate
            </button>
            <button
              onClick={() => setState((currentState) => translateState(currentState, -1, 0))}
              className="border border-[#333333] px-2 py-1 text-white hover:border-white transition-colors"
            >
              left
            </button>
            <button
              onClick={() => setState((currentState) => translateState(currentState, 0, 1))}
              className="border border-[#333333] px-2 py-1 text-white hover:border-white transition-colors"
            >
              down
            </button>
            <button
              onClick={() => setState((currentState) => translateState(currentState, 1, 0))}
              className="border border-[#333333] px-2 py-1 text-white hover:border-white transition-colors"
            >
              right
            </button>
            <button
              onClick={() => setState((currentState) => hardDropState(currentState))}
              className="border border-[#333333] px-2 py-1 text-white hover:border-white transition-colors col-span-3"
            >
              hard drop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
