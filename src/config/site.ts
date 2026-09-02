/**
 * Single source of truth for site-level identity.
 *
 * Metadata, structured data, the sitemap and the UI all read from here, so the
 * company name, contact address or domain is changed in exactly one place. The
 * reference build hardcoded these in dozens of spots, which is how it ended up
 * shipping with "Orionix" still in the title, the OG tags and the canonical URL.
 */

/**
 * Production origin. Set NEXT_PUBLIC_SITE_URL in the deployment environment —
 * canonical URLs, OG image resolution and the sitemap all derive from it, and a
 * wrong value here silently de-optimises search visibility.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const site = {
  name: "Greatest Solutions",
  shortName: "GST",
  tagline: "Software Development & Technology Services",
  description:
    "Greatest Solutions is a software development and technology services agency, building web platforms, products and digital systems for teams that need them to work.",
  /* Stored lower-case. The hero control uppercases it with `text-transform`,
     so the display casing is a style choice and the value stays copyable and
     mailto-safe. */
  email: "greatestsolutions@gmail.com",
  locale: "en",
  url: siteUrl,
} as const;

/**
 * Outbound links. Kept here rather than inline so the security policy for
 * external navigation (noopener/noreferrer) can be applied in one component
 * rather than remembered at every call site.
 */
export const socialLinks = [
  { label: "X", href: "https://x.com/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "Behance", href: "https://www.behance.net/" },
  { label: "Dribbble", href: "https://dribbble.com/" },
] as const;

export type SocialLink = (typeof socialLinks)[number];
