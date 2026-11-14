import SectionHeader from "@/components/SectionHeader";
import { CAPABILITIES } from "@/lib/content";

export default function Skills() {
  return (
    <section
      id="env"
      aria-labelledby="skills-title"
      className="portfolio-section"
    >
      <SectionHeader
        id="skills-title"
        command="env"
        title="What I bring to a team"
      />
      <div className="grid gap-x-10 sm:grid-cols-2">
        {CAPABILITIES.map((capability) => (
          <article key={capability.title} className="border-t border-line py-7">
            <h3 className="text-xl font-medium tracking-[-0.025em]">
              {capability.title}
            </h3>
            <p className="mt-3 text-base leading-relaxed text-muted">
              {capability.description}
            </p>
            <p className="mt-4 font-mono text-xs leading-6 text-body">
              {capability.tools}
            </p>
            <a
              href={capability.href}
              className="mt-4 inline-flex min-h-11 items-center text-sm leading-relaxed text-muted underline decoration-line underline-offset-4 hover:text-fg"
            >
              {capability.evidence}
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
