import SectionHeader from "@/components/SectionHeader";
import Screenshot from "@/components/Screenshot";
import { SELECTED_WORK, type Project } from "@/lib/content";

function CaseDetails({ project }: { project: Project }) {
  return (
    <details className="case-details">
      <summary>
        Read case summary{" "}
        <span className="details-marker" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="space-y-5 pb-2 pt-5">
        {[
          { label: "The problem", text: project.problem },
          { label: "The approach", text: project.approach },
          { label: "The result", text: project.result },
        ].map(({ label, text }) => (
          <div key={label}>
            <h4 className="mb-2 text-sm font-medium">{label}</h4>
            <p className="text-base leading-relaxed text-muted">{text}</p>
          </div>
        ))}
      </div>
    </details>
  );
}

function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="mt-5 flex flex-wrap gap-5 font-mono text-xs">
      {project.websiteUrl && (
        <a
          href={project.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="small-link"
        >
          Visit website <span aria-hidden="true">↗</span>
          <span className="sr-only"> (opens in a new tab)</span>
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
          <span className="sr-only">
            {" "}
            for {project.name} (opens in a new tab)
          </span>
        </a>
      )}
    </div>
  );
}

export default function Projects() {
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
        description="Products I’ve built, teams I’ve helped grow, and systems I’ve worked on."
        right={`${SELECTED_WORK.length} projects`}
      />
      <div className="space-y-12">
        {SELECTED_WORK.filter((project) => project.featured).map((project) => (
          <article
            key={project.slug}
            id={`work-${project.slug}`}
            className="featured-project"
          >
            <div className="project-image">
              <Screenshot image={project.image} />
            </div>
            <div className="project-copy">
              <p className="mb-3 font-mono text-[11px] text-muted">
                {project.category}
              </p>
              <h3 className="text-[28px] font-medium tracking-[-0.035em]">
                {project.name}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {project.contribution}
              </p>
              <p className="mt-5 text-base leading-relaxed text-body">
                {project.summary ?? project.description}
              </p>
              <ul
                className="mt-5 flex flex-wrap gap-x-3 gap-y-2 font-mono text-[10px] text-muted"
                aria-label="Focus and technologies"
              >
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <ProjectLinks project={project} />
              <CaseDetails project={project} />
            </div>
          </article>
        ))}
      </div>
      <div className="mt-12 grid items-start gap-8 sm:grid-cols-2">
        {SELECTED_WORK.filter((project) => !project.featured).map((project) => (
          <article
            key={project.slug}
            id={`work-${project.slug}`}
            className="supporting-project"
          >
            <Screenshot image={project.image} compact />
            <p className="mt-6 font-mono text-[11px] text-muted">
              {project.category}
            </p>
            <h3 className="mt-2 text-2xl font-medium tracking-[-0.025em]">
              {project.name}
            </h3>
            <p className="mt-2 text-xs text-muted">{project.contribution}</p>
            <p className="mt-4 text-base leading-relaxed text-body">
              {project.result}
            </p>
            <p className="mt-4 font-mono text-[11px] leading-relaxed text-muted">
              {project.stack.join(" / ")}
            </p>
            <ProjectLinks project={project} />
            <CaseDetails project={project} />
          </article>
        ))}
      </div>
    </section>
  );
}
