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

export interface SocialLink {
  /** Matches a key in `SocialIcon`. */
  key: string;
  label: string;
  href: string;
  /** No real account yet: rendered as a non-interactive label, not a link. */
  pending?: boolean;
}

/**
 * The real accounts. Kept here — the site's single source of truth for
 * identity — rather than inline or duplicated per component, so a link only
 * ever needs to change in one place. Previously lived as a second, unused
 * copy here (still pointing at platform roots) alongside `Footer`'s own
 * hardcoded, `pending`-flagged array; the two have been merged into this one.
 */
export const socialLinks: SocialLink[] = [
  { key: "instagram", label: "Instagram", href: "https://www.instagram.com/greatestsolutions/" },
  { key: "facebook", label: "Facebook", href: "https://www.facebook.com/profile.php?id=61592415582377" },
  { key: "x", label: "X (Twitter)", href: "https://x.com/G_Solutions_" },
  { key: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/in/greatest-solutions/" },
];
