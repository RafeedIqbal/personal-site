"use client";

import { useMemo, useState } from "react";

const DISK_COUNT = 4;

function createInitialTowers() {
  return [Array.from({ length: DISK_COUNT }, (_, index) => DISK_COUNT - index), [], []];
}

export default function HanoiGame() {
  const [towers, setTowers] = useState<number[][]>(createInitialTowers);
  const [selectedTower, setSelectedTower] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);

  const solved = useMemo(
    () => towers[1].length === DISK_COUNT || towers[2].length === DISK_COUNT,
    [towers]
  );

  const reset = () => {
    setTowers(createInitialTowers());
    setSelectedTower(null);
    setMoves(0);
  };

  const handleTowerClick = (targetTower: number) => {
    if (solved) return;

    if (selectedTower === null) {
      if (towers[targetTower].length > 0) {
        setSelectedTower(targetTower);
      }
      return;
    }

    if (selectedTower === targetTower) {
      setSelectedTower(null);
      return;
    }

    const sourceStack = towers[selectedTower];
    const targetStack = towers[targetTower];
    const disk = sourceStack[sourceStack.length - 1];
    const topTargetDisk = targetStack[targetStack.length - 1];

    if (!disk) {
      setSelectedTower(null);
      return;
    }

    if (topTargetDisk && topTargetDisk < disk) {
      if (targetStack.length > 0) {
        setSelectedTower(targetTower);
      }
      return;
    }

    const nextTowers = towers.map((stack) => [...stack]);
    nextTowers[selectedTower].pop();
    nextTowers[targetTower].push(disk);

    setTowers(nextTowers);
    setSelectedTower(null);
    setMoves((currentMoves) => currentMoves + 1);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <p className="text-[#aaaaaa]">
          {solved
            ? `Solved in ${moves} moves. Minimum: ${2 ** DISK_COUNT - 1}.`
            : `Moves: ${moves} · Move the full stack to another tower.`}
        </p>
        <button
          onClick={reset}
          className="border border-[#333333] px-2 py-1 text-white hover:border-white transition-colors"
        >
          reset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {towers.map((tower, towerIndex) => {
          const isSelected = towerIndex === selectedTower;

          return (
            <button
              key={towerIndex}
              onClick={() => handleTowerClick(towerIndex)}
              className={`border rounded px-2 py-3 min-h-[180px] flex flex-col justify-end items-center gap-1 transition-colors ${
                isSelected
                  ? "border-white bg-[rgba(255,255,255,0.05)]"
                  : "border-[#333333] hover:border-[#666666]"
              }`}
            >
              <div className="relative h-32 w-full flex items-end justify-center">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-28 w-px bg-[#333333]" />
                <div className="relative z-10 h-full w-full flex flex-col justify-end items-center gap-1">
                  {[...tower].reverse().map((disk) => (
                    <div
                      key={disk}
                      className="h-4 border border-white/50 bg-[rgba(255,255,255,0.08)]"
                      style={{ width: `${30 + disk * 24}px` }}
                    />
                  ))}
                </div>
              </div>
              <div className="w-full h-px bg-[#1a1a1a]" />
              <div className="pt-1">
                <span className="text-[#666666]">tower {towerIndex + 1}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
