import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";

/**
 * Generated rather than a static public/robots.txt so the sitemap URL always
 * matches the deployed origin. A hardcoded file is exactly how the reference
 * build ended up pointing search engines at the wrong domain.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
