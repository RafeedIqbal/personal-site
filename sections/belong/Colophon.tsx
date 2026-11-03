import Link from "next/link";

const VISITED = "(last visited Nov. 3, 2026)";

// Table of Authorities, cited in Bluebook form.
export default function Colophon() {
  return (
    <footer className="bl-foot">
      <div className="bl-col">
        <h2 className="bl-foot__h">Table of Authorities</h2>
        <h3 className="bl-foot__group">Agency Materials</h3>
        <ul className="bl-toa">
          <li>
            U.S. Dep’t of State, <i>9 Foreign Affairs Manual</i> § 402.9-6 (2026).
          </li>
        </ul>
        <h3 className="bl-foot__group">Ethics Opinions</h3>
        <ul className="bl-toa">
          <li>ABA Comm. on Ethics &amp; Pro. Resp., Formal Op. 512 (2024).</li>
        </ul>
        <h3 className="bl-foot__group">Other Authorities</h3>
        <ul className="bl-toa">
          <li>
            Lei Liang et al., <i>KAG: Boosting LLMs in Professional Domains via Knowledge Augmented Generation</i>{" "}
            (Sept. 2024) (unpublished manuscript), <a href="https://arxiv.org/abs/2409.13731">https://arxiv.org/abs/2409.13731</a>.
          </li>
          <li>
            Belong, <i>E-2 Business Visa</i>,{" "}
            <a href="https://belonglaw.com/e-2-businessvisa/">https://belonglaw.com/e-2-businessvisa/</a> {VISITED}.
          </li>
          <li>
            Belong, <i>The Fastest Legal Way to Work in America</i>,{" "}
            <a href="https://belonglaw.com">https://belonglaw.com</a> {VISITED}.
          </li>
          <li>Belong, Founding Engineer (job posting) (2026) (on file with author).</li>
          <li>
            <i>
              Voice AI Agents Are Unbundling Professional Services Intake, and Solo Founders Are Building What
              Required 10-Person Teams 18 Months Ago
            </i>
            , Geeks of the Valley,{" "}
            <a href="https://geeksofthevalley.substack.com/p/voice-ai-agents-are-unbundling-professional-d2d">
              https://geeksofthevalley.substack.com/p/voice-ai-agents-are-unbundling-professional-d2d
            </a>{" "}
            {VISITED}.
          </li>
        </ul>
        <p className="bl-foot__line">
          Prepared by <Link href="/">Rafeed Iqbal</Link> for the Belong Founding Engineer application.
          Fictional data and simulated AI output; not legal advice.
        </p>
      </div>
    </footer>
  );
}
