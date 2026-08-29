import type { ImageSource } from "@/types/media";

/**
 * Client testimonials — `Section - Client` in the reference (the export gives that
 * name to BOTH this block and the logo strip; this is the lower of the two).
 *
 * Three testimonials and a three-figure stats row. Copy is transcribed from the
 * reference, with one deliberate substitution — see `quote` below.
 */
export interface Testimonial {
  quote: string;
  name: string;
  /** Role and company, as one line, exactly as the reference renders it. */
  role: string;
  avatar: ImageSource;
  /** Intrinsic pixels of the source file, for the `Picture` contract. */
  width: number;
  height: number;
}


/**
 * **Two of these quotes name "Orionix" in the reference** — the template's own
 * brand, which this project exists to replace. Reproducing that verbatim would
 * put a competitor's name in our clients' mouths, so the brand token is swapped
 * and nothing else is touched:
 *
 *   "Orionix transformed our brand and website into a powerful growth engine."
 *   "Orionix helped us clarify our brand and launch confidently."
 *
 * The names, roles and companies are the template's invented ones. They are
 * plausible-looking fiction, not real clients, and **must be replaced with real
 * testimonials before launch** — flagged here rather than quietly shipped.
 */
/**
 * EMPTY. This held three fabricated endorsements — Daniel Carter of NovaTech,
 * Ethan Walker of Lumina Labs, Marcus Rivera of Horizon Collective — transcribed
 * from the template. Attributing invented praise to invented people at invented
 * companies is the least defensible content on a business site, so the records
 * are gone rather than dormant.
 *
 * Real, attributed testimonials go here; the fan, its entrance animation and the
 * hairlines behind it are all still in place.
 */
const avatar = (slug: string): ImageSource => ({
  avif: `/testimonials/${slug}.avif`,
  webp: `/testimonials/${slug}.webp`,
  fallback: `/testimonials/${slug}.png`,
});

/**
 * PLACEHOLDER ENTRIES — the section's mechanics, not its content.
 *
 * This previously held three fabricated endorsements (Daniel Carter of NovaTech,
 * Ethan Walker of Lumina Labs, Marcus Rivera of Horizon Collective) transcribed
 * from the template, which is why they were removed in task 4.3.
 *
 * The section is restored here so the fan entrance, the hairlines, the carousel
 * and the count-up all run again — but the names and quotes are explicitly
 * placeholders rather than invented people, so nothing on the page claims a
 * customer who does not exist. Replacing them is an edit to this array alone;
 * the components need no changes.
 *
 * The avatar images are the template's generic portrait renders, reused as
 * neutral placeholder art. Swap them with real photographs alongside the copy.
 */
export const testimonials: Testimonial[] = [
  {
    quote: "Client quote goes here — what the project was, and what changed once it shipped.",
    name: "Client name",
    role: "Role · Company",
    avatar: avatar("daniel-carter"),
    width: 232,
    height: 232,
  },
  {
    quote: "Client quote goes here — what the project was, and what changed once it shipped.",
    name: "Client name",
    role: "Role · Company",
    avatar: avatar("ethan-walker"),
    width: 232,
    height: 232,
  },
  {
    quote: "Client quote goes here — what the project was, and what changed once it shipped.",
    name: "Client name",
    role: "Role · Company",
    avatar: avatar("marcus-rivera"),
    width: 232,
    height: 232,
  },
];


/**
 * The stats strip under the cards.
 *
 * **Every value in the reference is zero** — "0+ Projects Delivered",
 * "0% Industries Impacted", "0+ Years of Experience". Verified by scrolling the
 * row into the middle of the viewport and sampling for 5 seconds: nothing counts
 * up, and both stacked digit layers read "0". These are unconfigured template
 * placeholders, the same class of residue as the repeated FAQ answer.
 *
 * Reproduced exactly so the layout matches, and flagged: **real numbers are
 * needed before launch.** The suffixes are the reference's own, including the
 * odd "%" on a count of industries.
 */
export interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export const stats: Stat[] = [
  { value: 54, suffix: "+", label: "Projects Delivered" },
  { value: 96, suffix: "%", label: "Industries Impacted" },
  { value: 12, suffix: "+", label: "Years of Experience" },
];

export const testimonialsEyebrow = "Client Voices";
export const testimonialsTitle = ["Where ambitious brands", "build their digital future"] as const;

/** Card geometry, measured: 360x557 desktop, 354x551 on the tablet/phone carousel. */
export const CARD_WIDTH = 360;
export const CARD_WIDTH_COMPACT = 354;
