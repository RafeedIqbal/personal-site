"use client";

import CommandBlock from "../components/CommandBlock";
import { SKILLS } from "../lib/content";

export default function Skills() {
  return (
    <section id="env" className="space-y-6 scroll-mt-16">
      <CommandBlock command="env" delay={0.05}>
        <div className="border-l-2 border-[#333333] pl-4 space-y-2 text-sm font-mono">
          {Object.entries(SKILLS).map(([key, value]) => (
            <div key={key} className="flex flex-wrap gap-1">
              <span className="text-[#888888]">{key}</span>
              <span className="text-[#555555]">=</span>
              <span className="text-white">&quot;{value}&quot;</span>
            </div>
          ))}
        </div>
      </CommandBlock>
    </section>
  );
}
