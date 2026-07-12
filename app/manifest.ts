import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rafeed Iqbal — Portfolio",
    short_name: "Rafeed Iqbal",
    description:
      "Software Engineer & Product Leader. Building products at the intersection of code and strategy.",
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
