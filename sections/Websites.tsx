"use client";

import SectionHeader from "../components/SectionHeader";
import { WEBSITES } from "../lib/content";

export default function Websites() {
  return (
    <section id="websites" className="scroll-mt-[90px] pb-24 md:pb-[130px]">
      <SectionHeader
        index="04"
        command="ls -la websites/"
        delay={0.05}
        right={
          <span className="text-[11.5px] text-subtle">
            {/* Single expression on purpose: SWC drops the space between an
                interpolation and a following text chunk that contains an
                HTML entity ("6sites"). */}
            {`${WEBSITES.length} sites shipped & live`}
          </span>
        }
      >
        <div className="grid gap-x-12 gap-y-[22px] md:grid-cols-3">
          {WEBSITES.map((website) => (
            <a
              key={website.slug}
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 py-1 transition-opacity hover:opacity-75"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-[13px] text-white">{website.name}</span>
                <span className="text-[11px] text-subtle">
                  {website.stack.toLowerCase()} · {website.type}
                </span>
              </span>
              <span className="shrink-0 text-[13px] text-accent">↗</span>
            </a>
          ))}
        </div>
      </SectionHeader>
    </section>
  );
}
