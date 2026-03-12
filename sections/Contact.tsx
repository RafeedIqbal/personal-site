"use client";

import CommandBlock from "../components/CommandBlock";
import { PROFILE } from "../lib/content";

export default function Contact() {
  return (
    <section id="contact" className="space-y-6 scroll-mt-16">
      <CommandBlock command="contact --help" delay={0.05}>
        <div className="border-l-2 border-[#333333] pl-4 text-sm space-y-4">
          <p className="text-[#888888]">Usage: contact [OPTIONS]</p>
          <div className="space-y-2">
            <p className="text-[#666666] text-xs uppercase tracking-widest">Options</p>
            <div className="grid grid-cols-[110px_1fr] gap-y-2 gap-x-3">
              <span className="text-[#888888]">--email</span>
              <a
                href={`mailto:${PROFILE.email}`}
                className="text-white hover:underline"
              >
                {PROFILE.email}
              </a>
              <span className="text-[#888888]">--linkedin</span>
              <a
                href={PROFILE.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                {PROFILE.linkedin}
              </a>
              <span className="text-[#888888]">--github</span>
              <a
                href={PROFILE.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                {PROFILE.github}
              </a>
              <span className="text-[#888888]">--phone</span>
              <span className="text-white">{PROFILE.phone}</span>
            </div>
          </div>
          <p className="text-[#444444] text-xs pt-2">
            # open to SWE & PM roles — remote or hybrid
          </p>
        </div>
      </CommandBlock>
    </section>
  );
}
