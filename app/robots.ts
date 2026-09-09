import type { MetadataRoute } from "next";
import { PROFILE } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${PROFILE.siteUrl}/sitemap.xml`,
    host: PROFILE.siteUrl,
  };
}
