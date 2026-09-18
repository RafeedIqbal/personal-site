# Modern terminal portfolio redesign

Implemented on 18 September 2026. This is a local implementation and verification record; no deployment is included.

## Design and content

- Graphite workspace with a 224px desktop file tree, human-readable navigation, and a sticky mobile section menu below 1024px.
- Space Grotesk for headings and body copy; JetBrains Mono for commands and metadata. Main reading copy is at least 16px, with restrained line lengths.
- Immediate server-rendered content replaces the boot sequence and reveal effects. A cursor-reactive ASCII background retains the original interaction, stays clear of text, and respects reduced motion.
- The overview stats strip has been removed, and the sidebar uses continuous tree branches.
- Five project summaries, all four existing roles, six website previews, grouped capabilities, education, and direct contact actions.
- Existing section anchors, project slugs, résumé URL, terminal commands, command history, autocomplete, and arcade remain available.
- BaseNote links in the page and terminal use `https://www.basenotesolutions.com/private-label`.
- Terminal and arcade JavaScript load when requested. Native case disclosures and image links remain functional without JavaScript.

The original portfolio content is the factual baseline. Case summaries reorganize its stated work and outcomes; they do not add new performance metrics or launch claims. Public marketing screenshots are labeled as websites rather than private product interfaces.

## Screenshot provenance

Nine full-color WebP files are stored in `public/images/` and reused across eleven preview instances. Each is 1440 × 900 pixels. Together they occupy approximately 448 KiB before Next.js responsive optimization. Muting is applied in CSS, preserving full-color assets for hover, keyboard focus, and enlargement.

| Asset | Source and representative view |
| --- | --- |
| `sites/basenote-solutions.webp` | [BaseNote private label](https://www.basenotesolutions.com/private-label): fragrance private-label hero, as specifically requested. |
| `sites/icon-training.webp` | [Icon Training](https://icontraining.app): public coaching-product website. |
| `sites/alpac-london.webp` | [ALPAC London](https://alpaclondon.com/): fragrance storefront hero. |
| `sites/arizmi-labs.webp` | [Arizmi Labs](https://www.arizmilabs.com/): consultancy homepage. |
| `sites/riveli-mn.webp` | [Rive & Limn](https://rivelimn.com): brand and growth strategy homepage. |
| `sites/rafeed-dev.webp` | This redesigned portfolio, captured locally after the other website and product captures. |
| `work/id8.webp` | Actual id8 frontend: project workspace, approval checkpoint, pipeline, and artifacts for a sample “Research Library” project. |
| `work/e-predict.webp` | Actual E-Predict frontend: completed anomaly-analysis screen, using safe sample response data and plots bundled in the project. |
| `work/syncmaster.webp` | Actual SyncMaster frontend: document-management workspace populated with sample folders and documents. |

The id8, E-Predict, and SyncMaster interfaces were run in disposable shallow clones, with browser-intercepted sample API responses and no live provider credentials. The source interfaces were retained. The captures verify the presentation of those interfaces, not live model execution or deployed backend behavior.

Source revisions:

- [id8](https://github.com/RafeedIqbal/id8): `c78f45a11518a14936ca7cace5d6e0ca974c6b66`
- [E-Predict](https://github.com/RafeedIqbal/E-Predict): `10c856cab630c58477f811654e1240ceae239f67`
- [SyncMaster](https://github.com/RafeedIqbal/SyncMaster): `34f53faf7d6832dc1149dd9577bdeb6505704485`

Scratch-only setup repaired a missing comma in E-Predict’s dependency manifest and seeded its existing dataset context. SyncMaster ran with Node.js 22 for compatibility with its original JWT package. These setup changes are not part of this repository or the upstream project repositories.

## Verification

Passed against the local production build:

- `npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`.
- Layout and image review at 320, 390, 768, 1024, 1440, and 1920px. No horizontal overflow; desktop sidebar measures 224px; the mobile header remains sticky throughout the page.
- Cursor movement reveals the ASCII background; it fades to a clear canvas and stops requesting frames when idle. Text, navigation, and expanded case summaries are excluded. Reduced motion clears the canvas, and the effect unmounts below 1024px.
- Sidebar branch positions are continuous at 1024, 1440, and 1920px. The overview stats strip is absent, and the portfolio’s own website preview has been refreshed to reflect these changes.
- All eleven screenshot instances load with explicit dimensions. No image-related layout shifts or browser errors were recorded during the reading-view checks.
- All five native case disclosures; mobile menu selection and Escape; every internal anchor.
- Screenshot saturation on hover and keyboard focus; full-color enlargement on pointer and touch; modal focus handling, Escape, close button, backdrop dismissal, focus restoration, and page scroll restoration.
- Clipboard success and denied-permission feedback; valid résumé PDF and actual download events.
- Reduced-motion preferences, plus desktop/mobile navigation, disclosures, image links, and résumé downloads with JavaScript disabled.
- Terminal content commands, shared BaseNote URL, history and draft restoration, Tab/right-arrow completion, keyboard launcher, focus containment, focus restoration, and responsive closing.
- Arcade library, Tetris movement/rotation/hard drop, Hanoi moves and reset, Tic-Tac-Toe with the computer response, and Space Invaders movement/fire. Game keys do not scroll the page; Escape dismisses help, arcade, and terminal in order.
- Browser resource checks confirm separate terminal and arcade loading on first use.
- Axe WCAG 2 A/AA, WCAG 2.1 AA, and best-practice checks reported zero violations for the desktop page, expanded mobile navigation, expanded case summary, enlarged screenshot, terminal help, arcade library, and Tetris controls.
- All eleven unique external destinations returned HTTP 200 after redirects, including the requested BaseNote private-label page, six website destinations, project repositories, and profile links.

The temporary project capture servers and disposable source checkouts were cleaned up. A local portfolio preview may remain on port 3001 for review; no hosted deployment was performed.
