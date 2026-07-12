"use client";

import SectionHeader from "../components/SectionHeader";
import { SKILLS } from "../lib/content";

export default function Skills() {
  return (
    <section id="env" className="scroll-mt-[90px] pb-24 md:pb-[130px]">
      <SectionHeader index="05" command="env" delay={0.05}>
        <div className="flex flex-col gap-[13px]">
          {Object.entries(SKILLS).map(([key, value]) => (
            <div key={key} className="flex flex-wrap gap-0.5 text-[13px]">
              <span className="text-accent">{key}</span>
              <span className="text-subtle">=</span>
              <span className="text-[#d5d9dd]">&quot;{value}&quot;</span>
            </div>
          ))}
        </div>
      </SectionHeader>
    </section>
  );
}
