/**
 * Solutions — the kinds of problem Greatest Solutions takes on.
 *
 * Deliberately framed as **problem types, not products**. Greatest Solutions has
 * no proprietary platform, no SaaS product and no industry verticals, and the
 * repository contains no evidence of any; inventing a catalogue would be
 * inventing a business model. Each entry describes a shape of work, and none
 * claims it has been delivered before — that claim belongs to `/works`, which is
 * honestly empty until real projects exist.
 *
 * Distinct from `services.ts` on purpose: Services is *what we do* (the
 * discipline), Solutions is *what you might need done* (the problem). The two
 * are cross-linked rather than duplicated.
 */
export interface Solution {
  slug: string;
  title: string;
  description: string;
  /** Concrete examples of the shape of work. Not past projects. */
  examples: string[];
  /** Slug of the service in `services.ts` this most often maps to. */
  service: string;
}

export const solutionsEyebrow = "Solutions";
export const solutionsTitle = "Problems we help solve";
export const solutionsDescription =
  "Most work starts as a problem rather than a specification. These are the shapes it usually takes — if yours looks like one of them, we can help.";

export const solutions: Solution[] = [
  {
    slug: "digital-products",
    title: "Digital Products",
    description:
      "A product with users, accounts and a roadmap — built to be released early and changed often rather than delivered once.",
    examples: ["Customer-facing web apps", "Onboarding and accounts", "Subscription and billing flows"],
    service: "ai-websites",
  },
  {
    slug: "business-platforms",
    title: "Business Platforms",
    description:
      "Systems the business itself runs on, where correctness and uptime matter more than novelty.",
    examples: ["Client and order management", "Reporting and dashboards", "Role-based access"],
    service: "vertical-automation",
  },
  {
    slug: "internal-tools",
    title: "Internal Tools",
    description:
      "The spreadsheet that outgrew itself. Replacing manual process with something your team can actually rely on.",
    examples: ["Admin interfaces", "Data entry and validation", "Team workflows"],
    service: "vertical-automation",
  },
  {
    slug: "ecommerce-systems",
    title: "E-commerce Systems",
    description:
      "Storefronts and the machinery behind them — catalogue, checkout, and the integrations that keep stock and orders in step.",
    examples: ["Storefront builds", "Checkout and payments", "Inventory and fulfilment integrations"],
    service: "ai-websites",
  },
  {
    slug: "automation",
    title: "Automation",
    description:
      "Connecting systems that do not talk to each other, so work stops being copied by hand between them.",
    examples: ["Scheduled jobs and pipelines", "Third-party API integration", "Notifications and reporting"],
    service: "vertical-automation",
  },
  {
    slug: "modernisation",
    title: "Technology Modernisation",
    description:
      "Bringing something already in production up to date without stopping it — dependencies, performance, accessibility, or a staged rebuild.",
    examples: ["Framework and dependency upgrades", "Performance and accessibility work", "Incremental rewrites"],
    service: "ai-websites",
  },
];
