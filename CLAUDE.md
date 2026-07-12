# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A terminal-styled personal portfolio: Next.js 16 (App Router) + React 19 + Tailwind v4 + Framer Motion. Everything renders client-side; there is no backend or data fetching. Near-black (`#060607`) with a green accent (`#4ade80`); JetBrains Mono body, Space Grotesk headings.

## Commands

Run from the repo root.

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (Next.js + TypeScript ruleset)

There is no test runner. `npm run lint` is the only automated check; smoke-test UI changes in the browser.

## Architecture

**Two synchronized views of one dataset.** The page shows the same portfolio content twice: as scrolling sections (`sections/`, single centered 1080px column) and as an interactive shell (`components/InteractiveTerminal.tsx`, a bottom-centered overlay toggled by the backtick key or the sidebar's `>_ terminal` button). Both read from `lib/content.ts`, which is the single source of truth (`PROFILE`, `EDUCATION`, `EXPERIENCE`, `PROJECTS`, `WEBSITES`, `SKILLS`). Edit content there once and both views update.

**Terminal overlay lifecycle.** `app/page.tsx` owns `terminalOpen` and the backtick `keydown` listener (ignored while typing in an input/textarea/contenteditable). `InteractiveTerminal` receives `{ open, onClose }`, stays mounted on desktop, and returns `null` when closed — so command history survives toggles, but an in-progress game unmounts (resets) on close. Escape handling lives on a `window` listener inside the component (the input is blurred while a game is armed) and cascades: help card → games panel → close overlay. There is deliberately no body scroll lock: `scrollTarget` commands scroll the page behind the dimmed backdrop. The panel grows from 440px to `min(78vh, 700px)` while the games panel is open.

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

**Games.** Each game is a self-contained component in `components/terminal-games/`. The registry lives in `lib/terminal-games.ts` (`TERMINAL_GAMES`, plus the `TerminalGameId` union and `resolveTerminalGameId` for alias matching like "tic tac toe" → `tictactoe`). `runCommand` turns `games`/`play <x>`/`close game` into a `gameAction`; `InteractiveTerminal` interprets that to drive panel state (`gamePanelOpen`, `activeGameId`, `gameHotkeysEnabled`) and `TerminalGamesPanel.renderGame` switches on the id to mount the component. The panel shows the library grid only while no game is active; the `[library]` button (via the `onBackToLibrary` prop) returns to it. Adding a game = registry entry + `TerminalGameId` union member + component + `renderGame` case. Keyboard-driven games (Tetris, Space Invaders) take a `hotkeysEnabled` prop; controls only "arm" after the user clicks the panel (so typing in the terminal isn't captured by the game).

**Sections.** Every numbered section wraps its content in `components/SectionHeader.tsx` (`{ index, command, right?, delay?, children }`), which renders the accent section number, a `$ <command>` h2, a hairline rule, and the scroll-reveal (framer-motion `useInView` + the `js-reveal` class that the noscript fallback in `app/layout.tsx` depends on). The hero doesn't use it (its entry is pure-CSS `fade-up` staggering). The sidebar (`components/Nav.tsx`) keeps the ASCII file-tree with a scanline scroll-spy (active = last section whose top crossed 40% of the viewport; page bottom forces the last section, since short final sections never reach the scanline) and also hosts the brand, the `>_ terminal` button (`onOpenTerminal` prop), and a resume link. `components/BackgroundEffect.tsx` draws the mouse-reactive ASCII grid at 50% opacity and skips characters inside exclusion rects measured around visible text (refreshed on scroll/resize/fonts-ready).

**Mobile vs. desktop split** lives in `app/page.tsx`. The content sections always render (so they ship in the server HTML for SEO); only client-only chrome is gated. A `matchMedia("(max-width: 767px)")` check sets `isMobile`, and chrome is gated on `isMobile === false` (not `!isMobile`, so it stays absent while the value is `null` during SSR/first paint — avoiding hydration mismatch): the boot sequence, side nav, animated background, and terminal overlay (plus its backtick listener). Mobile renders only the stacked sections + footer; this is a **deliberate** choice — the terminal and keyboard-driven games are desktop-only. The boot overlay plays once per session (guarded by `sessionStorage`) and is skipped entirely under `prefers-reduced-motion`.

## Conventions

- All UI components are client components (`"use client"`). No server components hold logic here.
- TypeScript strict mode; 2-space indent, semicolons, double quotes. `PascalCase` for component/section files, `camelCase` for helpers.
- `@/*` path alias maps to repo root (`tsconfig.json`), though most imports are relative.
- Theme tokens (`--color-*`, fonts) are defined via Tailwind v4 `@theme inline` in `app/globals.css`; style components with Tailwind utilities (`text-accent`, `text-muted`, `text-subtle`, `text-faint`, `font-grotesk`, …). Palette: `#060607` bg, `#ececec` fg, gray scale, single green accent `#4ade80`. JetBrains Mono for body/terminal text, Space Grotesk (`font-grotesk`) for display headings.
- Custom classes in `globals.css` (`.cursor-blink`, `.fade-up`, `.pulse-dot`, `.kbd`) are unlayered, so they beat Tailwind utilities in the cascade — don't try to override their properties with arbitrary utilities on the same element (the hero renders its own cursor block with `animate-[blink…]` for exactly this reason).

## Notes

- `AGENTS.md` and `README.md` cover the same ground at a higher level; keep this file in sync if those change.
- `.gitignore` has an id8-managed block — leave the `# >>> id8-managed` markers intact.
- `Resume/` and `public/` are static assets, not runtime code.
