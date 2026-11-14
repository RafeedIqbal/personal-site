import SectionHeader from "@/components/SectionHeader";
import Screenshot from "@/components/Screenshot";
import { SELECTED_WORK, type Project } from "@/lib/content";

function CaseDetails({
  project,
  includeImage = false,
  headingLevel = 4,
}: {
  project: Project;
  includeImage?: boolean;
  headingLevel?: 4 | 5;
}) {
  const DetailHeading = headingLevel === 5 ? "h5" : "h4";
  return (
    <details className="case-details">
      <summary>
        <span>
          Read case details<span className="sr-only"> for {project.name}</span>
        </span>
        <span className="details-marker" aria-hidden="true">+</span>
      </summary>
      <div className="space-y-6 pb-2 pt-4">
        {includeImage && <Screenshot image={project.image} />}
        {[
          { label: "The problem", text: project.problem },
          { label: "The approach", text: project.approach },
        ].map(({ label, text }) => (
          <div key={label}>
            <DetailHeading className="mb-2 text-sm font-medium">{label}</DetailHeading>
            <p className="max-w-[70ch] text-base leading-relaxed text-muted">
              {text}
            </p>
          </div>
        ))}
        <ul
          className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-xs leading-relaxed text-muted"
          aria-label="Focus and technologies"
        >
          {project.stack.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
    </details>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs">
      {project.websiteUrl && (
        <a
          href={project.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="small-link"
        >
          Visit website <span aria-hidden="true">↗</span>
          <span className="sr-only"> for {project.name} (opens in a new tab)</span>
        </a>
      )}
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="small-link"
        >
          View repository <span aria-hidden="true">↗</span>
          <span className="sr-only"> for {project.name} (opens in a new tab)</span>
        </a>
      )}
    </div>
  );
}

export default function Projects() {
  const featured = SELECTED_WORK.filter((project) => project.featured);
  const supporting = SELECTED_WORK.filter((project) => !project.featured);

  return (
    <section
      id="projects"
      aria-labelledby="projects-title"
      className="portfolio-section"
    >
      <SectionHeader
        id="projects-title"
        command="ls projects/"
        title="Selected work"
        description="Engineering, product direction, and the work behind each release."
        right={`${featured.length} featured / ${SELECTED_WORK.length} projects`}
      />
      <div>
        {featured.map((project) => (
          <article
            key={project.slug}
            id={`work-${project.slug}`}
            className="featured-project"
          >
            <div className="project-copy">
              <h3 className="text-[clamp(28px,3vw,34px)] font-medium leading-tight tracking-[-0.03em]">
                {project.name}
              </h3>
              <p className="mt-2 font-mono text-xs leading-relaxed text-muted">
                {project.category}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-fg">
                {project.contribution}
              </p>
              <p className="mt-3 max-w-[65ch] text-base leading-relaxed text-body">
                {project.summary ?? project.description}
              </p>
              <div className="project-outcome mt-6">
                <h4 className="mb-2 font-mono text-xs text-accent">Outcome</h4>
                <p className="max-w-[65ch] text-base leading-relaxed text-body">
                  {project.result}
                </p>
              </div>
              <ProjectLinks project={project} />
              <CaseDetails project={project} />
            </div>
            <div className="project-image">
              <Screenshot image={project.image} />
            </div>
          </article>
        ))}
      </div>
      <div className="mt-14 sm:mt-16">
        <h3 className="mb-6 text-xl font-medium tracking-[-0.02em]">More projects</h3>
        {supporting.map((project) => (
          <article
            key={project.slug}
            id={`work-${project.slug}`}
            className="supporting-project"
          >
            <div>
              <h4 className="text-2xl font-medium tracking-[-0.025em]">
                {project.name}
              </h4>
              <p className="mt-2 font-mono text-xs leading-relaxed text-muted">
                {project.category}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {project.contribution}
              </p>
            </div>
            <div className="min-w-0">
              <p className="max-w-[70ch] text-base leading-relaxed text-body">
                {project.result}
              </p>
              <ProjectLinks project={project} />
              <CaseDetails project={project} includeImage headingLevel={5} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
