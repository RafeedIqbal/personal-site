import type { MetadataRoute } from "next";
import { PROFILE } from "@/lib/content";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${PROFILE.name} — Portfolio`,
    short_name: PROFILE.name,
    description: `${PROFILE.title}. ${PROFILE.tagline}`,
    start_url: "/",
    display: "standalone",
    background_color: "#060607",
    theme_color: "#060607",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
