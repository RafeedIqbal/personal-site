export type TerminalGameId =
  | "hanoi"
  | "tetris"
  | "spaceinvaders"
  | "tictactoe";

export interface TerminalGameDefinition {
  id: TerminalGameId;
  title: string;
  command: string;
  aliases: string[];
  description: string;
  controls: string;
}

export const TERMINAL_GAMES: TerminalGameDefinition[] = [
  {
    id: "hanoi",
    title: "Towers of Hanoi",
    command: "play hanoi",
    aliases: ["hanoi", "towers of hanoi", "tower of hanoi"],
    description: "Move the full stack to another tower without placing a larger disk on a smaller one.",
    controls: "Click a tower to pick up a disk, then click another tower to place it.",
  },
  {
    id: "tetris",
    title: "Tetris",
    command: "play tetris",
    aliases: ["tetris"],
    description: "Stack falling tetrominoes, clear rows, and keep the board from filling up.",
    controls: "Arrow keys or WASD to move, Up/W to rotate, Space to hard drop.",
  },
  {
    id: "spaceinvaders",
    title: "Space Invaders",
    command: "play spaceinvaders",
    aliases: ["spaceinvaders", "space invaders", "space-invaders"],
    description: "Slide the cannon, fire upward, and clear the fleet before it lands.",
    controls: "Arrow keys or A/D to move.",
  },
  {
    id: "tictactoe",
    title: "Tic-Tac-Toe",
    command: "play tic-tac-toe",
    aliases: ["tic-tac-toe", "tictactoe", "tic tac toe"],
    description: "Beat the terminal in a quick 3x3 round.",
    controls: "Click a square to place X.",
  },
];

export function getTerminalGameDefinition(gameId: TerminalGameId) {
  return TERMINAL_GAMES.find((game) => game.id === gameId) ?? null;
}

export function getTerminalGamesListText() {
  return `Terminal games:

${TERMINAL_GAMES.map(
  (game) => `  ${game.command.padEnd(20, " ")}${game.title}`
).join("\n")}

Type \`play <game>\` to launch one, or run \`games\` again to reopen the launcher.`;
}

export function resolveTerminalGameId(input: string): TerminalGameId | null {
  const normalized = input.toLowerCase().trim().replace(/[\s-]+/g, "");

  for (const game of TERMINAL_GAMES) {
    const aliases = [game.id, ...game.aliases];
    if (aliases.some((alias) => alias.replace(/[\s-]+/g, "") === normalized)) {
      return game.id;
    }
  }

  return null;
}
