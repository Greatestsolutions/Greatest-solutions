import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { projects } from "@/data/works";
import { services } from "@/data/services";

/**
 * Sitemap.
 *
 * Only routes that actually exist are listed. The reference build links to
 * /contact, /works/*, /services/* and /blog/* — none of which are built — and
 * listing unbuilt routes here would report soft-404s to search engines. Add each
 * entry as its page ships.
 */
const routes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/works", changeFrequency: "monthly", priority: 0.9 },
  { path: "/services", changeFrequency: "monthly", priority: 0.9 },
  { path: "/solutions", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  // /privacy and /terms are deliberately absent: both are noindex until the real
  // text is published, and a sitemap entry contradicts that.
  ...projects.map((p) => ({ path: `/works/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ...services.map((s) => ({ path: `/services/${s.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${siteUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
