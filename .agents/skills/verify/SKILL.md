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

SSR sanity check (sections and navigation must ship in server HTML; the terminal must not):
`curl -s localhost:3001 | rg -o 'id="[a-z]*"'` → expect whoami/projects/experience/websites/env/about/contact, and no `visitor@rafeed.dev`.

## Drive (Playwright, install in a scratch dir — not this repo)

Key flows and their gotchas:

- **Initial render**: content is immediately readable. There is no boot overlay or section reveal.
- **Cursor background**: the desktop ASCII canvas responds to cursor movement in empty space, avoids text and navigation, fades out, and idles after movement stops. It clears under reduced motion and unmounts below 1024px. Check alignment after scrolling and expanding a case summary.
- **Sidebar tree**: branches connect vertically from Overview through Contact, including across the active row. The overview has no stats strip.
- **Responsive layout**: check 320, 390, 768, 1024, 1440, and 1920px. At 1024px and above, the sidebar is 224px wide. Below that, a sticky header contains résumé access and a native expandable section menu. Verify menu navigation and Escape handling, section offsets, and horizontal overflow.
- **Terminal overlay** (desktop only, 1024px and above): opens via the sidebar `Open terminal` button or the backtick key; `[role="dialog"][aria-label="Terminal"]`. Input autofocuses — type directly. Esc cascade: help card → games panel → overlay. Backdrop click closes. Closing restores launcher focus; the page behind the terminal is inert. Terminal and arcade chunks load only on demand.
- **Unsubmitted input persists** across close/reopen (like a real shell) — `fill("")` the input before typing a fresh command in a driver script.
- `getByText` is case-insensitive/substring: terminal output assertions can false-match page content behind the translucent overlay. Scope to `[role="dialog"] pre` (history entries) instead.
- **Games**: `play tetris` arms controls immediately; overlay grows 440px → min(78vh, 700px). Arrow/Space must move pieces without scrolling the page (`window.scrollY` unchanged). `[library]` returns to the grid; `clear` resets everything.
- **Scroll commands** (`cat about.txt` etc.) scroll the page behind the overlay — assert the target lands near the viewport top (32px desktop scroll margin; the last section may be limited by the bottom of the document).
- **Case summaries**: all five use native `details`/`summary`, with problem, approach, and result text available in server HTML.
- **Screenshots**: all 11 preview instances load local WebP images at a fixed 16:10 ratio. They use 20% saturation normally and full color on hover or keyboard focus. Click or tap opens a native modal. Check Escape, close button, backdrop dismissal, focus trapping/restoration, and scroll restoration. Reduced motion disables the color transition.
- **Contact**: check mailto, external profile links, the existing résumé PDF download, clipboard success, and readable failure feedback.
- **No-JS**: use a context with `javaScriptEnabled: false`. Content, anchors, mobile menu, native case disclosures, résumé links, and screenshot links must work. Screenshot links open the full-color image directly; terminal and copy controls are enhancement-only.
