# Publicus application: research and design notes

Reviewed 14 November 2026. The page is an independent application, not a Publicus product or an implementation of its internal systems.

## Company and role

- [Founding Engineer, Product & AI](https://publicus.ai/careers/founding-engineer): ownership from customer conversations to production, modern web/cloud development, Python and SQL, AI-assisted development, evaluation and monitoring. The role is in person in Toronto. Its procurement exercise includes changing requirements; the demo makes this concrete with an addendum and contradictory amendment values.
- [About](https://publicus.ai/about): founded in 2024 by Joe Noss and Akash Shetty. Noss brings government transformation experience; Shetty brings applied ML experience. The product addresses the friction between publicly available procurement information and usable decisions.
- [How it works](https://publicus.ai/how-it-works), [government](https://publicus.ai/government), [case studies](https://publicus.ai/case-studies), [AMO](https://publicus.ai/amo): aggregation and enrichment of procurement records across federal, provincial, municipal and broader public-sector sources; separate vendor and buyer use cases. The prototype covers one federal source, explicitly not Publicus's broader coverage.
- [Daily recommendations](https://publicus.ai/docs/daily-recommended-opportunities) and [saved opportunities](https://publicus.ai/docs/saved-opportunities): vendor fit depends on company capabilities, region and opportunity characteristics. The demo uses transparent deterministic screening; it does not describe its score as Publicus's semantic algorithm or a probability of winning.
- [Security](https://publicus.ai/security): Publicus describes Canadian hosting, self-hosted models, tenant isolation, provenance and no training on customer data. Protected B statements concern the described PSPC deployment. These are company statements, not independent verification, and none are attributed to this Supabase/Gemini prototype.
- [Akash Shetty's Toronto Machine Learning Summit abstract](https://www.torontomachinelearning.com/test/): evidence-ledger approach linking facts, claims, source locations, transformation history, confidence and conflicts; separation of retrieval and verification; review of unsupported/conflicting claims. Evaluation includes field extraction, claim/source agreement, grounding, conflict handling, latency, cost and human review burden. This is a published technical description, not access to internal architecture.

## Product interpretation

The common object is an evidence-backed procurement record. Vendors need screening, mandatory-qualification checks, a saved pipeline, notes and a brief. Buyers need distinct contracts, versions, cumulative values, end dates and supplier relationships. A value at amendment 3 replaces the earlier cumulative total; adding all versions would inflate the result. A supplier's Canadian address does not prove beneficial ownership. Reported contract value is not payment evidence.

The UI exposes these boundaries. Unsupported quotations are downgraded; competing latest values withhold a consolidated total; profile and requirement changes invalidate prior qualification; old explanations are marked stale. Quotations being present in the source does not itself verify the model's interpretation.

## Experience evidence

Content was checked against the existing portfolio and the user's tailored Publicus résumé/application materials in `Desktop/Resume/codex_work/publicus-content.json` and `publicus-answers.md`. The published résumé copy is `public/publicus/Rafeed_Iqbal_Publicus_Resume.pdf`.

- Basenote, July 2026–present: sole engineer; multi-tenant Django/PostgreSQL ERP; Blend's LangGraph tool-calling agent, live inventory, pgvector and in-house chemist data; formulation checks in code; operational queues and recovery; storefront integration. The first licensed-client pilot is ongoing. No invented production adoption or performance numbers.
- Icon, July 2025–June 2026: Head of Product & Engineering; AI coaching avatars and paid subscriptions; MVP through production-ready launch; business priorities, architecture, sprints, hands-on AI and website work; team growth from two to eight.
- [Palette Knife](https://github.com/RafeedIqbal/palette-knife): open-source collection work as a supporting example, not the main story.

No private customer data or proprietary code is displayed. Toronto in-person comfort follows the user's application materials; no work-authorization or relocation claim is added.

## Design studies

The actual galleries and selected sites were inspected during planning:

| Gallery reference | Component studied | Application here |
| --- | --- | --- |
| [Enode — Minimal Gallery](https://minimal.gallery/enode/) / [platform](https://enode.com/platform/overview) | Connected-system diagrams and sequenced product explanation | Original Basenote flow diagram and evidence orbit |
| [Reflect v2 — One Page Love](https://onepagelove.com/reflect-v2) | Restrained violet atmosphere transitioning to a light product surface | Dark narrative and light working explorer |
| [Linear — SiteInspire](https://www.siteinspire.com/website/9425-linear) | Clear typography, precise borders and detailed product views | Quiet workspace, master/detail layout, compact source labels |

Publicus's own dark violet visual language is the anchor. Illustrations are original CSS/SVG, not copied brand assets or fabricated product screenshots. Manrope and Public Sans distinguish the application from `/belong`.

## Public data and limits

[CanadaBuys support](https://donnees-data.tpsgc-pwgsc.gc.ca/ba2/ac-cb/soutien-support-eng.html) and [data dictionary](https://donnees-data.tpsgc-pwgsc.gc.ca/ba2/ac-cb/achatscanada-canadabuys-dd.xml) define bilingual columns, notice status and fixed UTC−05:00 timestamps. The checked-in ten-record snapshot was captured on 14 November 2026; its exact timestamp, source URL and row are retained for each record.

Connectors use allowlisted official open-tender, 2026–27 award and contract-history CSVs. Live imports intentionally stop after 120 complete source rows and label this partial coverage. This is not market-wide indexing, a procurement recommendation service or a complete contract ledger. Source data is reused under the [Open Government Licence – Canada](https://open.canada.ca/en/open-government-licence-canada).
