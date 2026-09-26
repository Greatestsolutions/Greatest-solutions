/**
 * Pricing plans. `Section - Pricing` in the reference.
 *
 * Three cards; the third is the "Featured" variant on an ink background. Copy,
 * prices and benefit lists are transcribed from the reference.
 *
 * The plan marks are vector, not images — they are inline SVG in the reference
 * too, so they are reproduced as paths in `PlanIcon` rather than migrated as
 * artwork. See that file for the measured geometry.
 */
export type PlanIconName = "launch" | "growth" | "scale";

/**
 * Stands in for a real price wherever one hasn't been decided yet — currently
 * every tier below. `PricingCard` renders this value with a visually distinct
 * treatment (a dashed, muted pill) rather than in the same slot styled the
 * same as a real number, precisely so it cannot be mistaken for one.
 */
export const PRICE_PLACEHOLDER = "[Price TBD]";

export interface PricingPlan {
  name: string;
  description: string;
  benefits: string[];
  price: string;
  /** Billing unit, shown next to the price at a smaller size. */
  unit: string;
  cta: string;
  href: string;
  icon: PlanIconName;
  /** The dark card. Exactly one plan carries this in the reference. */
  featured?: boolean;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Project Build",
    description:
      "A defined scope with an agreed deliverable, for teams who know what they need built.",
    benefits: [
      "Scoped and estimated up front",
      "Design and build",
      "Testing and launch",
      "Handover and documentation",
    ],
    price: "Custom",
    unit: "quote",
    cta: "Request a quote",
    href: "/contact",
    icon: "launch",
  },
  {
    name: "Ongoing Partnership",
    description:
      "Continuous capacity for teams shipping in cycles rather than in one delivery.",
    benefits: [
      "Recurring development capacity",
      "Prioritised roadmap",
      "Regular releases",
      "Direct line to the team",
    ],
    price: "Custom",
    unit: "quote",
    cta: "Request a quote",
    href: "/contact",
    icon: "growth",
    featured: true,
  },
  {
    name: "Support & Maintenance",
    description:
      "Keeping an existing system healthy: updates, monitoring and small improvements.",
    benefits: [
      "Dependency and security updates",
      "Monitoring and fixes",
      "Small feature work",
      "Agreed response times",
    ],
    price: "Custom",
    unit: "quote",
    cta: "Request a quote",
    href: "/contact",
    icon: "scale",
  },
];

export const pricingEyebrow = "Pricing";
export const pricingTitle = ["Ways to work", "together"] as const;
