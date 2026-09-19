import { PROFILE } from "@/lib/content";

export default function Hero() {
  return (
    <section id="whoami" aria-labelledby="hero-title" className="hero-section">
      <div className="mb-7 flex items-center gap-2.5 font-mono text-xs text-muted">
        <span aria-hidden="true" className="text-accent">
          $
        </span>
        whoami
        <span aria-hidden="true" className="h-3.5 w-1.5 bg-muted/60" />
      </div>
      <div className="grid items-end gap-10 xl:grid-cols-[minmax(0,1fr)_230px] xl:gap-12">
        <div>
          <h1
            id="hero-title"
            className="text-[clamp(46px,6.5vw,82px)] font-semibold leading-[0.98] tracking-[-0.055em]"
          >
            {PROFILE.name}
            <span className="text-muted">.</span>
          </h1>
          <p className="mt-5 text-[clamp(18px,2vw,23px)] font-medium tracking-[-0.025em]">
            Software engineer <span className="text-muted">&</span> product
            leader
          </p>
          <p className="mt-5 max-w-[50ch] text-base leading-[1.8] text-muted sm:text-[17px]">
            {PROFILE.heroParagraph}
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
            className="mt-6 inline-block max-w-full break-all font-mono text-xs text-muted underline decoration-line underline-offset-4 hover:text-fg"
          >
            {PROFILE.email}
          </a>
        </div>
        <div className="current-work">
          <div>
            <p className="mb-3 font-mono text-[11px] text-muted">
              Currently building
            </p>
            <a href="#work-basenote" className="current-work-link">
              <span>BaseNote</span>
              <span className="mt-1 block text-xs text-muted">
                Founding Engineer
              </span>
            </a>
          </div>
          <div className="xl:mt-6">
            <p className="mb-3 font-mono text-[11px] text-muted">
              Previously
            </p>
            <a href="#work-icon" className="current-work-link">
              <span>Icon Training</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                Head of Product and Engineering
              </span>
            </a>
          </div>
          <div className="work-availability mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
            <span className="mb-1 flex items-center gap-2 text-fg">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-accent"
              />
              Open to opportunities
            </span>
            {PROFILE.workPreference}
          </div>
        </div>
      </div>
    </section>
  );
}
