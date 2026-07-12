"use client";

import SectionHeader from "../components/SectionHeader";
import { EXPERIENCE } from "../lib/content";

export default function Experience() {
  return (
    <section id="experience" className="scroll-mt-[90px] pb-24 md:pb-[130px]">
      <SectionHeader index="02" command="cat experience.log" delay={0.05}>
        <div className="flex flex-col">
          {EXPERIENCE.map((exp, i) => (
            <article
              key={i}
              className="grid gap-3 border-b border-white/5 py-8 first:pt-0 last:border-b-0 md:grid-cols-[180px_1fr] md:gap-10 md:py-[38px]"
            >
              <div className="flex flex-col gap-1.5 md:pt-1">
                <span className="text-xs text-muted">{exp.date}</span>
                <span className="text-[11.5px] text-subtle">{exp.location}</span>
              </div>
              <div className="flex flex-col gap-3.5">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h3 className="font-grotesk text-[21px] font-semibold tracking-[-0.01em] text-white">
                    {exp.role}
                  </h3>
                  <span className="text-[13px] text-accent">@ {exp.company}</span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {exp.bullets.map((b, j) => (
                    <li key={j} className="flex gap-3 text-[13.5px] leading-[1.75] text-body-2">
                      <span className="shrink-0 text-faint">–</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </SectionHeader>
    </section>
  );
}
