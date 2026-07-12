"use client";

import { PROFILE } from "../lib/content";

const LINKS = [
  { label: "linkedin", glyph: "[↗]", href: PROFILE.linkedinUrl, external: true },
  { label: "github", glyph: "[↗]", href: PROFILE.githubUrl, external: true },
  { label: "email", glyph: "[↗]", href: `mailto:${PROFILE.email}`, external: false },
  { label: "resume", glyph: "[↓]", href: PROFILE.resumeUrl, external: false, download: true },
];

export default function Hero() {
  const [firstRole, secondRole] = PROFILE.title.toLowerCase().split(" & ");

  return (
    <section
      id="whoami"
      className="flex min-h-[60vh] scroll-mt-[90px] flex-col justify-center pt-24 pb-24 md:pt-40 md:pb-[150px]"
    >
      <div className="fade-up flex items-center gap-2.5">
        <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="text-xs text-muted">{PROFILE.availability}</span>
      </div>

      <h1 className="mt-6 font-grotesk text-[clamp(52px,9vw,104px)] font-bold leading-[0.95] tracking-[-0.04em] text-white">
        {PROFILE.name}
        <span
          aria-hidden="true"
          className="ml-[0.1em] inline-block h-[0.72em] w-[0.42em] bg-accent animate-[blink_1.1s_step-end_infinite] motion-reduce:animate-none"
        />
      </h1>

      <p className="fade-up fade-up-1 mt-7 text-[15px] text-fg">
        {firstRole} <span className="text-accent">×</span> {secondRole}
      </p>

      <p className="fade-up fade-up-2 mt-3.5 max-w-[520px] text-[13.5px] leading-[1.8] text-muted">
        {PROFILE.heroParagraph}
      </p>

      <div className="fade-up fade-up-3 mt-11 flex flex-wrap gap-6">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            {...(link.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            {...(link.download ? { download: true } : {})}
            className="text-[12.5px] text-muted transition-colors hover:text-white"
          >
            <span className="text-accent">{link.glyph}</span> {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
