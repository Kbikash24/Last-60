import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Update when page content meaningfully changes.
const LAST_MODIFIED = "2026-10-27";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/game`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/leaderboard`,
      lastModified: LAST_MODIFIED,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];
}
