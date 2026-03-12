"use client";

import CommandBlock from "../components/CommandBlock";
import { EDUCATION } from "../lib/content";

export default function About() {
  return (
    <section id="about" className="space-y-6 scroll-mt-16">
      <CommandBlock command="cat about.txt" delay={0.05}>
        <div className="border-l-2 border-[#333333] pl-4 space-y-5 text-sm">
          <p className="leading-relaxed text-[#cccccc]">
            Software engineer and product manager with hands-on experience building consumer-facing
            applications from 0 to 1. I bridge the gap between technical execution and product
            strategy — having led development teams, shipped production systems, and driven
            data-informed process improvements.
          </p>

          <div className="space-y-1">
            <p className="text-[#555555] uppercase text-xs tracking-widest">Education</p>
            <p className="text-white font-bold">{EDUCATION.school}</p>
            <p className="text-[#aaaaaa]">{EDUCATION.degree}</p>
            <p className="text-[#666666]">
              GPA: {EDUCATION.gpa} &nbsp;·&nbsp; {EDUCATION.years} &nbsp;·&nbsp; {EDUCATION.location}
            </p>
          </div>
        </div>
      </CommandBlock>
    </section>
  );
}
