/**
 * Frequently asked questions. The last section inside `Main` in the reference,
 * where it carries no `data-framer-name`.
 *
 * Ten entries covering the real objections a prospective client has about the
 * AI-services business. Only the first five render on load; `FAQ` reveals the
 * rest behind a "View more" control.
 */
export interface FaqEntry {
  question: string;
  answer: string;
}

export const faqEntries: FaqEntry[] = [
  {
    question: "What services does Greatest Solutions provide?",
    answer:
      "We build and manage 10 AI-powered systems for growing businesses: AI voice agents, vertical automation, lead generation, content & social, video/UGC, sales copy, SEO content, websites, email & brand, and pitch decks. Every project is planned, built, and QA'd by a specialist. AI accelerates production; it doesn't run unsupervised.",
  },
  {
    question: "How long does a typical project take?",
    answer:
      "Most builds run 2–4 weeks depending on the service. A voice agent rollout takes about 3 weeks, a website build about 4, sales copy closer to 2. Retainer-based services like SEO and content run on an ongoing weekly cadence rather than a fixed end date.",
  },
  {
    question: "Do you work with startups or established companies?",
    answer:
      "Both. Startups tend to lean on us for lead gen, websites, and pitch decks to get moving fast; established businesses more often bring us in for vertical automation and voice agents to remove manual bottlenecks at scale.",
  },
  {
    question: "What is your design and development process?",
    answer:
      "Every project follows the same five-phase structure: discovery, strategy, build, human QA, and launch. You see the roadmap up front before work starts, and nothing ships without a human review pass: AI drafts and accelerates, a specialist signs off.",
  },
  {
    question: "Can Greatest Solutions redesign an existing brand or website?",
    answer:
      "Yes. Redesigns start with an audit of what's working and what isn't in your current site or brand system, so we're not throwing out things that already convert; we're just fixing what's costing you.",
  },
  {
    question: "Do you provide ongoing support after launch?",
    answer:
      "Every service includes a defined post-launch support window (typically 2–4 weeks), and most clients move into a monthly optimization retainer after that so the system keeps improving instead of going stale.",
  },
  {
    question: "Do you offer white-label services for other agencies?",
    answer:
      "Yes. Agencies and consultants can resell any of our 10 services under their own brand. We handle strategy, build, and delivery behind the scenes; you stay the client-facing point of contact. Reporting, timelines, and deliverables can be branded to match your agency, not ours.",
  },
  {
    question: "How involved do I need to be during a project?",
    answer:
      "Minimal on a day-to-day basis. You'll review and approve work at key checkpoints (usually 2–3 per project), but the discovery-to-delivery work is handled by your assigned team.",
  },
  {
    question: "What happens if I'm not happy with a deliverable?",
    answer:
      "Every service includes at least one structured revision round built into the process: feedback goes back to the same specialist who built it, not into a queue.",
  },
  {
    question: "How is pricing structured?",
    answer:
      "Pricing depends on service and scope: one-time builds (websites, voice agents, decks) are quoted per project; ongoing services (SEO, content, lead gen) run as monthly retainers. We'll always give you the number before work starts, not after.",
  },
];

/** How many entries render before "View more" is needed. */
export const faqInitialCount = 5;

export const faqEyebrow = "FAQ";
export const faqTitle = ["Questions?", "We are here to help"] as const;
