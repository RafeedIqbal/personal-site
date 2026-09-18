import SectionHeader from "@/components/SectionHeader";
import { EXPERIENCE } from "@/lib/content";

export default function Experience() {
  return (
    <section
      id="experience"
      aria-labelledby="experience-title"
      className="portfolio-section"
    >
      <SectionHeader
        id="experience-title"
        command="cat experience.log"
        title="Experience"
        description="Hands-on engineering, product direction, and the operational work that connects them."
      />
      <div>
        {EXPERIENCE.map((experience) => (
          <article key={experience.company} className="experience-row">
            <div className="font-mono text-[11px] leading-relaxed text-muted">
              <p>{experience.date}</p>
              <p className="mt-2">{experience.location}</p>
            </div>
            <div>
              <p className="mb-2 text-sm text-muted">{experience.company}</p>
              <h3 className="max-w-[32ch] text-[23px] font-medium leading-snug tracking-[-0.025em]">
                {experience.role}
              </h3>
              <p className="my-5 border-l-2 border-accent/60 pl-3 font-mono text-xs leading-relaxed">
                {experience.impact}
              </p>
              <ul className="max-w-[75ch] space-y-3 text-base leading-[1.75] text-muted">
                {experience.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3">
                    <span aria-hidden="true" className="text-muted">
                      –
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
