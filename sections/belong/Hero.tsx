import Link from "next/link";
import BreakLink from "@/components/belong/BreakLink";
import ThemeToggle from "@/components/belong/ThemeToggle";

const PROMISES = [
  { text: "Every claim traces to a page.", href: "#evidence", n: 7 },
  { text: "Every dollar traces to an origin.", href: "#evidence", n: 7 },
  { text: "Every unsure item reaches the right reviewer.", href: "#routing", n: 6 },
  { text: "Every correction becomes a test.", href: "#loop", n: 9 },
];

export default function Hero() {
  return (
    <div className="bl-hero">
      <div className="bl-col">
        <div className="bl-topbar bl-ui">
          <Link href="/" className="bl-topbar__name">
            Rafeed Iqbal
          </Link>
          <ThemeToggle />
        </div>
        <div className="bl-row">
          <div className="bl-main bl-main--hero">
            <p className="bl-hero__meta bl-ui">
              Prepared for the Belong Founding Engineer application, November 2026
            </p>
            <h1 className="bl-h1">
              Fast is solved.
              <br />
              Here is how I would make it right.
            </h1>
            <p className="bl-hero__sub">A working proposal for Belong’s two accuracy problems.</p>
            <div className="bl-hero__actions bl-ui">
              <BreakLink />
              <p className="bl-hero__hint">
                Runs in your browser on a fictional file. Nothing you do here is sent anywhere.
              </p>
            </div>
          </div>
          <ul className="bl-promises bl-ui" aria-label="What the proposal commits to">
            {PROMISES.map((p) => (
              <li key={p.text}>
                <a href={p.href}>
                  {p.text}
                  <span className="bl-promises__ref">§&thinsp;{p.n}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
