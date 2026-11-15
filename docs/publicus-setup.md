# Publicus demo setup

The `/publicus` page is unlisted and `noindex`. It works with fictional records, deterministic explanations, a dated CanadaBuys snapshot and local CSV imports without backend keys. It is a prototype built for this application; it is not affiliated with Publicus.

## Local development

```sh
npm ci
supabase start
supabase status
```

Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from your **dedicated** project's settings. The publishable key is designed for browser use; never put the service-role or Gemini key in a `NEXT_PUBLIC_` variable.

Copy `supabase/functions/.env.example` to an ignored `.env.publicus-functions` file at the repository root. Set a random `PUBLICUS_WORKER_SECRET`, the exact `ALLOWED_ORIGINS` and, when available, `GEMINI_API_KEY`. The models come from the eval's picks in `supabase/functions/_shared/models.ts` (see [Choosing the models](#choosing-the-models)); `GEMINI_MODEL` and `GEMINI_CHAT_MODEL` override them with any model enabled on your Google project. Structured-output requests use Google's [Interactions REST API](https://aistudio.google.com/api-reference/interactions-api/create-interaction), revision `2026-05-20`, with provider interaction storage disabled (`store: false`). The default model and request format were checked against the [current model documentation](https://aistudio.google.com/docs/models/gemini-4-hydrogen) on 14 November 2026.

```sh
supabase functions serve --env-file .env.publicus-functions
npm run build
PORT=3001 npm run start
```

Open `http://localhost:3001/publicus`. Under **Sources & imports**, select **Start private workspace**. No email, password or sign-in UI is required. The initial sample remains browser-local until this explicit connection; starting the private workspace restores its own saved state, rather than merging arbitrary local browser data into the server.

## Dedicated hosted project

1. Create a separate Supabase project for this demo. Enable anonymous sign-ins. Select a region appropriate to your intended users; no residency claim is made by the application.
2. `supabase link --project-ref YOUR_PROJECT_REF`, then `supabase db push --remote`. Review the migrations before applying them; they create only `publicus_*` tables/functions, a private `publicus-documents` bucket and a cron job.
3. Deploy the functions with `supabase functions deploy publicus-api publicus-worker publicus-chat --remote=YOUR_PROJECT_REF`. Deploy them before the website: the browser no longer sends a sample seed on bootstrap and polls the `runs` action while jobs run, and older functions reject both. JWT gateway verification is disabled in the function config because the API and the chat verify the user token with `auth.getUser` themselves, and the worker uses a separate secret. No endpoint is unauthenticated internally.
4. Set the Edge secrets from the ignored functions environment file with `supabase secrets set --env-file .env.publicus-functions --remote=YOUR_PROJECT_REF`. Supabase supplies its URL and service-role key to the function runtime. Set the website's two public Supabase environment values and rebuild the frontend.
5. In Supabase Vault create `publicus_worker_url` with `https://YOUR_PROJECT_REF.supabase.co/functions/v1/publicus-worker`, and `publicus_worker_secret` matching `PUBLICUS_WORKER_SECRET`. Use the dashboard or a parameterized administrative query; do not commit values. The migration's minute cron tick is a no-op until both entries exist.
6. Test upload, source access and a model answer. Configure Supabase anonymous-auth rate limits and CAPTCHA for a widely shared deployment. Confirm the daily AI cap fits the project's budget before adding a model key.

The configured hosted project is **personal-site-publicus** (`clfgowkxumajjjfxkfwa`) in Canada Central, separate from other applications. Its [dashboard](https://supabase.com/dashboard/project/clfgowkxumajjjfxkfwa) contains both deployed functions, the three migrations, the private storage bucket and the scheduled worker. Anonymous sign-ins are enabled with a limit of 10 per IP per hour. The auth site URL is `https://www.rafeed.dev`; allowed application origins are `https://www.rafeed.dev` and `https://rafeed.dev`.

Vercel's `personal-site` project uses the hosted URL and publishable key in **Production**. Gemini runs in Supabase: `GEMINI_API_KEY`, `GEMINI_MODEL`, `ALLOWED_ORIGINS`, `PUBLICUS_WORKER_SECRET` and `PUBLICUS_AI_DAILY_LIMIT` are configured as Edge Function secrets. `PUBLICUS_CHAT_DAILY_LIMIT` (default 200) and `PUBLICUS_UPLOAD_DAILY_LIMIT` (default 50) are optional. A Gemini key in Vercel alone does not configure the worker. Keep database credentials, worker secrets and model keys out of Git and browser bundles.

## Backend behavior

- PostgreSQL owns seven-day anonymous workspaces and durable job state. RLS exposes only an owner's unexpired workspace/runs. Client roles cannot mutate rows, extend expiry or invoke service-only functions. The Edge API validates user identity and allowed state changes. The worker's cleanup pass also deletes anonymous users older than seven days who never created a workspace (help-chat visitors) through `publicus_purge_anonymous`. Job failures show the visitor only authored messages; database, parser and provider errors are logged instead.
- Storage is private. Upload URLs are issued for a server-generated owner/workspace path. Source download URLs last 60 seconds and require ownership. A CSV stores individual source rows, text and checksum; PDF/TXT preserves the original file plus extracted source text. Public source URLs are allowlisted for ingestion.
- An atomic SQL claim gives each job a token and a 120-second lease. A completed result can only be committed by the active lease holder. Interrupted jobs can be reclaimed up to three attempts; explicit failures expose retry. Insertion happens before the best-effort worker wake-up; cron recovers work after a closed tab or terminated request. The worker processes one bounded job per tick. Wake-up and cron HTTP requests allow 10 seconds for hosted cold starts. The API reads workspace state after job status so a completed job includes its committed result.
- Quotas reserve atomically before work: 10 upload tickets per anonymous user and 50 across all visitors per day (`PUBLICUS_UPLOAD_DAILY_LIMIT`, capped at 500); 25 new/retried jobs per anonymous user per day; 12 model calls per user per day; 100 global model calls per day by default (`PUBLICUS_AI_DAILY_LIMIT`, capped at 500). New anonymous identities cannot bypass the global model cap. Failed model requests still consume a reservation, keeping costs bounded. Limits on files, text and records also apply.
- Live CSV imports cover the first 120 rows, not the complete file. A streaming parser stops at a complete quoted-record boundary and caps the prefix at 8 MB. Per-row checksums make repeated record imports idempotent. Feed jobs can refresh daily. Files are at most 10 MB, text at most 120,000 characters, PDFs at most 50 pages, workspaces at most 500 records and 4 MB JSON.
- Text-based PDFs use `unpdf`; password-protected, corrupt or scanned/image-only files fail clearly. There is no OCR service in this version. PDF/TXT extraction and free-form questions require Gemini; CSV/feed ingestion does not.
- AI source text and questions are treated as untrusted data. The model is schema-constrained and has no execution tools. Output is validated again; source IDs, pages, rows and quotations must exist. This checks citation presence, not semantic truth. Generated fields require human review before qualification; a listing may omit requirements, so users must inspect the full tender.
- Vendor matching is deterministic and explained in the UI. Government totals use the latest cumulative contract value, never a sum across amendments. Conflicting latest values are withheld. Supplier grouping uses exact normalized names plus explicit fictional aliases; it does not infer beneficial ownership.
- The help chat (`publicus-chat`) answers synchronously, outside the job queue. It sends Gemini a fixed fact sheet from `supabase/functions/_shared/assistant.ts`, the visitor's question, the last six turns and a capped summary of the explorer view, and accepts only the fact ids in that sheet as sources. It uses the eval's chat pick (`CHAT` in `supabase/functions/_shared/models.ts`, with a 2,000-token output cap and a 30-second timeout); `GEMINI_CHAT_MODEL` overrides it. It reuses the visitor's anonymous session and has its own quota, separate from the explorer's: 20 questions per visitor per day and 200 in total by default (`PUBLICUS_CHAT_DAILY_LIMIT`, capped at 1,000). The four suggested questions have prepared answers and never call the model. Nothing is stored, and the browser keeps the conversation in session storage only. When the chat is unavailable, over quota or the facts don't cover a question, the panel offers Rafeed's email address.
- The worker removes expired objects through Storage API before deleting their workspace and anonymous account. Reset uses the same Storage-first path. Expired rows are inaccessible even if a cleanup tick is delayed. Configure and monitor the cron tick; it is required for physical cleanup and durable recovery. Local browser data is discarded on the next visit after expiry.

## Choosing the models

`npm run eval:publicus` runs the cases in `supabase/functions/evals/cases.ts` against every current Gemini text model listed in `evals/run.ts`, at low and (where accepted) minimal thinking, twice each. It needs `GEMINI_API_KEY` in `.env.local`, calls the paid API directly without reserving demo quota, and takes about half an hour. Scores are deterministic checks: the chat cases use the production fact sheet and schema; the explorer cases use the worker's own question and extraction prompts on fixture records, and count fabricated quotations as failures.

The run writes `lib/publicus/model-evals.json`, which the page's model figure and the tests read, and rewrites the `EVAL_CHAT` and `EVAL_DEMO` picks in `_shared/models.ts`. `CHOICE` in the same file can override both with another setting the eval measured; it is set to Gemini 3.8 Flash at low thinking, the newest Flash model, and the page's figure explains the override with both models' numbers. Set it to `null` to run the eval's picks. A setting is accurate when it scores within 5 points of the best setting for that task and fails no more than 5% of calls; the fastest accurate setting wins, with times within 10% treated as a tie that goes to the cheaper model. Costs use the list prices copied into `run.ts` with their date. After a run, update the `models` fact in `_shared/assistant.ts`, redeploy `publicus-chat` and `publicus-worker`, and set or remove the `GEMINI_MODEL` secret so it doesn't override the pick. Thinking tokens count toward the output cap, so keep the caps generous.

## Verification

```sh
npm run lint
npm run typecheck
npm run test:publicus
npm run test:belong
npm run build
deno check --config supabase/functions/deno.json supabase/functions/publicus-api/index.ts supabase/functions/publicus-worker/index.ts supabase/functions/publicus-chat/index.ts
(cd supabase/functions && deno test --allow-env --allow-net=127.0.0.1 tests/)
# With the local stack and functions running, without a Gemini key:
npm run test:publicus:integration
```

The integration script rejects non-loopback project URLs, creates two temporary anonymous users and removes its own fixtures. It checks RLS, private Storage, quota concurrency, queue leases/recovery, idempotence, source URLs, requirement changes, expiry and cleanup. It intentionally does not make paid model calls. Separate bounded hosted checks cover model behavior; see [verification](publicus-verification.md).

The snapshot can be refreshed by downloading the official open-tender and 2026–27 award CSVs, then running `node scripts/publicus-snapshot.mjs /path/to/tenders.csv /path/to/awards.csv`. Review the data and capture date before committing.
