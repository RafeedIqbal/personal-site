# Publicus verification — 14 November 2026

Implementation branch: `codex/publicus-application`. Preview: `http://localhost:3001/publicus`.

## Automated checks

- `npm run lint` — passed.
- `npm run typecheck` and production `npm run build` — passed; `/publicus` and its social images prerender successfully.
- `npm run test:publicus` — 13 deterministic domain tests: qualification invalidation, cumulative amendments, conflicting values, buyer/contract isolation, absent original awards, missing sources, invalid citations, zero vs missing amounts, deadline offsets, CSV mapping, quoted CSV boundaries and current/stale exports.
- `npm run test:belong` and `npm run test:dependencies` — passed. Existing Belong code was not changed.
- `deno check` for both Edge Functions — passed.
- `deno test --allow-env --config supabase/functions/deno.json supabase/functions/tests/gemini.test.ts` — two tests passed. These intercept all network requests and validate the current Interactions request format, disabled provider interaction storage, quota reservation and quotation validation. **No real Gemini request was made.**
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

## Remaining external configuration

No hosted Supabase project was provisioned or deployed, and no application was submitted. The user will supply the hosted Supabase configuration and Gemini key. A live model extraction/answer still needs verification against that project. The checked-in setup guide covers deployment, worker scheduling and secret names. Scanned/image-only PDFs require OCR before upload; this prototype does not include an OCR service.
