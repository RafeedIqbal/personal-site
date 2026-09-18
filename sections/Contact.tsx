import SectionHeader from "@/components/SectionHeader";
import CopyEmail from "@/components/CopyEmail";
import { PROFILE } from "@/lib/content";

export default function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="portfolio-section contact-section"
    >
      <SectionHeader
        id="contact-title"
        command="contact --help"
        title="Let’s talk about what’s next."
      />
      <p className="max-w-[52ch] text-base leading-relaxed text-muted">
        I’m open to software engineering and product roles, remote or hybrid. If
        my work fits what your team needs, email is the best place to start.
      </p>
      <a
        href={`mailto:${PROFILE.email}`}
        className="mt-6 inline-block max-w-full break-all text-[clamp(18px,2.8vw,30px)] font-medium tracking-[-0.035em] underline decoration-line underline-offset-8 hover:decoration-muted"
      >
        {PROFILE.email}
      </a>
      <div className="mt-8 flex flex-wrap items-start gap-3">
        <a href={`mailto:${PROFILE.email}`} className="button-primary">
          Send an email <span aria-hidden="true">↗</span>
        </a>
        <CopyEmail />
      </div>
      <div className="mt-6 flex flex-wrap gap-6 font-mono text-xs text-muted">
        <a
          href={PROFILE.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="small-link"
        >
          LinkedIn <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a
          href={PROFILE.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="small-link"
        >
          GitHub <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a href={PROFILE.resumeUrl} download className="small-link">
          Download résumé <span aria-hidden="true">↓</span>
          <span className="sr-only"> (PDF)</span>
        </a>
      </div>
    </section>
  );
}
