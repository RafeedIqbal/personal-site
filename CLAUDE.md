# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

A terminal-styled personal portfolio: Next.js 16 (App Router), React 19 and Tailwind v4, with no animation library (the terminal help fades in with CSS). Content is server-rendered; interactive components enhance it after hydration. There is no application backend. Graphite (`#111315` background, `#191c1f` surface) with a green accent (`#8faf9b`); Space Grotesk for reading text and headings, JetBrains Mono for commands and metadata.

## Commands

Run from the repo root.

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build
- `npm run start` — serve the production build
- `npm run lint` — ESLint (Next.js + TypeScript ruleset)

Run `npm run test:ui` for the production-build Playwright and axe suite. Install Chromium once with `npx playwright install chromium`; keep test-server port 3035 free. Also run `npm run lint`, `npm run typecheck`, and `npm run test:dependencies`. Pull requests and pushes run these checks in CI. Inspect actual screenshots for visual changes; automated scans do not prove full accessibility conformance.

## Architecture

**Two views of one dataset.** Scrolling sections (`sections/`) and the optional terminal (`components/InteractiveTerminal.tsx`) read `lib/content.ts`. The page curates three featured cases, four supporting cases, and three website previews; the terminal retains the complete project and website records. Keep shared facts and destinations in this file.

**Terminal overlay lifecycle.** `components/PortfolioShell.tsx` owns terminal state and the Ctrl + backtick toggle. A bare backtick does nothing, and the shortcut leaves other open dialogs (image viewers) alone but still closes the terminal from inside it. `InteractiveTerminal` is imported on first use and stays mounted on desktop so command history survives. It is a native `<dialog class="terminal-dialog">` opened with `showModal()` in a layout effect, so the browser makes the page inert, contains focus, and returns focus to the launcher or shortcut target on close; there is no hand-written focus trap, `inert`, or focus-restore code. Its contents render only from open until the dialog's `close` event, so games load separately and reset when they unmount. Every close path (Esc, a press and release on the backdrop, the close button, the shortcut) ends in the `close` event, which reports back through `onClose`. The backdrop is handled in the dialog's own pointer and click handlers (`clickedBackdrop` in `lib/dialog.ts`), not `closedby="any"`, which would send backdrop clicks through `cancel` and the Esc cascade. Esc steps back one layer at a time: help, then the arcade, then the terminal (`stepBack`). Inside the panel, the dialog's `keydown` handler cancels the Esc keydown for the inner steps, which stops the close request before it starts. `cancel` with `preventDefault()` alone is not enough: browsers stop honouring it after repeated close requests with no user activation between them, so a second quick Esc would close the terminal instead of the arcade. The `cancel` handler still steps back for close requests that skip that keydown (Esc while focus is on the body), when the event is cancelable. The page behind is inert and ignores scroll gestures (the global `dialog:modal`/`::backdrop` containment), but `scrollIntoView` still moves it when a command returns a `scrollTarget`. Help and games expand the panel from 440px to `min(78dvh, 700px)`.

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

**Games.** Each game is a self-contained component in `components/terminal-games/`. The registry lives in `lib/terminal-games.ts` (`TERMINAL_GAMES`, plus the `TerminalGameId` union and `resolveTerminalGameId` for alias matching like "tic tac toe" → `tictactoe`). `runCommand` turns `games`/`play <x>`/`close game` into a `gameAction`; `InteractiveTerminal` interprets that to drive panel state (`gamePanelOpen`, `activeGameId`, `gameHotkeysEnabled`) and `TerminalGamesPanel.renderGame` switches on the id to mount the component. The panel shows the library grid only while no game is active; the `Library` button (via the `onBackToLibrary` prop) returns to it. Adding a game = registry entry + `TerminalGameId` union member + component + `renderGame` case. Keyboard-driven games (Tetris, Space Invaders) take a `hotkeysEnabled` prop; controls arm on launch or explicit panel interaction and disarm whenever focus lands outside the games panel (so Space/arrows activate focused dialog controls instead of the game).

**Sections.** `components/SectionHeader.tsx` takes `{ id, command, title, description?, right? }` and renders a readable heading before its command label. Sections are immediately readable without reveal animations. Project outcomes precede native case disclosures. Supporting project headings are nested under “More projects.” `components/Nav.tsx` marks the last section whose top crosses 30% of the viewport, with Contact selected at the bottom. `components/BackgroundEffect.tsx` draws ASCII in empty space, excludes visible text and navigation, respects reduced motion, and stops animating when idle.

**Mobile vs. desktop split** lives in `components/PortfolioShell.tsx`, using a 1024px breakpoint. Sections are always server-rendered. Desktop adds the 224px sidebar, optional terminal, keyboard games, and ASCII canvas. Mobile uses a native expandable section menu; its header is sticky whenever scripting is enabled (a CSS `scripting` media query) and stays in normal flow without JavaScript. There is no boot sequence.

## /belong proposal page

`app/belong/` is a separate, unlisted page (noindex via metadata and an `X-Robots-Tag` header in `next.config.ts`; not in the sitemap, robots.txt or homepage). It uses a single light theme on Belong's own palette, defined in `app/belong/belong.css` (classes prefixed `bl-`, tokens scoped to `.belong`), and its layout loads Newsreader, Schibsted Grotesk, IBM Plex Sans and IBM Plex Mono only for that route.

- **Data is JSON, logic is pure.** The fictional E-2 files live in `lib/belong/case.json` (documents grouped by Belong's nine gates), the six injectable errors (as path patches) in `lib/belong/scenarios.json`. `lib/belong/checks.ts` holds every check, the router, `settle()`, the tile math and the horizontal `trail()` layout; it has no runtime imports so `npm run test:belong` (`scripts/belong-checks.test.mjs`, Node type stripping) can load it directly. Tile values and "caught by" labels must always come from these functions.
- **Page layout** borrows from editorial references while keeping Belong's palette: a giant serif hero (`sections/belong/Hero.tsx`) that hands off to a fixed `Masthead` with a scroll-spied section box (reads `[data-section]`), then open `Module`s from `components/belong/Doc.tsx`, separated by space rather than rules (Schibsted Grotesk titles over light Newsreader ledes; `tone="band"` is the dark architecture band). `Figure` adds a "fig. n" caption in a side column; `Numerals` and `Brace` are display devices.
- **The architecture is the centrepiece** (`sections/belong/Architecture.tsx`): fig. 1 `SystemFigure` (interactive layers with the proposed stack, contracts and stores; its error chips start the demo), fig. 2 `RoutingFigure`, fig. 3 `EvidenceFigure` (live checks for one node), fig. 4 `FeedbackLoop`, then guardrails.
- **The demo is a Belong-style app window** (`components/belong/Visualizer.tsx`, section III, fig. 5) that fits one desktop screen under the masthead. State is a reducer in `components/belong/demo.tsx` (`DemoProvider`), shared with fig. 1 and fig. 4; phase timing is `PACE`, and reduced motion jumps to the same end state.
- **Phones (below 760px) get their own layout, desktop is untouched.**
  - The demo runs edge to edge. The six errors sit in a 2-column grid.
  - Starting a run calls `showDemo()` (`demo.tsx`), which scrolls `#bl-stage` under the masthead (`#instrument` on desktop).
  - Container queries turn the stepper into a 7-segment rail with a caption and squeeze the tiles into two rows. The trail becomes a dot map with a row for each flagged node and a "List nodes" toggle.
  - The route card sits inline after the trail, with no fixed sheet. Anything that changes mid-run keeps a fixed height, so the tiles and trail never move.
  - Below 900px, fig. 1 is a vertical rail grouped by `TIERS`. It renders the layer detail twice (inline in the selected layer and as the desktop panel), and CSS shows one per breakpoint.
- Sources appear only in the footer's Table of Authorities (`sections/belong/Colophon.tsx`), cited in Bluebook form; the only disclaimer is the footer line.

## Conventions

- Keep content sections server-rendered. Add `"use client"` only to components that need browser interaction or React client hooks.
- TypeScript strict mode; 2-space indent, semicolons, double quotes. `PascalCase` for component/section files, `camelCase` for helpers.
- `@/*` path alias maps to repo root (`tsconfig.json`), though most imports are relative.
- Theme tokens (`--color-*`, fonts) live in `app/globals.css`; use Tailwind utilities for component styling. The main portfolio uses graphite, a restrained green accent, Space Grotesk, and JetBrains Mono. Other routes keep their own scoped themes.
- Unlayered custom classes in `globals.css` outrank Tailwind utilities; check the cascade when changing a shared selector.

## Notes

- `AGENTS.md` and `README.md` cover the same ground at a higher level; keep this file in sync if those change.
- Security headers live in `next.config.ts`. The production CSP allows only same-origin scripts, styles, images, fonts, media and connections (plus Supabase on `/publicus` and the Vercel toolbar on previews), so a new external origin must be added there or it is blocked in production. It keeps `'unsafe-inline'` because every page is prerendered; a nonce would force dynamic rendering.
- `.gitignore` has an id8-managed block — leave the `# >>> id8-managed` markers intact.
- `Resume/` and `public/` are static assets, not runtime code.
