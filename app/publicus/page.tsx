import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata, Viewport } from "next";
import Image from "next/image";
import Link from "next/link";
import DemoLoader from "@/components/publicus/DemoLoader";
import HelpChat from "@/components/publicus/HelpChat";
import RecordSheet from "@/components/publicus/RecordSheet";

const resume = "/publicus/Rafeed_Iqbal_Publicus_Resume.pdf";
const email = "rafeediqbal@gmail.com";
const title = "Rafeed Iqbal’s application to Publicus";
const description = "Rafeed Iqbal’s application for Founding Engineer, Product & AI at Publicus: work at BaseNote and Icon, and a procurement explorer built on CanadaBuys open data.";
export const metadata: Metadata = { title: { absolute: title }, description, robots: { index: false, follow: false, nocache: true }, alternates: { canonical: "/publicus" }, openGraph: { title, description, url: "/publicus", type: "website" }, twitter: { card: "summary_large_image", title, description } };
export const viewport: Viewport = { themeColor: "#fcfcfb", colorScheme: "light" };

function Arrow({ down = false }: { down?: boolean }) {
  return <svg className="pu-arrow" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" aria-hidden="true">{down ? <path d="M7 2v10M3 8l4 4 4-4"/> : <path d="M4 10l6-6M5 4h5v5"/>}</svg>;
}

// A real product screenshot dropped into public/publicus/work/ replaces the public-site capture on the next build.
function Shot({ work, capture, alt, href, site, product }: { work: string; capture: string; alt: string; href: string; site: string; product: string }) {
  const own = `/publicus/work/${work}`;
  const hasOwn = existsSync(join(process.cwd(), "public", own));
  const src = hasOwn ? own : `/publicus/captures/${capture}`;
  const label = hasOwn ? product : `Public site, ${site}, captured 15 Nov 2026`;
  return <figure className="pu-shot">
    <a href={href} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true"><Image src={src} alt={alt} width={1440} height={836} sizes="(min-width: 1024px) 660px, 100vw"/></a>
    <figcaption><a href={href} target="_blank" rel="noopener noreferrer">{label} <Arrow/></a></figcaption>
  </figure>;
}

function Meta({ rows }: { rows: [string, string, boolean?][] }) {
  return <dl className="pu-entry-meta">{rows.map(([term, value, figure]) => <div key={term}><dt>{term}</dt><dd className={figure ? "pu-data" : undefined}>{value}</dd></div>)}</dl>;
}

export default function PublicusPage() {
  return <>
    <a className="pu-skip" href="#content">Skip to content</a>
    <header className="pu-strip pu-container">
      <p><Link href="/">rafeed.dev</Link><span aria-hidden="true"> / </span><span>publicus</span></p>
      <nav aria-label="On this page"><a href="#work" className="pu-wide">Work</a><a href="#explorer" className="pu-wide">Explorer</a><a href={resume} target="_blank" rel="noopener noreferrer">Résumé (PDF)</a><a href={`mailto:${email}`}>Email</a></nav>
    </header>

    <main id="content" tabIndex={-1}>
      <section className="pu-masthead" aria-labelledby="pu-title">
        <div className="pu-container">
          <h1 id="pu-title">I’m applying to be Publicus’s Founding Engineer, Product &amp; AI.</h1>
          <dl className="pu-meta">
            <div><dt>Publisher</dt><dd>Rafeed Iqbal</dd></div>
            <div><dt>Modified</dt><dd className="pu-data">2026-11-15</dd></div>
            <div><dt>Contents</dt><dd><a href="#work">2 roles</a>, <a href="#palette-knife">1 open-source project</a>, <a href="#records">10 CanadaBuys records</a>, <a href="#explorer">1 explorer</a></dd></div>
            <div><dt>Format</dt><dd>HTML, PDF résumé (86 KB)</dd></div>
          </dl>
        </div>
      </section>

      <div className="pu-intro pu-container">
        <p>I’m Rafeed. I’m the only engineer at BaseNote, where I built Blend, an AI agent that writes perfume formulas using only the oils a studio has in stock. Before that I led product and engineering at Icon and grew the team from two to eight. This page has both jobs, ten real CanadaBuys records, and a procurement explorer I built on top of them.</p>
        <ul className="pu-resources" aria-label="Resources">
          <li><a className="pu-primary" href={`mailto:${email}`}><span>Email me</span><span className="pu-data">{email}</span></a></li>
          <li><a href={resume} target="_blank" rel="noopener noreferrer"><span>Résumé</span><span className="pu-data">PDF, 86 KB <Arrow/></span></a></li>
          <li><a href="#explorer"><span>Explorer</span><span>On this page <Arrow down/></span></a></li>
        </ul>
      </div>

      <RecordSheet/>

      <section id="work" className="pu-section pu-container" aria-labelledby="work-title">
        <div className="pu-section-head">
          <h2 id="work-title">Work</h2>
          <p>Publicus wants an engineer who owns work from customer conversations through to production. I’ve done that in both of my last two jobs.</p>
        </div>
        <div className="pu-entries">
          <article className="pu-entry" aria-labelledby="basenote-title">
            <Meta rows={[["Company", "BaseNote"], ["Role", "Founding engineer, sole engineer"], ["Period", "Jul 2026 – present", true], ["Status", "Pilot in progress"]]}/>
            <div className="pu-entry-body">
              <h3 id="basenote-title">An agent that only suggests oils the studio has in stock</h3>
              <p>BaseNote’s first licensed client, a custom-perfume retailer, wanted AI-guided consultations that end in a formula made from the studio’s own oils. A chat model on its own will happily suggest oils the studio doesn’t stock, and a perfumer can’t use a formula nobody has checked.</p>
              <p>I built Blend in Python with LangGraph, Django and PostgreSQL. Its tools search live inventory and retrieve from a pgvector knowledge base of our chemists’ experimental data. The guardrails live in code: the agent only sees in-stock materials, and code validates every draft before anyone sees it.</p>
              <p>To choose its model, I built an eval suite that scored flash-tier models on accuracy, tool calling, cost and latency. Gemini Flash and DeepSeek Flash led, and DeepSeek Flash won on cost.</p>
              <p>I also run the rest of the platform: a multi-tenant ERP, storefront integrations, and a database-backed job queue with leases, bounded retries and recovery paths. The pilot with that first client is still in progress.</p>
              <Shot work="blend.webp" capture="basenote-private-label.webp" alt="BaseNote’s private-label page: “Launch your own fragrance” over a lit perfume bottle." href="https://www.basenotesolutions.com/private-label" site="basenotesolutions.com/private-label" product="Blend at BaseNote"/>
            </div>
          </article>
          <article className="pu-entry" aria-labelledby="icon-title">
            <Meta rows={[["Company", "Icon"], ["Role", "Head of Product & Engineering"], ["Period", "Jul 2025 – Jun 2026", true], ["Engineers", "2 → 8", true]]}/>
            <div className="pu-entry-body">
              <h3 id="icon-title">An AI coaching product from MVP to launch, and a team from two to eight</h3>
              <p>Icon sells AI coaching avatars of trainers and athletes through paid subscriptions. I led the product from MVP to a production-ready launch, turning business goals into architecture, priorities and sprints, and I kept writing code for the AI features and the company website.</p>
              <p>I grew engineering from two people to eight and ran recruitment, sprint planning and day-to-day operations.</p>
              <Shot work="icon.webp" capture="icon-training.webp" alt="Icon’s home page: “Download your favourite athlete’s brain” beside coaches from the app." href="https://icontraining.app" site="icontraining.app" product="The Icon app"/>
            </div>
          </article>
          <article id="palette-knife" className="pu-entry pu-entry-short" aria-labelledby="palette-title">
            <Meta rows={[["Project", "Palette Knife"], ["Type", "Open source"]]}/>
            <div className="pu-entry-body">
              <h3 id="palette-title" className="pu-sr">Palette Knife</h3>
              <p>Palette Knife is my open-source Python toolkit for resumable web scraping. It keeps work in a durable SQLite queue and exports JSON, JSONL and CSV with source provenance on every record.</p>
              <p><a className="pu-link" href="https://github.com/RafeedIqbal/palette-knife" target="_blank" rel="noopener noreferrer">github.com/RafeedIqbal/palette-knife <Arrow/></a></p>
            </div>
          </article>
        </div>
      </section>

      <section id="why" className="pu-section pu-container" aria-labelledby="why-title">
        <div className="pu-section-head">
          <h2 id="why-title">Why Publicus</h2>
          <p>A tender, its addenda, the award and a later amendment can describe one contract four different ways, and a single CSV row can disagree with itself (row 1 above). Publicus turns that record into something a vendor or a public buyer can act on, and that’s the problem I want to work on.</p>
        </div>
        <table className="pu-sides">
          <thead><tr><th scope="col"><span className="pu-sr">Field</span></th><th scope="col">Vendors</th><th scope="col">Public buyers</th></tr></thead>
          <tbody>
            <tr className="pu-sides-question"><th scope="row">Question</th><td>Is this worth bidding on?</td><td>Which contracts need a look?</td></tr>
            <tr><th scope="row">What helps</th><td>Match opportunities to a company’s capabilities, regions and qualifications, and keep the reason for each match next to it.</td><td>Follow suppliers, contract values, amendments and end dates, and keep the original records when values change.</td></tr>
          </tbody>
        </table>
        <p className="pu-sides-note">The piece I read most closely was Akash Shetty’s Toronto Machine Learning Summit abstract. It describes an evidence ledger that ties each claim to its source, the transformations applied to it, and any conflicts. The explorer below is a small version of that idea.</p>
      </section>

      <section id="explorer" className="pu-section pu-section-wide pu-container" aria-labelledby="explorer-title">
        <div className="pu-section-head">
          <h2 id="explorer-title">A procurement explorer I built for this application</h2>
          <p>Start in the vendor view, then switch to the buyer view. The scenario menu at the bottom adds a late security requirement, two amendment values that disagree, or a missing source document, and the qualification checks, flags and explanations change with it.</p>
        </div>
        <dl className="pu-build">
          <div><dt>How it works</dt><dd><p>Everything you click runs in your browser. Ranking, qualification checks, contract grouping and the prepared explanations come from plain rules in one TypeScript file, with no model involved, and the same file runs in the Node tests and on the server. If you start a private workspace, your copy moves to Supabase, where the live CanadaBuys feed, PDF uploads and open questions run as background jobs.</p></dd></div>
          <div><dt>Architecture</dt><dd>
            <ol className="pu-path" aria-label="Request path"><li>browser</li><li>publicus-api</li><li>Postgres job queue</li><li>publicus-worker</li><li>Gemini</li></ol>
            <p>An Edge Function checks each request and queues the job in Postgres. A worker claims it with a two-minute lease, tries it up to three times, and saves the result only while its lease holds. Gemini reads uploaded PDFs and answers questions, and each quote it cites is checked against the source text. A claim whose quote doesn’t match is marked for review.</p>
          </dd></div>
          <div><dt>Stack</dt><dd><p>Next.js 16, React 19 and TypeScript on Vercel. Supabase for Postgres 17, Edge Functions on Deno, anonymous auth, storage and pg_cron. Google Gemini, Papa Parse for CSV and unpdf for PDF text. The help chat in the corner runs on the same functions and answers only from a fact sheet built from this page and my résumé.</p></dd></div>
        </dl>
        <DemoLoader/>
      </section>

      <section id="approach" className="pu-section pu-container" aria-labelledby="approach-title">
        <div className="pu-section-head"><h2 id="approach-title">How I’d start</h2></div>
        <ol className="pu-steps">
          <li><h3>Start with one real decision.</h3><p>I’d watch a buyer review an amendment and a vendor decide whether to bid, then make that loop measurably easier before widening the scope.</p></li>
          <li><h3>Keep uncertainty visible.</h3><p>Reported values stay separate from inferred relationships, and missing or conflicting records get their own place in the interface.</p></li>
          <li><h3>Measure it after it ships.</h3><p>I’d evaluate extraction and grounding, track latency, cost and review burden, and build retries and recovery into the workflow, the same way I chose Blend’s model.</p></li>
        </ol>
      </section>

      <section id="contact" className="pu-section pu-contact pu-container" aria-labelledby="contact-title">
        <div className="pu-section-head"><h2 id="contact-title">Get in touch</h2></div>
        <div>
          <p>I can work full time in person at Publicus’s Toronto office. If this looks like a fit, email me and I’ll walk you through Blend or the explorer in more detail.</p>
          <p className="pu-actions"><a className="pu-button" href={`mailto:${email}`}>Email {email}</a><a className="pu-link" href={resume} target="_blank" rel="noopener noreferrer">Résumé (PDF) <Arrow/></a></p>
        </div>
      </section>
    </main>

    <footer className="pu-footer pu-container">
      <p><Link href="/">Rafeed Iqbal</Link>. Written and built in November 2026.</p>
      <p><a href="https://github.com/RafeedIqbal" target="_blank" rel="noopener noreferrer">GitHub</a><a href="https://www.linkedin.com/in/rafeediqbal/" target="_blank" rel="noopener noreferrer">LinkedIn</a></p>
    </footer>
    <HelpChat/>
  </>;
}
