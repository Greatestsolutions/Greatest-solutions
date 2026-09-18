import type { ImageSource } from "@/types/media";

/**
 * Client testimonials — `Section - Client` in the reference (the export gives that
 * name to BOTH this block and the logo strip; this is the lower of the two).
 *
 * ## What used to be here
 *
 * This held three fabricated endorsements transcribed from the template
 * (Daniel Carter of NovaTech, Ethan Walker of Lumina Labs, Marcus Rivera of
 * Horizon Collective), removed for the same reason the fake clients and fake
 * pricing were: attributing invented praise to invented people is the least
 * defensible content a business site can ship. It was then replaced with
 * three literal placeholder slots ("Client quote goes here…" / "Client name" /
 * "Role · Company") specifically so the section's mechanics — the fan, the
 * carousel, the entrance animation — kept running without claiming a customer
 * who does not exist, on the understanding that real testimonials would
 * eventually replace them rather than get invented to fill the gap.
 *
 * ## What is here now
 *
 * Two real client reviews, both 5.0/5. Real testimonials, not photographs of
 * the clients who wrote them — no photo of either person exists in this
 * project, so nothing stands in for one; see `TestimonialCard` for how the
 * card replaces a portrait with the rating itself as its visual anchor.
 *
 * The first review is excerpted, not reproduced in full — the source is a
 * six-paragraph review, far past what a pull-quote card can hold, and the
 * hard rule for an excerpt is the same as everywhere else on this site:
 * whatever is quoted is quoted verbatim, nothing paraphrased or added. The
 * sentence below is a single unmodified sentence lifted from the middle of
 * that review, not a combination of fragments.
 *
 * Attribution is exactly as honest as the source: the first reviewer's name
 * was never given, only the project ("AITube"), so the card says that and
 * nothing more specific. The second reviewer gave neither a name nor a
 * project, so it is attributed as a verified client review — not a company,
 * not a role, because neither exists to attribute it to.
 */
export interface Testimonial {
  /** A verbatim quote or excerpt — never paraphrased, never combined from
   *  non-adjacent sentences. */
  quote: string;
  /** Whatever can honestly be said about who wrote it — a name, a project, or
   *  "Verified client" when neither exists. Never invented beyond the source. */
  attribution: string;
  /** Out of 5. Both reviews this data currently holds are a perfect score;
   *  the field is a number rather than a hardcoded "5.0" string so a future
   *  review with a different score needs no component change. */
  rating: number;
  /**
   * A small decorative accent on the card, not an avatar. Neither client
   * supplied a photo, and their real likeness is not something to simulate
   * — this is the same abstract emerald illustration set already used on the
   * hero, service cards and service detail pages, cycled per testimonial so
   * the two cards do not carry the same shape. Purely decorative: it renders
   * with an empty `alt` in `TestimonialCard`, the same convention every other
   * use of this artwork on the site already follows.
   */
  illustration: ImageSource;
}

const illustration = (name: string): ImageSource => ({
  avif: `/services/${name}.avif`,
  webp: `/services/${name}.webp`,
  fallback: `/services/${name}.png`,
});

export const testimonials: Testimonial[] = [
  {
    /* One sentence from the middle of a six-paragraph review of work on
       "AITube" (an AI video platform) — the full text describes prompt
       engineering, cinematic style and revision quality in more depth than a
       card can hold. This sentence was picked over the review's closing
       recommendation (also a strong standalone candidate — see the redo
       report) for reading as a complete, self-contained claim on its own. */
    quote:
      "He proved to be a highly skilled AI content creator with a strong combination of technical expertise and creative storytelling ability.",
    attribution: "Client, AITube",
    rating: 5.0,
    illustration: illustration("web-development"),
  },
  {
    /* Used in full — the entire review is already the length of a pull-quote,
       so there was nothing to excerpt. */
    quote: "Working with Muhammad was nice. Great communication, good ai work and matching deadlines. Thanks Muhammad.",
    attribution: "Verified client",
    rating: 5.0,
    illustration: illustration("digital-marketing"),
  },
];

/**
 * A small supporting line under the section heading — real aggregate data
 * (endorsement counts across every completed job on the review platform),
 * not a third invented voice. Deliberately just a sentence in the header's
 * existing `description` slot rather than a rendered count or a chart: the
 * two cards below are the actual evidence, this is one line of context
 * above them, and forcing the raw per-tag counts (Committed to Quality 6,
 * Reliable 6, Collaborative 5, …) into the heading would read as a bolted-on
 * stats widget competing with the real stats strip already under the cards.
 */
export const testimonialsSupportingLine = "Rated 5.0 across every completed project.";

/**
 * The stats strip under the cards. Unrelated to the testimonial content above
 * and out of scope for this rewrite — values, labels and layout all untouched.
 *
 * The reference's own copy of this row reads "0+ / 0% / 0+" and never counts
 * up — unconfigured template placeholders. These three values were filled in
 * at some point after that was first documented; whether they are the
 * business's real, confirmed figures or still provisional is a separate
 * question from the testimonials task this file was touched for, so it is
 * left exactly as found.
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
