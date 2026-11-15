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
