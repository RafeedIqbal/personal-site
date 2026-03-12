"use client";

import CommandBlock from "../components/CommandBlock";
import { EXPERIENCE } from "../lib/content";

export default function Experience() {
  return (
    <section id="experience" className="space-y-6 scroll-mt-16">
      <CommandBlock command="cat experience.log" delay={0.05}>
        <div className="space-y-8 text-sm">
          {EXPERIENCE.map((exp, i) => (
            <div key={i} className="flex flex-col md:flex-row md:gap-6 gap-1">
              <div className="md:min-w-[180px] text-[#555555] text-xs pt-0.5 shrink-0">
                [{exp.date}]
              </div>
              <div className="space-y-2 flex-1">
                <div>
                  <span className="font-bold text-white">{exp.role}</span>
                  <span className="text-[#888888]"> @ {exp.company}</span>
                </div>
                <p className="text-[#555555] text-xs">{exp.location}</p>
                <ul className="space-y-1">
                  {exp.bullets.map((b, j) => (
                    <li key={j} className="text-[#aaaaaa] flex gap-2">
                      <span className="text-[#444444] mt-0.5 shrink-0">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </CommandBlock>
    </section>
  );
}
