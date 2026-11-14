# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary for `/publicus`:** Joe Noss and Akash Shetty, founders of Publicus (Toronto), reviewing Rafeed Iqbal's application for Founding Engineer, Product & AI. They open an unlisted link from the application, most likely on a laptop during the working day, and decide within a short read whether to start a conversation.
- **Site-wide:** founders, hiring managers and collaborators reading Rafeed's portfolio at rafeed.dev, and the companies each unlisted proposal page is written for (for example `/belong`).

## Product Purpose

rafeed.dev is Rafeed Iqbal's personal site: a portfolio plus unlisted pages, each written for one company. `/publicus` succeeds when a Publicus founder sees enough evidence of fit to email Rafeed or open the résumé.

## Positioning

The application pages prove fit with working software rather than adjectives. `/publicus` embeds a procurement explorer that runs on real CanadaBuys public records as well as fictional sample data. Each answer stays attached to the source text it came from, and missing or conflicting values stay visible. No other applicant's page can claim this specific work.

## Operating Context

- Canadian public procurement: CanadaBuys tender notices, awards, amendments and contract history; bilingual English/French records; vendors deciding whether to bid; public buyers watching amendments, values and expiry dates.
- Publicus's published material, reviewed 14 November 2026: About, How it works, Government, Security, Careers, and Akash Shetty's Toronto Machine Learning Summit abstract describing an evidence ledger.
- The proposal pages are unlisted: `noindex` metadata, an `X-Robots-Tag` header, and no sitemap entry.

## Capabilities and Constraints

- `/publicus` has a narrative (experience, why Publicus, approach, contact) and a procurement explorer with vendor, government and sources views. The explorer supports profile matching, evidence scenarios, a source viewer, CSV import, an optional private workspace (Supabase anonymous auth, seven-day expiry) and, when connected, Gemini answers whose quotations are checked against the source.
- The explorer's behaviour is covered by `npm run test:publicus` and must not change during visual work.
- Next.js 16 App Router and React 19. The narrative is server-rendered; the explorer is client-only.
- Each route keeps its own scoped theme. The main portfolio's graphite and green and `/belong`'s Belong palette are separate systems.

## Brand Commitments

- Rafeed's voice: first person, plain and specific.
- `/publicus` keeps a nod to Publicus: its brand purple `#634086` (deep `#2e1e44`) in one role. It must not use Publicus's logo or reproduce its marketing layout. Confirmed by the user on 15 November 2026.
- `/publicus` carries no disclaimers and no outbound research or source links (user, 15 November 2026). The exceptions are the Open Government Licence – Canada attribution line, which the licence requires, and the explorer's in-product labels on fictional sample records. Links to Rafeed's own work, résumé and contact stay.

## Evidence on Hand

- **Basenote, July 2026–present:** sole engineer. Built Blend, a LangGraph tool-calling formulation agent, on a multi-tenant Django/PostgreSQL ERP, with pgvector retrieval over in-house chemist data and live inventory. Formulation checks run in code. Also owns queues, recovery paths and storefront integrations. The first licensed-client pilot is still in progress. Public site: basenotesolutions.com/private-label.
- **Icon, July 2025–June 2026:** Head of Product & Engineering. AI coaching avatars of trainers and athletes, sold through paid subscriptions. Took the product from MVP to a production-ready launch and grew engineering from two to eight people. Public site: icontraining.app.
- **Palette Knife:** an open-source Python toolkit for resumable public-data collection (github.com/RafeedIqbal/palette-knife).
- **Public data:** ten CanadaBuys records captured 14 November 2026 in `lib/publicus/public-records.json`, each with its source row, reused under the Open Government Licence – Canada.
- **Résumé:** `public/publicus/Rafeed_Iqbal_Publicus_Resume.pdf`.
- **Pending:** product screenshots of Blend/Basenote and Icon, to be supplied by the user.
- **Never fabricate:** usage, revenue or performance numbers; client names or client data; testimonials; any claim that the prototype reproduces Publicus's infrastructure, Canadian hosting or Protected B status.

## Product Principles

1. Show the working thing before describing it.
2. Inside the explorer, every answer traces to its source text, and fictional sample data is labelled as fictional.
3. Missing or conflicting data is shown, not smoothed over.
4. Write each page for the specific people who will read it.

## Accessibility & Inclusion

WCAG 2.1 AA as checked by axe, keyboard operation throughout, reduced-motion support, and a narrative that works without JavaScript.
