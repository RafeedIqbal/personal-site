import type { MetadataRoute } from "next";
import { PROFILE } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${PROFILE.siteUrl}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
