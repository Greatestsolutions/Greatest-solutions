import type { ImageSource } from "@/types/media";

/**
 * The five services, in the order the scroll choreography reveals them.
 *
 * Copy, slugs and tag lists are transcribed from the reference; the dial numbers
 * (01–05) are derived from array position rather than stored, so reordering this
 * list renumbers the dial automatically.
 *
 * Illustrations are the reference's 1360px renders, downloaded once and served
 * from `/services` — see `scripts/build-service-assets.mjs`. They are abstract
 * greyscale forms carrying no information the copy does not already give, so
 * they render with an empty `alt`, as the reference does.
 */
export interface Service {
  /** Route under /services. The section links to it; the page arrives in Task 4. */
  slug: string;
  title: string;
  description: string;
  /** Three capability pills. Rendered in order, wrapping when the column is narrow. */
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
    slug: "web-development",
    title: "Web Development",
    description:
      "Marketing sites, landing pages and content-driven platforms, built to load fast, stay accessible and be easy to edit.",
    tags: ["Frontend", "Performance", "Accessibility"],
    illustration: illustration("web-development"),
  },
  {
    slug: "custom-software-development",
    title: "Custom Software Development",
    description:
      "Internal tools and business systems shaped around how a team actually works, rather than around an off-the-shelf product.",
    tags: ["Architecture", "Integrations", "Automation"],
    illustration: illustration("digital-marketing"),
  },
  {
    slug: "web-applications",
    title: "Web Applications & SaaS",
    description:
      "Multi-user products with accounts, permissions and dashboards — from a first release through to ongoing iteration.",
    tags: ["Product", "APIs", "Dashboards"],
    illustration: illustration("social-content"),
  },
  {
    slug: "ui-ux-product-design",
    title: "UI/UX & Product Design",
    description:
      "Interface and interaction design grounded in real user flows, handed over as build-ready specifications.",
    tags: ["UX", "UI", "Design Systems"],
    illustration: illustration("product-design"),
  },
  {
    slug: "maintenance-support",
    title: "Maintenance & Support",
    description:
      "Updates, monitoring and incremental improvement, so what gets shipped keeps working after launch.",
    tags: ["Monitoring", "Updates", "Support"],
    illustration: illustration("brand-identity"),
  },
];

/** Section landmark name. The reference ships no visible heading here. */
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
