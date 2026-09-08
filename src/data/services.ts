import type { ImageSource } from "@/types/media";

/**
 * The service catalogue, in the order the carousel reveals them.
 *
 * These are the ten services the business actually offers. Titles and
 * descriptions are transcribed from the service reference document — the
 * description is each service's `tagline` there, verbatim — so the wording a
 * visitor reads here is the wording the business chose, not a paraphrase.
 *
 * This replaced a placeholder catalogue of five generic software disciplines
 * and five `-2` duplicates of them, which existed only to exercise the layout
 * at ten items before the real list arrived. Nothing downstream needed changing
 * when they were swapped out: the dial numbers (01–10) come from array position,
 * `Services.tsx` passes `services.length` to the scroller, and the navbar
 * dropdown, contact `<select>`, sitemap and `/services/[slug]` params are all
 * generated from this array.
 *
 * Tags are derived from each service's own build description and tooling in the
 * reference rather than invented — three short capability labels, the same shape
 * the placeholder set used.
 *
 * Illustrations are the reference build's 1360px greyscale renders, served from
 * `/services` — see `scripts/build-image-assets.mjs`. There are five and ten
 * services, so they cycle. They are abstract forms carrying no information the
 * copy does not already give, so they render with an empty `alt`. The brand
 * colour is NOT in the asset: it comes from the `#gst-emerald` luminance ramp
 * applied at render time, which is why a reused render needs no new artwork.
 */
export interface Service {
  /** Route under /services, and the value the contact form submits. */
  slug: string;
  title: string;
  description: string;
  /** Short capability labels. Rendered in order, wrapping when the column is narrow. */
  tags: string[];
  illustration: ImageSource;
}

const illustration = (name: string): ImageSource => ({
  avif: `/services/${name}.avif`,
  webp: `/services/${name}.webp`,
  fallback: `/services/${name}.png`,
});

export const services: Service[] = [
  {
    slug: "ai-voice-agents",
    title: "AI Voice Agents",
    description:
      "24/7 customer communication, scripted by your team and supervised by an Account Manager.",
    tags: ["Voice AI", "Call Handling", "CRM Integration"],
    illustration: illustration("web-development"),
  },
  {
    slug: "vertical-automation",
    title: "Vertical Automation",
    description:
      "Industry-specific automation systems built around how your business actually runs.",
    tags: ["Workflow Design", "Integrations", "Reporting"],
    illustration: illustration("digital-marketing"),
  },
  {
    slug: "ai-lead-generation",
    title: "AI Lead Generation",
    description:
      "Every lead followed up in minutes, not days — managed by a real growth team.",
    tags: ["Multi-channel", "Follow-up", "CRM"],
    illustration: illustration("social-content"),
  },
  {
    slug: "ai-content-social",
    title: "AI Content & Social",
    description:
      "Consistent, on-brand content across every platform — directed by a real content team.",
    tags: ["Content Calendar", "Social", "Human Review"],
    illustration: illustration("product-design"),
  },
  {
    slug: "ai-video-ugc",
    title: "AI Video / UGC",
    description:
      "Scroll-stopping video, directed by real creative producers, produced at AI-assisted speed.",
    tags: ["Short-form Video", "Scripting", "Editing"],
    illustration: illustration("brand-identity"),
  },
  {
    slug: "ai-copy-sales-pages",
    title: "AI Copy & Sales Pages",
    description:
      "Conversion-focused copy, written by real copywriters and stress-tested with AI iteration.",
    tags: ["Copywriting", "Landing Pages", "Conversion"],
    illustration: illustration("web-development"),
  },
  {
    slug: "ai-seo-content",
    title: "AI SEO Content",
    description:
      "Search-optimized content built on real keyword strategy, produced at scale with human review.",
    tags: ["Keyword Strategy", "Editorial", "Publishing Cadence"],
    illustration: illustration("digital-marketing"),
  },
  {
    slug: "ai-websites",
    title: "AI Websites",
    description:
      "Fast, professional websites — designed by a real team and built with AI-accelerated development.",
    tags: ["Web Design", "Responsive Build", "UX & QA"],
    illustration: illustration("social-content"),
  },
  {
    slug: "ai-email-brand",
    title: "AI Email & Brand",
    description:
      "Email systems and brand messaging that actually sound like you.",
    tags: ["Email Sequences", "Brand Voice", "Lifecycle"],
    illustration: illustration("product-design"),
  },
  {
    slug: "pitch-decks",
    title: "Pitch Decks",
    description:
      "Investor- and client-ready decks, strategized by real deck specialists.",
    tags: ["Narrative", "Deck Design", "Investor Ready"],
    illustration: illustration("brand-identity"),
  },
];

export const servicesLabel = "Services";

/**
 * Dial geometry, measured from the reference (SERVICES-SECTION.md §3).
 *
 * The ring is 800px across at every breakpoint; only its anchor moves. Markers
 * sit at `anchor + direction × (index) × step`, and the ring counter-rotates by
 * `direction × progress × step`, so the active marker always lands on `anchor`.
 */
export const dial = {
  /** Ring diameter in px. Dots sit on the line, at r = 400. */
  size: 800,
  /** Distance from ring centre to a number's centre, in px. */
  numberRadius: 432,
  /** Degrees between markers — 30 with the ring beside the column, 20 above it. */
  step: { side: 30, top: 20 },
  /** Where the active marker rests: 3 o'clock beside the column, 6 o'clock above it. */
  anchor: { side: 0, top: 90 },
  /** Marker order runs clockwise beside the column, anticlockwise above it. */
  direction: { side: 1, top: -1 },
} as const;
