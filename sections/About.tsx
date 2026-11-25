import SectionHeader from "@/components/SectionHeader";
import { EDUCATION, PROFILE } from "@/lib/content";

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="portfolio-section"
    >
      <SectionHeader
        id="about-title"
        command="cat about.txt"
        title="A little background"
      />
      <div className="grid items-start gap-9 xl:grid-cols-[1.6fr_1fr] xl:gap-14">
        <div className="max-w-[64ch] space-y-4 text-base leading-[1.85] text-body">
          {PROFILE.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="border-l border-line pl-6">
          <p className="mb-3 font-mono text-xs text-muted">Education</p>
          <h3 className="text-xl font-medium tracking-[-0.02em]">
            {EDUCATION.school}
          </h3>
          <p className="mt-2 text-sm text-body">{EDUCATION.degree}</p>
          <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
            {EDUCATION.years}
            <br />
            {EDUCATION.location}
          </p>
        </div>
      </div>
    </section>
  );
}
