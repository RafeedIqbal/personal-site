"use client";

import SectionHeader from "../components/SectionHeader";
import { WEBSITES } from "../lib/content";

export default function Websites() {
  return (
    <section id="websites" aria-labelledby="section-04-title" className="scroll-mt-[110px] pb-24 md:pb-[130px]">
      <SectionHeader
        index="04"
        command="ls -la websites/"
        title="Websites"
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
        <div className="grid gap-x-8 gap-y-[22px] sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 xl:gap-x-12">
          {WEBSITES.map((website) => (
            <a
              key={website.slug}
              href={website.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${website.name} (opens in a new tab)`}
              className="flex min-w-0 items-center justify-between gap-3 py-2 transition-colors hover:text-accent"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="break-words text-[13px] text-white">{website.name}</span>
                <span className="text-[11px] text-subtle">
                  {website.stack.toLowerCase()} · {website.type}
                </span>
              </span>
              <span aria-hidden="true" className="shrink-0 text-[13px] text-accent">↗</span>
            </a>
          ))}
        </div>
      </SectionHeader>
    </section>
  );
}
