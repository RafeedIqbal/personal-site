import Link from "next/link";
import BreakLink from "@/components/belong/BreakLink";

export default function Hero() {
  return (
    <div className="bl-hero">
      <div className="bl-col">
        <div className="bl-topbar bl-ui">
          <Link href="/" className="bl-topbar__name">
            Rafeed Iqbal
          </Link>
        </div>
        <h1 className="bl-h1">
          Fast is solved.
          <br />
          Here is how I would make it right.
        </h1>
        <p className="bl-hero__sub">A working proposal for Belong’s two accuracy problems.</p>
        <BreakLink />
      </div>
    </div>
  );
}
