"use client";

import CommandBlock from "../components/CommandBlock";
import { WEBSITES } from "../lib/content";

export default function Websites() {
  return (
    <section id="websites" className="space-y-6 scroll-mt-16">
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
                      <a
                        href={website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold text-white hover:underline"
                      >
                        {website.name}
                      </a>
                    </td>
                    <td className="py-2.5 text-xs">
                      <a
                        href={website.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#888888] hover:text-white hover:underline"
                      >
                        [github]
                      </a>
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
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block font-bold text-white hover:underline"
                >
                  ./{website.name}
                </a>
                <a
                  href={website.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex text-xs text-[#888888] hover:text-white hover:underline"
                >
                  [github] view_repo
                </a>
              </div>
            ))}
          </div>
        </div>
      </CommandBlock>
    </section>
  );
}
