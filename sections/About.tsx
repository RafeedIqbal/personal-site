"use client";

import SectionHeader from "../components/SectionHeader";
import { EDUCATION } from "../lib/content";

export default function About() {
  return (
    <section id="about" className="scroll-mt-[90px] pb-24 md:pb-[130px]">
      <SectionHeader index="01" command="cat about.txt" delay={0.05}>
        <div className="grid items-start gap-10 md:grid-cols-[1.6fr_1fr] md:gap-14">
          <p className="text-[15px] leading-[1.95] text-body">
            Software engineer and product leader building consumer applications from 0 to 1. I run
            product and engineering for an AI-powered fitness app, and I&apos;m the sole engineer
            behind a SaaS ERP platform for perfumers — shipping RAG-based AI assistants, production
            systems, and the storefronts around them.
          </p>

          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-accent">education</span>
            <span className="font-grotesk text-lg font-semibold text-white">{EDUCATION.school}</span>
            <span className="text-[13px] text-muted">{EDUCATION.degree}</span>
            <span className="text-xs text-subtle">
              {EDUCATION.years} · {EDUCATION.location}
            </span>
          </div>
        </div>
      </SectionHeader>
    </section>
  );
}
