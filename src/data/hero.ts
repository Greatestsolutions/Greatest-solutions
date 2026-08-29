import type { ImageSource } from "@/types/media";

/**
 * Hero content.
 *
 * Copy lives in typed data rather than JSX so it can be edited — or later moved
 * behind a CMS — without touching component code. The headline is split into
 * lines because the design breaks it deliberately; it is not a wrapping artefact.
 */
export const hero = {
  /**
   * The headline as segments, so the editable keywords are data rather than JSX.
   *
   * Each line is a list of runs; a run with an `id` is an independently editable
   * keyword — it gets the selection highlight and, when activated, the formatting
   * toolbar. Its `id` also keys its formatting state, which is what keeps the two
   * keywords from sharing formatting.
   *
   * Adding or renaming a keyword is a data edit; `EditableHeadline` renders
   * whatever is here.
   */
  headline: [
    [{ text: "we build the " }, { text: "GREATEST SOLUTIONS", id: "greatest-solutions" }],
    [{ text: "for your " }, { text: "DIGITAL PROBLEMS", id: "digital-problems" }],
  ] as const satisfies readonly (readonly { text: string; id?: string }[])[],
  tagline: "Greatest Solutions: Complex digital challenges, solved.",
  timezone: "GMT-7",
  /** Kept beside the label so the running clock and the offset cannot disagree. */
  timezoneOffsetHours: -7,
  image: {
    /**
     * Two crops, art-directed rather than resized: the sculpture is a wide
     * horizontal subject, so a centre-crop of the landscape file loses both
     * curled ends on a phone. Each is offered in three formats — AVIF takes the
     * landscape crop from 234 KB to 35 KB, and this is the LCP element.
     */
    landscape: {
      avif: "/hero/hero-landscape.avif",
      webp: "/hero/hero-landscape.webp",
      fallback: "/hero/hero-landscape.jpg",
    } satisfies ImageSource,
    portrait: {
      avif: "/hero/hero-portrait.avif",
      webp: "/hero/hero-portrait.webp",
      fallback: "/hero/hero-portrait.jpg",
    } satisfies ImageSource,
    alt: "A green glass sculpture, curved like a wave, on a pale background",
  },
} as const;
