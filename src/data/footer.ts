/**
 * Footer + CTA content. In the reference this block sits **outside** `Main`, as a
 * sibling of the page body, and the CTA is the top half of it rather than a
 * section of its own.
 *
 * Two pieces of reference copy are deliberately not carried over:
 *
 *   "Powered by Framer"  — untrue of this build, and it advertises the tool we
 *                          spent the project removing.
 *   "Designed by LoganCee Studio" — the template author's credit, not GST's.
 *
 * Everything else is transcribed. The giant wordmark reads "orionix" in the
 * reference; it becomes the GST name here, like every other brand string.
 */
export interface SocialLink {
  /** Matches a key in `SocialIcon`. */
  key: string;
  label: string;
  href: string;
  /** No real account yet: rendered as a non-interactive label, not a link. */
  pending?: boolean;
}

/**
 * PENDING REAL ACCOUNTS.
 *
 * These previously pointed at platform roots (x.com, linkedin.com) after the
 * template author's own account was removed. A link to a network's front page is
 * not a Greatest Solutions profile — it just looks like one — so the row now
 * renders as plain labels until real handles exist. Supplying an `href` and
 * dropping `pending` turns each one back into a link.
 */
export const socialLinks: SocialLink[] = [
  { key: "x", label: "X (Twitter)", href: "", pending: true },
  { key: "linkedin", label: "LinkedIn", href: "", pending: true },
  { key: "behance", label: "Behance", href: "", pending: true },
  { key: "dribbble", label: "Dribbble", href: "", pending: true },
];

export const footerCta = {
  eyebrow: "Problem → Production",
  /** Broken exactly where the reference breaks it, from tablet up. */
  title: ["Got something", "you need built?"] as const,
  action: { label: "Book a call", href: "/contact" },
} as const;

/** The CTA video: autoplay, muted, looping — measured on the reference. */
export const footerVideo = {
  src: "/video/cta.mp4",
  width: 691,
  height: 481,
} as const;

export const footerCopyright = "© 2026 Copyright — Greatest Solutions";
