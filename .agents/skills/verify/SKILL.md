---
name: verify
description: Build, serve, and drive this portfolio in a headless browser to verify UI changes end-to-end.
---

# Verifying changes to this site

Surface: browser GUI. There is no test runner — verification is running the app and driving it.

## Build & serve

```bash
npm run build
PORT=3001 npm run start   # port 3000 is often held by a personal dev server — don't kill it
```

SSR sanity check (sections must ship in server HTML; chrome must not):
`curl -s localhost:3001 | grep -o 'id="[a-z]*"'` → expect whoami/about/experience/projects/websites/env/contact, and no `visitor@rafeed.dev`.

## Drive (Playwright, install in a scratch dir — not this repo)

Key flows and their gotchas:

- **Boot overlay** plays only on the first load per browser context (sessionStorage `rafeed:booted`), takes ~2.5s, and is skipped under `reducedMotion: "reduce"`. Check for it with `waitUntil: "domcontentloaded"` — `networkidle` can outlast it.
- **Terminal overlay** (desktop only): opens via the sidebar `>_ terminal` button or the backtick key; `[role="dialog"][aria-label="Terminal"]`. Input autofocuses — type directly. Esc cascade: help card → games panel → overlay. Backdrop click closes.
- **Unsubmitted input persists** across close/reopen (like a real shell) — `fill("")` the input before typing a fresh command in a driver script.
- `getByText` is case-insensitive/substring: terminal output assertions can false-match page content behind the translucent overlay. Scope to `[role="dialog"] pre` (history entries) instead.
- **Games**: `play tetris` arms controls immediately; overlay grows 440px → min(78vh, 700px). Arrow/Space must move pieces without scrolling the page (`window.scrollY` unchanged). `[library]` returns to the grid; `clear` resets everything.
- **Scroll commands** (`cat about.txt` etc.) scroll the page behind the overlay — assert `#<id>` lands near viewport top (~90px, the scroll-margin).
- **Mobile** (<768px viewport): no sidebar, no canvas, no terminal; sections + footer only.
- **No-JS**: content must be visible (js-reveal noscript fallback in `app/layout.tsx`).
