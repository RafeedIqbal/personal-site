"use client";

import CommandBlock from "../components/CommandBlock";
import { PROJECTS } from "../lib/content";

export default function Projects() {
  return (
    <section id="projects" className="space-y-6 scroll-mt-16">
      <CommandBlock command="ls -la projects/" delay={0.05}>
        <div className="space-y-0">
          {/* Desktop: file listing table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <tbody>
                {PROJECTS.map((project) => (
                  <tr key={project.slug} className="align-top">
                    <td className="py-2.5 pr-4 text-[#444444] whitespace-nowrap text-xs">drwxr-xr-x</td>
                    <td className="py-2.5 pr-4 text-[#555555] text-xs">rafeed</td>
                    <td className="py-2.5 pr-4 text-[#444444] text-xs">4096</td>
                    <td className="py-2.5 pr-6 whitespace-nowrap align-top">
                      <span className="font-bold text-white">{project.name}/</span>
                      <div className="flex gap-2 flex-wrap mt-1">
                        {project.stack.map((s) => (
                          <span
                            key={s}
                            className="text-xs border border-[#333333] px-1.5 py-0.5 text-[#888888]"
                          >
                            [{s}]
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 text-[#aaaaaa] text-sm leading-relaxed">
                      <p>{project.description}</p>
                      {project.url && (
                        <a
                          href={project.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          [↗] {project.url}
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: project cards */}
          <div className="md:hidden space-y-4">
            {PROJECTS.map((project) => (
              <div
                key={project.slug}
                className="border border-[#333333] bg-[#0a0a0a] p-4 space-y-3"
              >
                <h3 className="font-bold text-white">./{project.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((s) => (
                    <span
                      key={s}
                      className="text-xs border border-[#555555] px-2 py-0.5 text-[#888888]"
                    >
                      [{s}]
                    </span>
                  ))}
                </div>
                <p className="text-sm text-[#aaaaaa] leading-relaxed">
                  {project.description}
                </p>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white hover:underline flex items-center gap-1"
                  >
                    [↗] view_project
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </CommandBlock>
    </section>
  );
}
