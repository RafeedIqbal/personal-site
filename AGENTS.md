# Repository Guidelines

## Project Structure & Module Organization
This repository is centered on the Next.js app in `id8-src/`. Work from that directory for app changes.

- `id8-src/app/`: App Router entry points, layout, and global CSS.
- `id8-src/components/`: reusable UI pieces such as the terminal and navigation.
- `id8-src/sections/`: page-level content blocks (`Hero.tsx`, `Projects.tsx`, etc.).
- `id8-src/lib/`: content and command helpers.
- `id8-src/public/`: static assets.

Root-level files like `prd.md`, `tech_plan.md`, `screens/`, and `Resume/` are supporting docs and assets, not runtime code.

## Build, Test, and Development Commands
Run commands from `id8-src/`.

- `npm run dev`: start the local dev server at `http://localhost:3000`.
- `npm run build`: create the production build.
- `npm run start`: serve the production build locally.
- `npm run lint`: run ESLint with the Next.js and TypeScript ruleset.

Example:

```bash
cd id8-src
npm run dev
```

## Coding Style & Naming Conventions
Use TypeScript with strict typing and React function components. Follow the existing style:

- 2-space indentation, semicolons, and double quotes.
- `PascalCase` for components and section files, `camelCase` for variables, props, and helpers.
- Prefer the `@/*` path alias when imports would otherwise become noisy.
- Keep shared theme tokens in `id8-src/app/globals.css` and use Tailwind utility classes for component styling.

Run `npm run lint` before opening a PR.

## Testing Guidelines
There is no automated test runner configured yet, and no coverage gate is enforced. For now:

- treat `npm run lint` as the required automated check;
- smoke-test UI changes in the local app;
- include manual verification notes in the PR.

If you add tests, prefer colocated `*.test.tsx` or `*.test.ts` files near the feature they cover.

## Commit & Pull Request Guidelines
Git history is currently minimal (`Initial commit` plus a placeholder follow-up), so use clear imperative commit subjects going forward, for example: `Add terminal command autocomplete`.

PRs should include:

- a short summary of the change and why it was made;
- linked issue, task, or relevant section of `prd.md`;
- screenshots or screen recordings for visual updates;
- the commands you ran, such as `npm run lint`.

## Security & Configuration Tips
Do not commit secrets or local tooling config. Root `.gitignore` already excludes `.env`, `.mcp.json`, and `.codex/config.toml`; app-level ignores exclude `.next/`, `node_modules/`, and other generated files.
