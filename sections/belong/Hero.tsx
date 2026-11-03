import Link from "next/link";
import BreakLink from "@/components/belong/BreakLink";
import { PROFILE } from "@/lib/content";

export default function Hero() {
  return (
    <header className="bl-hero">
      <div className="bl-hero__bar bl-ui">
        <Link href="/">Rafeed Iqbal</Link>
        <a href={`mailto:${PROFILE.email}`}>Contact</a>
      </div>
      <h1 id="bl-hero-title" className="bl-giant">
        Making the machine right
      </h1>
      <div className="bl-hero__intro">
        <p>
          A working proposal for Belong’s two accuracy problems: an architecture that proves every label,
          and a file you can break to watch it work.
        </p>
        <p className="bl-hero__by">Rafeed Iqbal, November 2026</p>
        <div className="bl-hero__links bl-ui">
          <a className="bl-btn" href="#architecture">
            Read the architecture
          </a>
          <BreakLink />
        </div>
      </div>
    </header>
  );
}
