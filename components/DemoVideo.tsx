import type { PortfolioVideo } from "@/lib/content";

// Native controls, so it plays without JavaScript; only the poster loads with the page.
export default function DemoVideo({ video }: { video: PortfolioVideo }) {
  return (
    <figure className="demo-figure">
      <video
        controls
        preload="none"
        playsInline
        poster={video.poster}
        width={video.width}
        height={video.height}
        className="demo-video"
      >
        <source src={video.src} type="video/mp4" />
        <track
          kind="captions"
          src={video.captions}
          srcLang="en"
          label="English"
          default
        />
        <a href={video.src}>Download the {video.label} (MP4)</a>
      </video>
      <figcaption className="screenshot-caption">
        <span>{video.label}</span>
        <span>
          <span className="sr-only">Length </span>
          {video.duration}
        </span>
      </figcaption>
    </figure>
  );
}
