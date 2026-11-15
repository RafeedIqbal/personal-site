# Publicus verification — 14–15 November 2026

Implementation branch: `codex/publicus-application`, integrated with the latest portfolio updates on `main`. Release route: `https://www.rafeed.dev/publicus`.

## Automated checks

- `npm run lint` — passed.
- `npm run typecheck` and production `npm run build` — passed; `/publicus` and its social images prerender successfully.
- `npm run test:publicus` — 13 deterministic domain tests: qualification invalidation, cumulative amendments, conflicting values, buyer/contract isolation, absent original awards, missing sources, invalid citations, zero vs missing amounts, deadline offsets, CSV mapping, quoted CSV boundaries and current/stale exports.
- `npm run test:belong` and `npm run test:dependencies` — passed. Existing Belong code was not changed.
- `deno check` for both Edge Functions — passed.
- `deno test --allow-env --config supabase/functions/deno.json supabase/functions/tests/gemini.test.ts` — two tests passed. These intercept all network requests and validate the current Interactions request format, disabled provider interaction storage, quota reservation and quotation validation. These unit tests do not call Gemini; separate hosted checks below do.
- After merging the portfolio updates, lint, type checks, build, 13 Publicus tests, 14 Belong tests, 9 dependency checks and all 14 Playwright portfolio checks passed. Publicus domain tests are also included in CI.
- Real PDF parser smoke test on the public résumé — one page extracted successfully.

## Local Supabase integration

Started a dedicated local `publicus-demo` stack and applied both migrations. Integration checks used temporary anonymous users and removed their fixtures:

- Separate anonymous workspaces; cross-user rows and private Storage objects inaccessible.
- Client roles cannot extend expiry, mutate tables or invoke privileged quota functions.
- Changed mandatory requirements invalidate a previously qualified opportunity while preserving notes.
- Original files upload through signed paths; queued CSV extraction commits normalized records and source text; repeated identical jobs are idempotent.
- Source download links require ownership and expire after 60 seconds.
- Concurrent quota requests cannot overrun the configured limit.
- Stale worker tokens cannot commit; interrupted leases can be reclaimed.
- **Actual CanadaBuys open-tender feed** imported successfully; coverage is explicitly limited to 120 source rows.
- Reset removes original files; expired workspaces become unreadable; the worker removes expired workspaces.
- An expired workspace was also reset through the browser after deliberately expiring its local test row.
- Configured the local Vault entries and observed scheduled cron ticks returning HTTP 202 from the worker.

## Browser verification

Playwright against the production server:

- 320, 390, 768, 1024, 1440 and 1920px: no document overflow or clipped workspace tabs after the final responsive correction.
- Sample opportunity qualification, profile edits, saved-stage downgrade on a new clearance requirement, and stale-answer feedback.
- Government view shows conflicting amendment values with a withheld total.
- Citation/source dialogs, Escape dismissal, mobile list/detail navigation and keyboard tab navigation.
- Private workspace connection and restoration, CSV file selection, column detection, queued upload, completed import visible in the uploaded-record dataset, and reset cleanup.
- No-JavaScript narrative, native research disclosure and résumé links remain available.
- Reduced motion disables the orbit animation.
- Axe WCAG A/AA/2.1 AA checks on the rendered page returned no violations after contrast fixes. This is an automated check, not an accessibility certification.
- No browser console errors or warnings in the final pass.
- `/publicus` returns `X-Robots-Tag: noindex, nofollow, noarchive`; it is absent from the sitemap.

Screenshots are in the ignored `output/playwright/` directory: `publicus-desktop-final.png`, `publicus-workspace-final.png` and `publicus-mobile-final.png`.

## Hosted Supabase verification

Provisioned the dedicated `personal-site-publicus` project (`clfgowkxumajjjfxkfwa`, Canada Central), applied three migrations and deployed both Edge Functions. Configured anonymous auth, production origins, Edge secrets and the Vault-backed minute cron tick.

- Anonymous sessions bootstrap distinct workspaces. Cross-user reads, client-side writes and service-only quota RPCs are denied.
- An untrusted origin is rejected; the worker rejects unauthenticated requests.
- A synthetic CSV uploads through a signed URL, remains private from the second session, completes through the durable queue and exposes an owner-only source download.
- A **real Gemini 4 Hydrogen request** returned two claims with validated source citations about a fictional tender's qualification and closing date.
- A second real Gemini request extracted a synthetic procurement document and marked the record for human review.
- Hosted verification exposed a cold-start timeout and a completion/read race. Wake-up and cron timeouts now allow 10 seconds, and workspace reads follow job-status reads so completed results cannot disappear when polling stops. The checks were rerun successfully after deployment of both fixes.
- Observed scheduled worker HTTP 202 responses without timeouts.
- The hosted CanadaBuys connector imported 120 records. Synthetic hosted test workspaces and their original uploaded files were removed afterward.
- The production page connected to its private workspace and displayed a real Gemini answer with a validated quotation. The résumé, social image and no-index response headers returned successfully; `/publicus` remains absent from the sitemap.
- A browser regression check forced a job to complete before the very first status read. Its answer rendered after exactly one read, without relying on a later polling cycle. Both enqueue and retry now apply the complete workspace snapshot, while preserving current profile edits and notes.

Vercel Production has the hosted Supabase URL and publishable key. Model and worker secrets are configured in Supabase and excluded from Git. Scanned/image-only PDFs still require OCR before upload; this prototype does not include an OCR service. No job application was submitted.

## Redesign — 15 November 2026

The page was rebuilt as an open-data record (see the "Design" section of `docs/publicus-research.md`). Explorer behaviour, data and backend are unchanged. Only the copy, icon markup and styles changed.

- `npm run lint` (one warning, in the ignored local file `.supabase/fast-job-browser.js`), `npm run typecheck` and the production build passed.
- `npm run test:publicus` 13/13, `npm run test:belong` 14/14, `npm run test:dependencies` 9/9 and `npm run test:ui` 14/14 passed.
- Axe (WCAG 2.0/2.1 A and AA) on `/publicus` at 1440, 768 and 390px: no violations, no console errors and no horizontal overflow.
- Driven in the browser: the raw-row panels switch through `#cb-NN` anchors and show only structured CanadaBuys fields, with no descriptions, contact emails, attachments or URLs. Also checked: vendor and government tabs, the conflict scenario, the source dialog closing on Escape, and the profile modal.
- `impeccable detect` on `app/publicus` and `components/publicus` returned no findings.
- Review captures are in the ignored `.impeccable/review/` directory.

## Explorer blurb and help chat — 15 November 2026

A three-row note above the explorer now covers how it works, its architecture and its stack. The lede no longer says that scenarios change rankings; they change qualification, flags and explanations, and only profile edits re-rank. A floating help chat (`components/publicus/HelpChat.tsx` and `ChatPanel.tsx`, Edge Function `publicus-chat`) answers questions from the fact sheet in `supabase/functions/_shared/assistant.ts`, along with a summary of the visitor's explorer view.

- `npm run lint`, `npm run typecheck`, `npm audit --audit-level=moderate` and the production build passed. Deno checks of all three functions passed.
- Test results:

  | Suite | Result |
  |---|---|
  | `npm run test:publicus` (13 domain and 6 fact-sheet tests) | 19/19 |
  | `npm run test:belong` | 14/14 |
  | `npm run test:dependencies` | 9/9 |
  | `npm run test:ui`, including 5 new `/publicus` tests | 19/19 |
  | Deno tests, including a mocked chat request | 3/3 |

- The new UI tests cover:
  - The blurb.
  - Offline suggested answers and their source links.
  - Escape and close buttons returning focus to the launcher.
  - Start over.
  - Axe (WCAG 2.0–2.2 A/AA and best practice) with the panel open.
  - No horizontal overflow at 320, 390 and 1440px.
- Axe found that the raw-row heading skipped from h1 to h3. It is now an h2.
- Driven in the browser against a dev server whose Supabase calls were intercepted:
  - The explorer view is sent with each question, and fact ids that don't exist are dropped.
  - The "Checking the record…" state, the email fallback for questions the facts don't cover, and the daily-limit state all work.
  - On phones the panel is a full-screen sheet, and a source chip closes the sheet and moves to its section.
- `impeccable detect` reported only advisory type-ramp and colour notes. The same kind of notes exist on `main`.
- Live Gemini answers are verified only after `publicus-chat` is deployed to the hosted project.

## Model eval — 15 November 2026

After the chat went live, `gemini-4-hydrogen` took 40–70 seconds per chat answer on the free key, and explorer questions hit the worker's 60-second timeout. With the paid key, `npm run eval:publicus` ran 14 chat cases and 6 explorer cases (3 questions, 3 document extractions), twice each, against every current Gemini text model. That was 560 scored calls across 14 model and thinking settings. Gemini Omni 1.2 Flash rejected text requests at both thinking levels and isn't scored. Every check is deterministic; the raw calls are in the ignored `output/evals/`.

**Results.** Accuracy, then median and p90 time, then cost per 1,000 answers at list price. "Not published" means Google lists no price for that model.

| Setting | Chat | Explorer |
|---|---|---|
| Gemini 3.6 Flash, minimal (chosen for both) | 100%, 1.4 s / 1.8 s, $3.16 | 100%, 2.1 s / 2.6 s, $1.40 |
| Gemini 3.5 Flash, minimal | 100%, 1.3 s / 2.0 s, not published | 92%, 2.0 s / 2.8 s, not published |
| Gemini 3.5 Flash, low | 100%, 2.3 s / 3.3 s, not published | 100%, 2.0 s / 2.6 s, not published |
| Gemini 3.8 Flash, low | 96%, 2.8 s / 4.1 s, $3.22 | 100%, 3.4 s / 4.1 s, $1.26 |
| Gemini 4 Hydrogen, low (previous model) | 100%, 3.8 s / 9.0 s, $9.23 | 100%, 4.8 s / 7.3 s, $7.22 |
| Gemini 4 Argon, low | 100%, 7.1 s / 52 s, $9.40 | 100%, 7.5 s / 12 s, $5.29 |
| Gemini 3.1 Pro Preview, low | 89%, 8.6 s / 16 s, $18.01 | 100%, 6.6 s / 8.1 s, $9.56 |
| Flash Lite models (3.5 and 3.1) | 86–89% | 83% |

**Common failures.**
- Flash Lite models left out figures, the $1,073,002.14 contract amount and the conflicting totals.
- Most models misread an amendment as an award when extracting a document.
- 3.7 and 3.8 Flash each had one 503 error.

**Picks.** Gemini 3.5 Flash at minimal thinking was 0.07 s faster on chat, but that is inside the 10% tie window. Google publishes no price for it, so the tie went to 3.6 Flash. The picks were written to `_shared/models.ts`, and `pickModel()` re-derives them in `npm run test:publicus`. The new figure under the explorer passed the UI suite (20/20) with axe and with no horizontal overflow at 320, 390 and 1440 px.

**Override.** After reviewing the results, Rafeed chose Gemini 3.8 Flash at low thinking for both paths. It is the newest Flash model, and the differences from 3.6 Flash are small:
- Chat: 96% against 100%, at a 2.8 s median against 1.4 s. 3.8 Flash's one miss was a 503 from Google, not a wrong answer.
- Explorer: 100% for both, at 3.4 s against 2.1 s.
- Cost per 1,000 answers: $3.22 against $3.16 for the chat, and $1.26 against $1.40 for the explorer.

`CHOICE` in `_shared/models.ts` records the override. The eval's own picks stay in `EVAL_CHAT` and `EVAL_DEMO`. The page marks 3.8 Flash "In use" and 3.6 Flash "Eval pick". The hosted `GEMINI_MODEL` secret was removed, so the code's choice applies.

## Work section, demo video and records dialog — 15 November 2026

The masthead no longer has a metadata row, and the introduction is now a short statement of what Rafeed builds and what he would bring to Publicus. The ten CanadaBuys records moved from the top of the page into a dialog inside the explorer, because they are the explorer's Public records dataset. "CanadaBuys rows" in the explorer's bottom bar opens it, as does "See the rows as published" under Sources & imports and any link to `#records` or `#cb-NN`, including the help chat's record sources and the link in Why Publicus.

The BaseNote entry now has these additions:
- A new headline, "Bespoke fragrances, made fast, with no minimum order".
- A paragraph on Alchemy.
- The founder demo of Blend and Alchemy, re-encoded from 85 MB to 9.3 MB (H.264 1080p, CRF 28, AAC 96k, faststart), with a transcript.
- Six product screens taken from each product's own guide captures. The Blend screens use seed data and the Alchemy screens use synthetic data.

The Icon entry links to the App Store and Google Play, and Work ends with a button to rafeed.dev. The help chat's fact sheet gained an `alchemy` fact, and the records facts describe the dialog.

- `npm run lint`, `npm run typecheck` and the production build passed. Deno checks of all three functions passed.
- Test results:

  | Suite | Result |
  |---|---|
  | `npm run test:publicus`, including 3 new record tests and 1 new fact-sheet test | 25/25 |
  | `npm run test:belong` | 14/14 |
  | `npm run test:dependencies` | 9/9 |
  | `npm run test:ui`, including 5 new `/publicus` tests | 25/25 |
  | Deno tests | 3/3 |

- The new UI tests cover:
  - The masthead and introduction.
  - The video's source and poster, and the transcript chapters.
  - The gallery dialog: Next, the arrow keys, Escape and focus return.
  - Both store links and the rafeed.dev button.
  - The records dialog from the button, from the Why Publicus link, from `/publicus#cb-03` and from the chat's "Record 01" source.
  - Axe with each dialog open.
- Checked in the browser at 1440, 768 and 375px:
  - No horizontal overflow and no console errors.
  - The video plays at 1920×1080.
  - Both store links return 200.
  - On a phone, choosing a record scrolls the dialog to its raw row.
- `impeccable detect` reported only advisory type-ramp notes.
- `publicus-chat` must be redeployed for the chat to use the new facts.

## Explorer setup and tour — 15 November 2026

The explorer now opens on a setup screen. It lists what the explorer does and asks whether the visitor sells to government or buys for a public body. Vendors name their company, describe it (keyword rules tick the matching capabilities), and pick regions, a contract-size limit and qualifications, while a preview re-ranks the six sample tenders as they answer. Buyers pick one of the four sample organisations with contracts and choose which review flags to watch; the government view then opens filtered to that organisation, its stats and badges count watched flags only, and the detail names the other buyers that use the same supplier. "Skip and explore as Maple Systems" keeps the old start.

Finishing setup starts an eight-step tour that dims the explorer, cuts out the control being explained, and switches views itself. The explanation and data-problem steps move on when the visitor uses them. *Take the tour* and *Setup* in the top bar bring each back, and *Reset workspace* clears both. The vendor profile goes through the existing `Workspace.profile`, so a private workspace still saves it; the buyer choice and watch list stay in the browser (`publicus-setup-v1`, `publicus-tour-v1`). No backend or Edge Function changed.

- `npm run test:publicus` adds `scripts/publicus-onboarding.test.mjs`: capability suggestions, the preview matching `matchRecord`, buyer options, the watch list covering every flag `contracts()` raises, stored-setup validation, the supplier's other buyers and both tours' steps.
- The UI suite adds setup, vendor and buyer flows, try-it steps, replay and reset, focus on each tour step, full-screen alignment, axe checks on the setup screen and an open step, and no overflow at 320, 390 and 1440 px.

## Live capability ticks and a still page during the tour — 16 November 2026

- **Capability ticks:** they now follow the company description as it's typed or deleted. Ticks made by hand are kept apart from the description's suggestions. A suggestion the visitor unticks stays off only while the description still names it. The hint lists only what is actually ticked.
- **Page scrolling:** the tour no longer scrolls the page on every step. From 760px up, the list and detail panes shrink to whatever height makes the whole explorer fit the window. The page is framed once, and each step reveals its control by scrolling inside a pane. The data-problem step returns to the role's own view, so the bottom bar stays on screen.
- **Phones:** below 760px the explorer can't fit beside the docked card, so the page still moves when a step's control is off screen.
- **Checks:**
  - lint and typecheck;
  - `npm run test:publicus` (36), which now also checks each tour's data-problem view;
  - `npm run test:dependencies` (9);
  - `npm run test:ui` (41), with new assertions for unticking by deleting text and a test that `scrollY` doesn't change across all 8 steps at 1280 × 720;
  - the Publicus UI file repeated 3 times (63/63);
  - a headless run at 1440 × 900, 1280 × 720 and 1024 × 768, where `scrollY` stayed at one value for every step and screenshots showed the ring on each control.
