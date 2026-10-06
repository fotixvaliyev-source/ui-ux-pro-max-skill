import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const PAGES = [
  { path: "", priority: 1 },
  { path: "/features", priority: 0.8 },
  { path: "/how-it-works", priority: 0.8 },
  { path: "/about", priority: 0.6 },
  { path: "/privacy", priority: 0.4 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({ url: `${SITE_URL}${p.path}`, changeFrequency: "monthly", priority: p.priority }));
}
