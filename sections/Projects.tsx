"use client";

import SectionHeader from "../components/SectionHeader";
import { PROJECTS } from "../lib/content";

export default function Projects() {
  return (
    <section id="projects" className="scroll-mt-[90px] pb-24 md:pb-[130px]">
      <SectionHeader index="03" command="ls -la projects/" delay={0.05}>
        <div className="grid items-stretch gap-10 md:grid-cols-3 md:gap-12">
          {PROJECTS.map((project) => (
            <div key={project.slug} className="flex flex-col">
              <h3 className="text-base font-bold text-white">
                <span className="text-accent">./</span>
                {project.name}
              </h3>
              <p className="mt-3.5 text-[12.5px] leading-[1.75] text-muted">
                {project.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {project.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded border border-white/10 px-2 py-[3px] text-[10.5px] text-[#8a9096]"
                  >
                    {s}
                  </span>
                ))}
              </div>
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto pt-4 text-xs text-accent hover:underline"
                >
                  view repo ↗
                </a>
              )}
            </div>
          ))}
        </div>
      </SectionHeader>
    </section>
  );
}
