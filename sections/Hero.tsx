import { PROFILE } from "@/lib/content";

export default function Hero() {
  return (
    <section id="whoami" aria-labelledby="hero-title" className="hero-section">
      <h1
        id="hero-title"
        className="text-[clamp(46px,6.5vw,82px)] font-semibold leading-[1.02] tracking-[-0.04em]"
      >
        {PROFILE.name}<span className="text-muted">.</span>
      </h1>
      <p className="mt-5 text-[clamp(18px,2vw,23px)] font-medium tracking-[-0.025em]">
        Software engineer <span className="text-muted">&</span> product leader
      </p>
      <p className="mt-6 max-w-[62ch] text-base leading-[1.8] text-muted sm:text-[17px]">
        {PROFILE.heroParagraph}
      </p>
      <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs leading-relaxed text-muted">
        <span className="flex items-center gap-2 text-fg">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-accent" />
          Open to opportunities
          <span className="sr-only">.</span>
        </span>
        <span>{PROFILE.workPreference}</span>
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a href="#projects" className="button-primary">
          View selected work <span aria-hidden="true">↓</span>
        </a>
        <a href={PROFILE.resumeUrl} download className="button-secondary">
          Download résumé<span className="sr-only"> (PDF)</span>
        </a>
      </div>
      <a
        href={`mailto:${PROFILE.email}`}
        className="hero-email mt-4 max-w-full break-all font-mono text-xs text-muted underline decoration-line underline-offset-4 hover:text-fg"
      >
        {PROFILE.email}
      </a>
    </section>
  );
}
