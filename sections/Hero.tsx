"use client";

import CommandBlock from "../components/CommandBlock";
import { PROFILE } from "../lib/content";

export default function Hero() {
  return (
    <section id="whoami" className="space-y-6 scroll-mt-16">
      <CommandBlock command="whoami">
        <div className="space-y-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">
              {PROFILE.name}
            </h1>
            <p className="text-[#888888] text-base mt-2">{PROFILE.title}</p>
            <p className="text-[#555555] text-sm mt-1">{PROFILE.tagline}</p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href={PROFILE.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#333333] px-4 py-1.5 text-xs hover:bg-[#111111] hover:border-white transition-colors"
            >
              [↗] linkedin
            </a>
            <a
              href={PROFILE.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-[#333333] px-4 py-1.5 text-xs hover:bg-[#111111] hover:border-white transition-colors"
            >
              [↗] github
            </a>
            <a
              href={`mailto:${PROFILE.email}`}
              className="border border-[#333333] px-4 py-1.5 text-xs hover:bg-[#111111] hover:border-white transition-colors"
            >
              [↗] email
            </a>
          </div>
        </div>
      </CommandBlock>
    </section>
  );
}
