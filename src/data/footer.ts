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

export const footerCopyright = "Copyright © 2026 Greatest Solutions";
