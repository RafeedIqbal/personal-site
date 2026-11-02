import Link from "next/link";
import { SOURCES } from "@/lib/belong/sources";

export default function Colophon() {
  return (
    <footer className="bl-foot bl-ui">
      <div className="bl-col">
        <div className="bl-row">
          <div className="bl-main bl-main--wide">
            <p className="bl-foot__disclaimer">
              Fictional data and simulated AI output. Illustrative only, not legal advice.
            </p>
            <p>
              Prepared for the Belong Founding Engineer application. I am not affiliated with Belong, and
              this page is not endorsed by it. It uses no Belong logos or screenshots.
            </p>
            <h2 className="bl-foot__h">Sources, checked 3 November 2026</h2>
            <ul className="bl-foot__sources">
              {Object.values(SOURCES).map((source) => (
                <li key={source.label}>
                  {"href" in source ? (
                    <a href={source.href} target="_blank" rel="noreferrer">
                      {source.label}
                    </a>
                  ) : (
                    source.label
                  )}
                </li>
              ))}
            </ul>
            <p className="bl-foot__end">
              <Link href="/">rafeed.dev</Link>
              <a href="#top">Back to top</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
