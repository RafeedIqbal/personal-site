---
name: verify
description: Build, serve, and drive this portfolio in a headless browser to verify UI changes end-to-end.
---

# Verifying changes to this site

Use the colocated Playwright and axe suite for behavior, then inspect the rendered UI for visual issues. Respect the current task's route exclusions.

## Automated checks

Install Chromium once per Playwright version with `npx playwright install chromium`. Run `npm run test:ui` to build the production app and execute `sections/Portfolio.test.ts`. The suite manages its own server on port 3035; keep that port free. After an existing build, run `npx playwright test` without rebuilding.

## Build & serve

```bash
npm run build
PORT=3001 npm run start   # port 3000 is often held by a personal dev server — don't kill it
```

SSR sanity check (sections and navigation must ship in server HTML; the terminal must not):
`curl -s localhost:3001 | rg -o 'id="[a-z]*"'` → expect whoami/projects/experience/websites/env/about/contact, and no `visitor@rafeed.dev`.

## Visual and manual checks

Key flows and their gotchas:

- **Initial render**: content is immediately readable. There is no boot overlay or section reveal.
- **Cursor background**: the desktop ASCII canvas responds to cursor movement in empty space, avoids text and navigation, fades out, and idles after movement stops. It clears under reduced motion and unmounts below 1024px. Check alignment after scrolling and expanding a case summary.
- **Sidebar tree**: branches connect vertically from Overview through Contact, including across the active row. The overview has no stats strip.
- **Responsive layout**: check 320, 390, 768, 1024, 1440, and 1920px. At 1024px and above, the sidebar is 224px wide. Below that, the header contains résumé access and a native expandable section menu. It is sticky whenever scripting is enabled (CSS `@media (scripting: enabled)`, so there is no switch at hydration) and remains in normal document flow without JavaScript. Verify menu navigation and Escape handling, section offsets, and horizontal overflow.
- **Terminal overlay** (desktop only, 1024px and above): opens via the sidebar `Open terminal` button or Ctrl + backtick; a bare backtick must do nothing. It is a native modal: use `dialog.terminal-dialog` or `getByRole("dialog", { name: "Terminal" })`. Input autofocuses — type directly. Esc cascade: help card → games panel → overlay, including two quick Esc presses with help and the arcade both open. Backdrop click closes the whole terminal, even with help or the arcade open. Ctrl + backtick also closes it from inside. The browser restores launcher focus and makes the page behind inert; no script traps Tab. Terminal and arcade chunks load only on demand. Check that help, its close button, and the prompt remain reachable after long command output.
- **Unsubmitted input persists** across close/reopen (like a real shell) — `fill("")` the input before typing a fresh command in a driver script.
- Terminal output assertions can false-match page content behind the translucent overlay. Scope to the terminal history log instead. Prefer roles and exact names for controls.
- **Games**: `play tetris` arms controls immediately; overlay grows 440px → min(78dvh, 700px). Arrow/Space must move pieces without scrolling the page (`window.scrollY` unchanged). `Library` returns to the grid; `clear` resets everything. Shared buttons are at least 44px tall. Full nonvisual Tetris gameplay is a known deferred limitation, not covered by the shared-control checks.
- **Scroll commands** (`cat about.txt` etc.) scroll the page behind the overlay — assert the target lands near the viewport top (32px desktop scroll margin; the last section may be limited by the bottom of the document).
- **Case summaries**: all seven use native `details`/`summary`, with outcomes visible before expansion. Supporting-project images and problem/approach details are inside the disclosures and available in server HTML.
- **Screenshots**: all 10 preview instances load local WebP images at a fixed 16:10 ratio; expand the four supporting cases to inspect their images. They use 20% saturation normally and full color on hover or keyboard focus. Click or tap opens a native modal. Check visible-caption naming, the full-size image link, Escape, close button, backdrop dismissal (`closedby="any"`, with a pointer-position fallback where unsupported), focus restoration, and scroll restoration. The native modal makes the page inert; no script wraps Tab inside it. Reduced motion disables the color transition.
- **Contact**: check mailto, external profile links, the existing résumé PDF download, clipboard success, and readable failure feedback.
- **No-JS**: use a context with `javaScriptEnabled: false`. Content, anchors, mobile menu, native case disclosures, résumé links, and screenshot links must work. Screenshot links open the full-color image directly; terminal and copy controls are enhancement-only.
