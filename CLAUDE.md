# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A terminal-styled personal portfolio: Next.js 16 (App Router) + React 19 + Tailwind v4 + Framer Motion. Everything renders client-side; there is no backend or data fetching.

## Commands

Run from the repo root.

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (Next.js + TypeScript ruleset)

There is no test runner. `npm run lint` is the only automated check; smoke-test UI changes in the browser.

## Architecture

**Two synchronized views of one dataset.** The page shows the same portfolio content twice: as scrolling sections (`sections/`, left/main column) and as an interactive shell (`components/InteractiveTerminal.tsx`, right column). Both read from `lib/content.ts`, which is the single source of truth (`PROFILE`, `EDUCATION`, `EXPERIENCE`, `PROJECTS`, `WEBSITES`, `SKILLS`). Edit content there once and both views update.

**Terminal ↔ section coupling.** `runCommand` (in `lib/terminal-commands.ts`) is a pure function returning a `CommandResult { output, scrollTarget?, gameAction? }`. When a command has a `scrollTarget`, `InteractiveTerminal` calls `scrollIntoView` on the element with that `id`. Those `scrollTarget` strings **must match the `id` attributes on the `<section>` elements**:

| scrollTarget | section file | id |
|---|---|---|
| `whoami` | Hero.tsx | `whoami` |
| `about` | About.tsx | `about` |
| `experience` | Experience.tsx | `experience` |
| `projects` | Projects.tsx | `projects` |
| `websites` | Websites.tsx | `websites` |
| `env` | Skills.tsx | `env` |
| `contact` | Contact.tsx | `contact` |

**Adding/changing a terminal command** touches three places kept in sync by hand:
1. The matching branch in `runCommand` (`lib/terminal-commands.ts`).
2. `AVAILABLE_COMMANDS` in the same file — drives the fish-style ghost autocomplete.
3. `HELP_COMMANDS` in the same file — the single source of truth for the help card. `InteractiveTerminal.tsx` renders the card by mapping over it (no longer a hand-copied list). The `help` command is intercepted in `InteractiveTerminal`'s `handleSubmit` to toggle the card, so `runCommand` has no `help` branch.

**Games.** Each game is a self-contained component in `components/terminal-games/`. The registry lives in `lib/terminal-games.ts` (`TERMINAL_GAMES`, plus the `TerminalGameId` union and `resolveTerminalGameId` for alias matching like "tic tac toe" → `tictactoe`). `runCommand` turns `games`/`play <x>`/`close game` into a `gameAction`; `InteractiveTerminal` interprets that to drive panel state (`gamePanelOpen`, `activeGameId`, `gameHotkeysEnabled`) and `TerminalGamesPanel.renderGame` switches on the id to mount the component. Adding a game = registry entry + `TerminalGameId` union member + component + `renderGame` case. Keyboard-driven games (Tetris, Space Invaders) take a `hotkeysEnabled` prop; controls only "arm" after the user clicks the panel (so typing in the terminal isn't captured by the game).

**Mobile vs. desktop split** lives in `app/page.tsx`. The content sections always render (so they ship in the server HTML for SEO); only client-only chrome is gated. A `matchMedia("(max-width: 767px)")` check sets `isMobile`, and chrome is gated on `isMobile === false` (not `!isMobile`, so it stays absent while the value is `null` during SSR/first paint — avoiding hydration mismatch): the boot sequence, side nav, animated background, drag handle, and terminal column. Mobile renders only the stacked sections; this is a **deliberate** choice — the terminal and keyboard-driven games are desktop-only. Desktop adds the full three-column layout (Nav · sections · resizable terminal, drag-resizable 320–1200px). The boot overlay plays once per session (guarded by `sessionStorage`) and is skipped entirely under `prefers-reduced-motion`. The default terminal width is viewport-relative (~38%, clamped 360–720px).

## Conventions

- All UI components are client components (`"use client"`). No server components hold logic here.
- TypeScript strict mode; 2-space indent, semicolons, double quotes. `PascalCase` for component/section files, `camelCase` for helpers.
- `@/*` path alias maps to repo root (`tsconfig.json`), though most imports are relative.
- Theme tokens (`--color-*`, mono font) are defined via Tailwind v4 `@theme inline` in `app/globals.css`; style components with Tailwind utilities. The design is intentionally monochrome (black bg, white fg, gray scale) and uses JetBrains Mono everywhere.

## Notes

- `AGENTS.md` and `README.md` cover the same ground at a higher level; keep this file in sync if those change.
- `.gitignore` has an id8-managed block — leave the `# >>> id8-managed` markers intact.
- `Resume/` and `public/` are static assets, not runtime code.
