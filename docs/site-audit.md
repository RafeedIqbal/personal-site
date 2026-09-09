# Personal site audit — 10 September 2026

Completed locally against the production build. The terminal visual style and existing portfolio content are preserved. The user confirmed the website has current experience and supplied the updated 2026 résumé.

## Fixed and improved

| Area | Result |
| --- | --- |
| Dependencies | Updated Next.js and eslint-config-next from 16.2.10 to 16.3.4, React and React DOM from 19.2.3 to 19.2.8, and affected compatible transitive dependencies. Full npm audit fell from 29 affected packages (1 critical, 26 high, 2 moderate) to zero. Production-only audit also reports zero. |
| Security configuration | Added MIME-sniffing protection, framing restrictions, referrer and browser-permission policies, and a baseline CSP. Removed the framework response header. |
| SEO | Unified profile metadata and Person structured data. Canonical URLs, robots, and sitemap now use www.rafeed.dev, matching the existing hosting redirect. Removed a misleading build-time sitemap modification date. |
| Résumé | Replaced the public download with the supplied 2026 PDF and retained an identical source under Resume/. Confirmed the listed roles and dates match the website. Older source files remain for reference. |
| Mobile and tablet | Added compact mobile section navigation and download access. Adjusted content grids for the space left beside the desktop sidebar. Improved wrapping and anchor offsets. |
| Accessibility | Added a skip link, visible focus styles, descriptive section headings and links, download labels, dialog focus management, and terminal output announcements. Content is visible before hydration and without JavaScript. |
| Boot animation | Added Skip/Escape, focus trapping and restoration, complete timer cleanup, and live reduced-motion handling. Denied session storage no longer breaks initialization. |
| Terminal | Restored native caret and text selection, preserved drafts while browsing command history, handled composition/modifier keys, fixed help placeholders and long text wrapping, honored reduced motion, and fitted the dialog to short screens. |
| Arcade | Added keyboard-focus and pause/resume controls, paused timed games at the prompt/window blur, stopped game shortcuts from consuming focused-button input, improved compact layouts, and fixed Space Invaders projectile collisions at spawn and after invader movement. |
| Performance | Preserved deferred terminal/game loading. The initial browser load used six script resources; opening the terminal loaded an additional script. Initial script assets were served locally. Background animation now stops in hidden tabs and when reduced motion is enabled. |
| CI | Added GitHub Actions with SHA-pinned actions, Node 24, npm ci, lint, TypeScript, dependency audit, and production build. Added a standalone typecheck script and documented verification. |

The security changes address the dependency advisories identified by npm; they do not imply that every advisory was exploitable through this static portfolio. Patched framework versions were checked against the official [AVIF advisory](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4) and [Windows advisory](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36).

## Verification

- `npm run lint` — passed.
- `npm run typecheck` — passed.
- `npm run build` — passed; all application/metadata routes generated statically.
- Full and production-only `npm audit` — zero known vulnerabilities at audit time.
- Thirteen targeted standalone game-logic assertions — passed, covering Space Invaders collisions and Tetris dropping, line clearing, and scoring.
- Chromium against `npm run start` on port 3001 — checked widths 320, 375, 768, 1024, 1440, and 1920; no page-content overflow.
- Axe WCAG A/AA checks on desktop, mobile, and terminal with Tetris open — zero automated violations. This does not replace manual assistive-technology testing.
- Verified desktop/mobile navigation, skip link, anchor positions, boot focus/Skip/Escape/session persistence, live reduced motion, and denied-storage behavior.
- Verified terminal opening, autofocus, inert background, history draft restoration, autocomplete, section-scroll commands, help/Escape, close/reopen persistence, Tab cycling, focus restoration, long command wrapping, and desktop-to-mobile closing.
- Verified game controls do not scroll the page, Space activates focused buttons, prompt focus pauses gameplay, and the terminal/arcade fit a 768 × 480 viewport.
- Verified all seven sections remain visible with JavaScript disabled and no unavailable terminal button is exposed.
- Verified all six listed website URLs and three project repository URLs return HTTP 200.
- Verified local HTML, robots, sitemap, manifest, social images, icons, and résumé return HTTP 200 with the configured response headers; unknown pages return HTTP 404.
- Verified canonical metadata and parsed Person JSON-LD; all content sections are present in server HTML, while the interactive terminal is absent.
- Downloaded the résumé through the browser and compared its bytes with both the supplied file and the preserved source.
- No browser page errors were observed in the layout, boot, storage, and motion checks.

## Repository cleanup

Desktop, mobile, tablet, and terminal screenshots were inspected during verification. Temporary browser screenshots, downloads, snapshots, and the audit's Playwright session were removed after review. Generated exports under `output/` are excluded from Git. Unused starter SVG assets and duplicate ignore rules were removed; original résumé source files were retained.

## Delivery boundary

This report records local verification before submission to `main`. Existing public URLs were checked read-only; these checks do not verify a deployment of the changes or a hosted GitHub Actions run. The build currently downloads Google Fonts, so CI needs network access at build time. The baseline CSP preserves the inline scripts/styles required by static Next.js rendering and does not claim full script-source hardening.
