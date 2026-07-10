"use client";

import CommandBlock from "../components/CommandBlock";
import { EDUCATION } from "../lib/content";

export default function About() {
  return (
    <section id="about" className="space-y-6 scroll-mt-16">
      <CommandBlock command="cat about.txt" delay={0.05} as="h2">
        <div className="border-l-2 border-[#333333] pl-4 space-y-5 text-sm">
          <p className="leading-relaxed text-[#cccccc]">
            Software engineer and product leader building consumer applications from 0 to 1. I run
            product and engineering for an AI-powered fitness app, and I&apos;m the sole engineer
            behind a SaaS ERP platform for perfumers — shipping RAG-based AI assistants, production
            systems, and the storefronts around them.
          </p>

          <div className="space-y-1">
            <p className="text-[#555555] uppercase text-xs tracking-widest">Education</p>
            <p className="text-white font-bold">{EDUCATION.school}</p>
            <p className="text-[#aaaaaa]">{EDUCATION.degree}</p>
            <p className="text-[#666666]">
              {EDUCATION.years} &nbsp;·&nbsp; {EDUCATION.location}
            </p>
          </div>
        </div>
      </CommandBlock>
    </section>
  );
}
