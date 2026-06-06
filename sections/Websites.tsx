"use client";

import CommandBlock from "../components/CommandBlock";
import { WEBSITES } from "../lib/content";

export default function Websites() {
  return (
    <section id="websites" className="space-y-6 scroll-mt-16">
      <CommandBlock command="ls -la websites/" delay={0.05} as="h2">
        <div className="space-y-0">
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm text-left">
              <caption className="sr-only">Deployed websites</caption>
              <thead className="sr-only">
                <tr>
                  <th scope="col">Permissions</th>
                  <th scope="col">Owner</th>
                  <th scope="col">URL length</th>
                  <th scope="col">Website</th>
                  <th scope="col">Stack</th>
                </tr>
              </thead>
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
                    <td className="py-2.5 text-xs whitespace-nowrap">
                      {website.stack.split(", ").map((tech) => (
                        <span key={tech} className="mr-2 text-[#888888]">
                          [{tech}]
                        </span>
                      ))}
                      <span className="text-[#666666]">[{website.type}]</span>
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
                <p className="text-xs">
                  {website.stack.split(", ").map((tech) => (
                    <span key={tech} className="mr-1.5 text-[#888888]">
                      [{tech}]
                    </span>
                  ))}
                  <span className="text-[#666666]">[{website.type}]</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </CommandBlock>
    </section>
  );
}
