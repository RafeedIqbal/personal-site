# Site Audit

**Date:** 2026-06-06
**Scope:** Full audit of the personal-site portfolio (Next.js 16 / React 19 / Tailwind v4 / Framer Motion).
**Method:** Read every source file under `app/`, `components/`, `sections/`, `lib/`; ran `npm run lint`, `npx tsc --noEmit`, and `npm run build`; inspected the prerendered output in `.next/server/app/index.html`.

## Verified clean

- `npm run lint` — passes, no warnings.
- `npx tsc --noEmit` — passes, no type errors.
- `npm run build` — succeeds, page prerendered as static.
- `.env.local` is correctly gitignored and untracked (not in `git ls-files`).
- All JSX external `<a>` links use `rel="noopener noreferrer"`.
- All terminal `scrollTarget` strings match their section `id` attributes.

Severity legend: 🔴 Critical · 🟠 Medium · 🟡 Low/polish · 📄 Data/docs

---

## 🔴 Critical

### 1. Entire site renders blank in the initial HTML (major SEO problem)

**Where:** `app/page.tsx:78-80`

```tsx
if (isMobile === null) {
  return null;
}
```

`isMobile` starts as `null` and is only set later inside a client `useEffect` (`app/page.tsx:23-41`). During static prerendering it is always `null`, so the component returns `null` and **no content is emitted into the server HTML**.

**Verified:** `.next/server/app/index.html` has an effectively empty `<body>` — only a hidden div and script tags. All content (name, experience, projects, etc.) exists solely inside the serialized RSC/JS payload and is rendered only after hydration + the `useEffect` runs.

**Consequences:**
- Crawlers/scrapers that don't execute JS, and any no-JS visitor, see a blank page. For a portfolio whose purpose is discoverability, this defeats SSR/SSG entirely.
- Blank-screen flash and delayed first paint even for normal users.

**Fix direction:** Don't gate the whole tree on a client-only `isMobile`. Render the content sections server-side and use CSS (`hidden md:flex`, already used elsewhere) for desktop-only chrome. Defer only the truly client-only pieces (interactive terminal, canvas background, boot sequence) behind the mobile/hydration check.

---

## 🟠 Medium

### 2. Reverse-tabnabbing in terminal links

**Where:** `lib/terminal-commands.ts:207,214`

```ts
window.open(PROFILE.linkedinUrl, "_blank");
window.open(PROFILE.githubUrl, "_blank");
```

`window.open(url, "_blank")` with no `noopener` leaves the opened tab with a live `window.opener` reference. The JSX `<a>` tags handle this correctly; only the terminal path is missing it.

**Fix:** `window.open(url, "_blank", "noopener,noreferrer")`.

### 3. Resume is not downloadable

**Where:** `Resume/Rafeed_iqbal_resume.pdf` (exists), referenced nowhere in source.

The résumé PDF lives outside `public/` and is linked nowhere. A portfolio conventionally offers a "download résumé" link, and the file is present but unused.

**Fix:** Move the PDF into `public/` and link it (e.g., a button in Hero/Contact).

### 4. No social-share preview / `metadataBase`

**Where:** `app/layout.tsx:12-21`

`openGraph` sets title/description but no `images`, and there is no `metadataBase`. Shared links render with no preview card.

**Fix:** Add an OG image and `metadataBase: new URL("https://rafeed.dev")` to the `metadata` export.

### 5. Weak heading hierarchy

**Where:** all `sections/*.tsx` via `components/CommandBlock.tsx`; `sections/Projects.tsx:59`

Only one `<h1>` exists (Hero name). Section titles render as non-heading `<div>`s through `CommandBlock`, and Projects' mobile card jumps straight to `<h3>`. The document outline is essentially flat, hurting accessibility and SEO.

**Fix:** Give each section a real `<h2>` (can be visually styled as the command-line prompt to keep the look).

### 6. No `prefers-reduced-motion` support

**Where:** `components/BootSequence.tsx`, `components/BackgroundEffect.tsx`, `components/CommandBlock.tsx`

The boot sequence, the continuous canvas animation, and all Framer fade-ins run regardless of the OS "reduce motion" setting — an accessibility issue for vestibular-sensitive users.

**Fix:** Gate the canvas/boot and soften animations when `(prefers-reduced-motion: reduce)` matches.

### 7. Terminal + games unavailable on mobile/touch

**Where:** `app/page.tsx` (terminal is `hidden lg:flex`); games are keyboard/mouse only.

Mobile visitors get none of the interactive features that differentiate the site. Worth a deliberate decision; ideally expose games on touch.

---

## 🟡 Low / polish

### 8. Space Invaders auto-fires every tick

**Where:** `components/terminal-games/SpaceInvadersGame.tsx:127-134`

```ts
if (!bullet) {
  bullet = { x: state.playerX, y: PLAYER_ROW - 1 };
}
```

A bullet is spawned at the player position whenever none exists, so the player shoots continuously. This makes the `fireBullet`/spacebar handler (`:218`) effectively dead and the "fire upward" description in `lib/terminal-games.ts:38` misleading (there is also no fire control in the panel UI).

### 9. Duplicated, already-drifting command list

**Where:** `components/InteractiveTerminal.tsx:206-219` vs `lib/terminal-commands.ts:46` (`HELP_TEXT`)

The help card is a hand-maintained copy of `HELP_TEXT`. They have already diverged (the card omits `close game`). Render the card from a single shared source.

### 10. Dead code path

**Where:** `lib/terminal-commands.ts:69` vs `components/InteractiveTerminal.tsx:77`

`runCommand` returns `HELP_TEXT` for `"help"`, but `handleSubmit` intercepts `help` before calling `runCommand`, so that branch never reaches the terminal.

### 11. Background animation never idles

**Where:** `components/BackgroundEffect.tsx`

`requestAnimationFrame` runs at ~60fps forever, even with no pointer activity and nothing visible — unnecessary battery/CPU cost.

**Fix:** Halt the loop when all particles are at zero opacity and the pointer is inactive; restart on `mousemove`.

### 12. Smaller accessibility gaps

- Terminal `<input>` has no label/`aria-label` (`components/InteractiveTerminal.tsx:274`).
- Decorative `<canvas>` lacks `aria-hidden="true"` (`components/BackgroundEffect.tsx:251`).
- Game boards and the Projects/Websites `<table>`s (`sections/Projects.tsx`, `sections/Websites.tsx`) have no semantic headers/caption.

### 13. Default terminal width is very large

**Where:** `app/page.tsx:19` — `useState(1000)`

A 1000px default squeezes the main content column hard on 1280–1440px laptops. Consider a viewport-relative default.

### 14. Boot sequence replays on every visit

**Where:** `components/BootSequence.tsx`

No `sessionStorage` guard, so the animation runs on every load. Minor repeated friction.

### 15. Nav has no active-section highlighting

**Where:** `components/Nav.tsx`

No scroll-spy; the current location is not indicated.

---

## 📄 Data / docs

### 16. Documentation drift

`AGENTS.md` and `README.md` both reference `prd.md`, `tech_plan.md`, and `screens/` — none of which exist in the repo.

### 17. Contact data

- `lib/content.ts:3` uses `rafeediqbal@gmail.com` (differs from `rafeed@beiconic.app`).
- The phone number is published in plain text (`lib/content.ts:4`), inviting scraping/spam.

Both are intentional choices to confirm, not bugs.

### 18. No `robots.txt` / `sitemap`

Minor for a single-page personal site, but trivial to add via `app/robots.ts` / `app/sitemap.ts`.

---

## Suggested priority order

1. **#1** — restore server-rendered content (undermines the SSG you already pay for).
2. **#2, #4** — quick security/SEO wins.
3. **#3, #5, #6** — résumé link, headings, reduced-motion.
4. Remaining low/polish and docs items as time allows.
