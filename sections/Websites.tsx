import SectionHeader from "@/components/SectionHeader";
import Screenshot from "@/components/Screenshot";
import { WEBSITES } from "@/lib/content";

export default function Websites() {
  return (
    <section
      id="websites"
      aria-labelledby="websites-title"
      className="portfolio-section"
    >
      <SectionHeader
        id="websites-title"
        command="ls websites/"
        title="Out on the web"
        description="A closer look at the storefronts, product sites, and brand experiences I’ve built."
        right={`${WEBSITES.length} websites`}
      />
      <div className="grid gap-x-7 gap-y-10 sm:grid-cols-2">
        {WEBSITES.map((website) => (
          <article key={website.slug} className="min-w-0">
            <Screenshot image={website.image} compact />
            <div className="mt-5 flex items-start justify-between gap-3">
              <h3 className="min-w-0 break-words text-lg font-medium tracking-[-0.025em]">
                <a
                  href={website.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="small-link"
                >
                  {website.name}
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </h3>
              <span aria-hidden="true" className="text-muted">
                ↗
              </span>
            </div>
            <p className="mt-2 text-base leading-relaxed text-muted">
              {website.description}
            </p>
            <p className="mt-3 font-mono text-[10px] text-muted">
              {website.stack}{" "}
              <span aria-hidden="true" className="mx-1">
                /
              </span>{" "}
              {website.type}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
