"use client";

import CommandBlock from "../components/CommandBlock";
import { WEBSITES } from "../lib/content";

export default function Websites() {
  return (
    <section id="websites" className="section-panel space-y-6 scroll-mt-16">
      <CommandBlock command="ls -la websites/" delay={0.05}>
        <div className="space-y-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <tbody>
                {WEBSITES.map((website) => (
                  <tr key={website.slug} className="align-top">
                    <td className="py-2.5 pr-4 text-[#444444] whitespace-nowrap text-xs">
                      lrwxrwxrwx
                    </td>
                    <td className="py-2.5 pr-4 text-[#555555] text-xs">rafeed</td>
                    <td className="py-2.5 pr-4 text-[#444444] text-xs">{website.url.length}</td>
                    <td className="py-2.5 pr-6 whitespace-nowrap align-top">
                      <span className="font-bold text-white">{website.name}</span>
                    </td>
                    <td className="py-2.5 text-[#aaaaaa] text-sm leading-relaxed break-all">
                      <div className="flex flex-col gap-1">
                        <a
                          href={website.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white hover:underline"
                        >
                          [↗] {website.url}
                        </a>
                        <a
                          href={website.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#888888] hover:text-white hover:underline"
                        >
                          [github] {website.githubUrl}
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {WEBSITES.map((website) => (
              <div
                key={website.slug}
                className="border border-[#333333] bg-[#0a0a0a] p-4 space-y-3"
              >
                <h3 className="font-bold text-white">./{website.name}</h3>
                <div className="flex flex-col gap-2 text-xs">
                  <a
                    href={website.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:underline flex items-center gap-1 break-all"
                  >
                    [↗] visit_site
                  </a>
                  <a
                    href={website.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#aaaaaa] hover:text-white hover:underline flex items-center gap-1 break-all"
                  >
                    [github] view_repo
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CommandBlock>
    </section>
  );
}
