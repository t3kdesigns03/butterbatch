import type { MetadataRoute } from "next";
import { siteUrl } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: new URL("/", base).toString(), changeFrequency: "weekly", priority: 1 },
    { url: new URL("/privacy", base).toString(), changeFrequency: "yearly", priority: 0.2 },
  ];
}
