"use client";

import SectionHeader from "../components/SectionHeader";
import { PROFILE } from "../lib/content";

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-[90px] pb-20 md:pb-[110px]">
      <SectionHeader index="06" command="contact --help" delay={0.05}>
        <h3 className="font-grotesk text-[clamp(36px,5vw,52px)] font-bold tracking-[-0.03em] text-white">
          Let&apos;s build something.
        </h3>
        <p className="mt-[18px] max-w-[440px] text-[13.5px] leading-[1.8] text-muted">
          Open to software engineering and product roles — remote or hybrid. The fastest way to
          reach me is email.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a
            href={`mailto:${PROFILE.email}`}
            className="rounded-md border border-accent px-6 py-[11px] text-[13px] text-accent transition-colors hover:bg-accent hover:text-black"
          >
            {PROFILE.email}
          </a>
          <a
            href={PROFILE.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12.5px] text-muted transition-colors hover:text-white"
          >
            linkedin ↗
          </a>
          <a
            href={PROFILE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[12.5px] text-muted transition-colors hover:text-white"
          >
            github ↗
          </a>
          <a
            href={PROFILE.resumeUrl}
            download
            className="text-[12.5px] text-muted transition-colors hover:text-white"
          >
            resume ↓
          </a>
        </div>
      </SectionHeader>
    </section>
  );
}
