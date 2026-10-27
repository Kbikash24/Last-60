import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LAST 60 — One Minute. One Life. One More Run.",
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/game",
    display: "standalone",
    orientation: "any",
    background_color: "#050a18",
    theme_color: "#050a18",
    categories: ["games", "entertainment"],
  };
}
