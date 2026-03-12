"use client";

import { useEffect, useMemo, useState } from "react";

const BOARD_WIDTH = 12;
const BOARD_HEIGHT = 14;
const PLAYER_ROW = BOARD_HEIGHT - 1;
const TICK_MS = 110;
const INVADER_STEP_TICKS = 7;
const BULLET_SPEED = 2;

interface Point {
  x: number;
  y: number;
}

interface SpaceInvadersState {
  playerX: number;
  bullet: Point | null;
  invaders: Point[];
  direction: -1 | 1;
  tick: number;
  score: number;
  gameOver: boolean;
  win: boolean;
}

interface SpaceInvadersGameProps {
  hotkeysEnabled: boolean;
}

function createInitialInvaders() {
  const invaders: Point[] = [];

  for (let row = 0; row < 3; row += 1) {
    for (let column = 0; column < 7; column += 1) {
      invaders.push({ x: column + 2, y: row + 1 });
    }
  }

  return invaders;
}

function createInitialState(): SpaceInvadersState {
  return {
    playerX: Math.floor(BOARD_WIDTH / 2),
    bullet: null,
    invaders: createInitialInvaders(),
    direction: 1,
    tick: 0,
    score: 0,
    gameOver: false,
    win: false,
  };
}

function movePlayer(state: SpaceInvadersState, delta: number) {
  if (state.gameOver || state.win) return state;

  return {
    ...state,
    playerX: Math.max(0, Math.min(BOARD_WIDTH - 1, state.playerX + delta)),
  };
}

function fireBullet(state: SpaceInvadersState) {
  if (state.gameOver || state.win || state.bullet) return state;

  return {
    ...state,
    bullet: { x: state.playerX, y: PLAYER_ROW - 1 },
  };
}

function advanceBullet(bullet: Point | null, invaders: Point[]) {
  if (!bullet) {
    return {
      bullet: null,
      invaders,
      scoreDelta: 0,
    };
  }

  let nextBullet = { ...bullet };

  for (let step = 0; step < BULLET_SPEED; step += 1) {
    nextBullet = {
      ...nextBullet,
      y: nextBullet.y - 1,
    };

    if (nextBullet.y < 0) {
      return {
        bullet: null,
        invaders,
        scoreDelta: 0,
      };
    }

    const hitIndex = invaders.findIndex(
      (invader) => invader.x === nextBullet.x && invader.y === nextBullet.y
    );

    if (hitIndex !== -1) {
      return {
        bullet: null,
        invaders: invaders.filter((_, index) => index !== hitIndex),
        scoreDelta: 100,
      };
    }
  }

  return {
    bullet: nextBullet,
    invaders,
    scoreDelta: 0,
  };
}

function stepState(state: SpaceInvadersState): SpaceInvadersState {
  if (state.gameOver || state.win) return state;

  let invaders = state.invaders.map((invader) => ({ ...invader }));
  let bullet = state.bullet;
  let score = state.score;

  if (!bullet) {
    bullet = { x: state.playerX, y: PLAYER_ROW - 1 };
  }

  const bulletStep = advanceBullet(bullet, invaders);
  bullet = bulletStep.bullet;
  invaders = bulletStep.invaders;
  score += bulletStep.scoreDelta;

  let direction = state.direction;
  const tick = state.tick + 1;

  if (invaders.length > 0 && tick % INVADER_STEP_TICKS === 0) {
    const touchingEdge = invaders.some(
      (invader) =>
        (direction === 1 && invader.x >= BOARD_WIDTH - 1) ||
        (direction === -1 && invader.x <= 0)
    );

    if (touchingEdge) {
      invaders = invaders.map((invader) => ({
        ...invader,
        y: invader.y + 1,
      }));
      direction = direction === 1 ? -1 : 1;
    } else {
      invaders = invaders.map((invader) => ({
        ...invader,
        x: invader.x + direction,
      }));
    }
  }

  const gameOver = invaders.some((invader) => invader.y >= PLAYER_ROW);
  const win = invaders.length === 0;

  return {
    ...state,
    bullet,
    direction,
    invaders,
    tick,
    score,
    gameOver,
    win,
  };
}

function getRenderedBoard(state: SpaceInvadersState) {
  const board = Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill("."));

  for (const invader of state.invaders) {
    board[invader.y][invader.x] = "M";
  }

  if (state.bullet && state.bullet.y >= 0) {
    board[state.bullet.y][state.bullet.x] = "|";
  }

  board[PLAYER_ROW][state.playerX] = "A";

  return board;
}

export default function SpaceInvadersGame({ hotkeysEnabled }: SpaceInvadersGameProps) {
  const [state, setState] = useState<SpaceInvadersState>(createInitialState);

  useEffect(() => {
    if (state.gameOver || state.win) return;

    const interval = window.setInterval(() => {
      setState((currentState) => stepState(currentState));
    }, TICK_MS);

    return () => window.clearInterval(interval);
  }, [state.gameOver, state.win]);

  useEffect(() => {
    if (!hotkeysEnabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (["arrowleft", "arrowright", "a", "d", " "].includes(key)) {
        event.preventDefault();
      }

      if (key === "arrowleft" || key === "a") {
        setState((currentState) => movePlayer(currentState, -1));
      } else if (key === "arrowright" || key === "d") {
        setState((currentState) => movePlayer(currentState, 1));
      } else if (event.key === " ") {
        setState((currentState) => fireBullet(currentState));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hotkeysEnabled]);

  const renderedBoard = useMemo(() => getRenderedBoard(state), [state]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[#aaaaaa]">
          score: {state.score}
          {state.win ? " · fleet cleared" : state.gameOver ? " · invasion successful" : ""}
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
                className={`h-4 w-4 flex items-center justify-center text-[10px] ${
                  cell === "."
                    ? "bg-black text-transparent"
                    : cell === "M"
                      ? "bg-[#111111] text-white"
                      : cell === "|"
                        ? "bg-black text-[#cccccc]"
                        : "bg-[#111111] text-white"
                }`}
              >
                {cell}
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 text-[#666666] leading-relaxed max-w-[180px]">
          <p>clear every invader before the wave reaches your row.</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setState((currentState) => movePlayer(currentState, -1))}
              className="border border-[#333333] px-2 py-1 text-white hover:border-white transition-colors"
            >
              left
            </button>
            <button
              onClick={() => setState((currentState) => movePlayer(currentState, 1))}
              className="border border-[#333333] px-2 py-1 text-white hover:border-white transition-colors"
            >
              right
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
