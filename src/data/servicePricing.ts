import { PRICE_PLACEHOLDER, type PricingPlan } from "@/data/pricing";

/**
 * Per-service pricing tiers, shown on each `/services/[slug]` detail page.
 *
 * ## Why a separate file rather than a field on `Service`
 *
 * `services.ts` is already the single source for problem/build/roadmap/team/
 * stack/deliverables/outcomes — adding thirty more tier objects (three per
 * service, each with its own benefit list) to that file would roughly double
 * its length for a genuinely separate concern. This mirrors the split
 * `solutions.ts` used to keep with `services.ts`: one file per concern, cross-
 * referenced by slug rather than nested.
 *
 * ## Why `PricingPlan`, not a new type
 *
 * These render through the exact `PricingCard` the standalone `/pricing` page
 * already uses — same card shape, same dark-middle-card convention, same
 * dotted rule, same "Request a quote" button. Reusing the type the component
 * already expects means zero new props and zero risk of the two pricing
 * surfaces drifting apart in shape while `/pricing` still exists.
 *
 * ## The tier shape
 *
 * Every service keeps the same three-tier SHAPE the original `/pricing` page
 * established — a one-off/project-scoped tier, a recurring-capacity tier
 * (marked `featured`, matching the original page's own convention of
 * emphasising the ongoing plan), and a maintenance/support tier — because
 * that structure is sound. What changes per service is the tier NAME and,
 * more importantly, every benefit bullet: each one is drawn from that
 * service's own roadmap phases, deliverables or support copy in
 * `services.ts`, not generic filler that could apply to any service.
 *
 * **Pitch Decks is the one deliberate exception to "recurring capacity".** A
 * business does not typically need a new pitch deck built every month the way
 * it needs recurring content or recurring automation — forcing a monthly-
 * retainer framing onto a fundamentally single-engagement service would be
 * exactly the kind of invented claim this whole exercise exists to avoid.
 * Instead of dropping to two cards (which would make that one page look
 * broken next to the other nine, all of which show three), its middle tier
 * describes a real, narrower recurring need decks genuinely have: revising an
 * existing deck as metrics, traction or the ask change between rounds or
 * pitches. Three cards everywhere, but the middle one says something true.
 *
 * ## The placeholder price
 *
 * `PRICE_PLACEHOLDER` (from `pricing.ts`) stands in for every dollar figure
 * below, not an invented number. The real numbers have not been set by the
 * business yet, and this project has already been through removing exactly
 * this category of problem once — the $6,000/$12,000/$5,000 figures left over
 * from the original Framer template, invented by no one at this business,
 * replaced with "Custom / quote" before real per-service tiers existed to
 * price at all. Inventing a plausible-looking number here would be the same
 * mistake at finer granularity: a fabricated figure a client could see,
 * believe, and ask about. See `PricingCard` for how this renders — visually
 * distinct from a real price, not the same slot with different text.
 */

export const servicePricing: Record<string, PricingPlan[]> = {
  "ai-voice-agents": [
    {
      name: "Agent Build",
      description:
        "A custom-scripted voice agent built around your actual call flow, from discovery through go-live.",
      benefits: [
        "Call flow audit & agent scripting",
        "Calendar, CRM & phone system integration",
        "Edge-case stress testing before launch",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "launch",
    },
    {
      name: "Ongoing Optimization",
      description: "Your Account Manager keeps the agent tuned as real calls come in.",
      benefits: [
        "Weekly call transcript review for the first month",
        "Response tuning based on real conversations",
        "Escalation rule updates as edge cases surface",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "growth",
      featured: true,
    },
    {
      name: "Support & Monitoring",
      description: "Keeping the agent live, accurate and accountable month to month.",
      benefits: ["Uptime monitoring", "Minor script adjustments", "Monthly performance report"],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "scale",
    },
  ],

  "vertical-automation": [
    {
      name: "Automation Build",
      description: "A workflow audit, architecture and build designed around your industry's specific rules.",
      benefits: [
        "Full workflow audit & manual-step mapping",
        "System architecture & compliance mapping",
        "Integration with existing CRM/EHR/case-management tools",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "launch",
    },
    {
      name: "Ongoing Automation",
      description: "New automations added as your operations grow.",
      benefits: [
        "Additional workflows added over time",
        "Live monitoring through the rollout window",
        "Monthly Account Manager check-ins",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "growth",
      featured: true,
    },
    {
      name: "Support & Updates",
      description: "Keeping the automation running as tools and rules change.",
      benefits: ["Fixes & edge-case handling", "Dependency & integration updates", "Documentation kept current"],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "scale",
    },
  ],

  "ai-lead-generation": [
    {
      name: "Follow-Up System Build",
      description: "A multi-channel follow-up system connected directly into your CRM.",
      benefits: [
        "Lead flow audit & response-time baseline",
        "SMS, email & voice sequence build",
        "CRM integration & routing rules",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "launch",
    },
    {
      name: "Ongoing Campaign Management",
      description: "Your Account Manager reviews performance weekly and keeps sequences sharp.",
      benefits: [
        "Weekly response & booking-rate review",
        "Message & sequence iteration",
        "Monthly optimization review",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "growth",
      featured: true,
    },
    {
      name: "Support & Monitoring",
      description: "Keeping the follow-up system accurate as lead sources shift.",
      benefits: ["Lead-flow monitoring", "Sequence fixes as channels change", "Lead-response dashboard access"],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "scale",
    },
  ],

  "ai-content-social": [
    {
      name: "Content System Setup",
      description: "Brand voice onboarding and a monthly content calendar built around your platforms.",
      benefits: [
        "Brand voice audit & audience mapping",
        "Monthly content calendar & platform mix",
        "First batch of platform-native posts",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "launch",
    },
    {
      name: "Ongoing Content Production",
      description: "AI-assisted drafting, human-edited and fact-checked, published on a steady cadence.",
      benefits: [
        "Weekly AI-assisted drafting & human editing",
        "Platform-native posts every week",
        "Repurposed content across formats",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "growth",
      featured: true,
    },
    {
      name: "Review & Adjustments",
      description: "A Content Strategist keeps the calendar aligned with what's actually working.",
      benefits: [
        "Weekly client approval cycle",
        "Monthly performance review",
        "Calendar adjusted to top-performing content",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "scale",
    },
  ],

  "ai-video-ugc": [
    {
      name: "First Production Run",
      description: "A full batch of platform-ready videos, from concept through final cut.",
      benefits: [
        "Hooks, concepts & format selection",
        "Human-written scripts, AI-assisted iteration",
        "Human-edited final cuts & pacing check",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "launch",
    },
    {
      name: "Ongoing Video Production",
      description: "A steady batch of new videos each cycle, with your Creative Producer involved throughout.",
      benefits: [
        "Recurring platform-ready video batches",
        "AI-assisted generation & first-pass editing",
        "Posting schedule recommendations",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "growth",
      featured: true,
    },
    {
      name: "Revision & Editing Passes",
      description: "Two rounds of revisions are included on every batch, not billed separately.",
      benefits: ["Two revision rounds per batch", "Final pacing & brand check", "Direct access to your Creative Producer"],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "scale",
    },
  ],

  "ai-copy-sales-pages": [
    {
      name: "Copy Package",
      description: "Full sales or landing page copy, researched and structured by a dedicated copywriter.",
      benefits: [
        "Audience & objection research",
        "Multiple angles & headline variations tested",
        "Voice matching & objection-proofing",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "launch",
    },
    {
      name: "Ongoing Copy Support",
      description: "Recurring page and campaign copy as new offers and angles need testing.",
      benefits: [
        "New page/campaign copy on a recurring basis",
        "AI-assisted angle & headline testing",
        "Two rounds of revisions per piece",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "growth",
      featured: true,
    },
    {
      name: "Refresh & Testing",
      description: "Light-touch adjustments once real performance data comes in.",
      benefits: ["Post-launch performance review", "Section-level copy tightening", "Formatted for direct handoff"],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "scale",
    },
  ],

  "ai-seo-content": [
    {
      name: "Program Setup",
      description: "Keyword research and a prioritized content calendar to start the program.",
      benefits: [
        "Search intent mapping & competitive gap analysis",
        "Prioritized, buyer-journey-mapped calendar",
        "Initial keyword-driven article batch",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "launch",
    },
    {
      name: "Content Retainer",
      description: "Human-edited, SEO-optimized articles published on a consistent weekly cadence.",
      benefits: [
        "Weekly AI-assisted drafting & human fact-check",
        "On-page SEO & internal linking",
        "Consistent weekly publishing cadence",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "growth",
      featured: true,
    },
    {
      name: "Reporting & Optimization",
      description: "Monthly ranking review keeps the plan compounding rather than running on autopilot.",
      benefits: [
        "Monthly ranking & traffic report",
        "Plan adjustment based on real performance",
        "A compounding retainer, not a one-time build",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "scale",
    },
  ],

  "web-development": [
    {
      name: "Website Build",
      description: "A custom-designed, mobile-responsive website, from discovery through launch.",
      benefits: [
        "Discovery, wireframes & conversion paths",
        "Custom visual design matched to your brand",
        "AI-accelerated development & integrations",
        "Two rounds of revisions before launch",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "launch",
    },
    {
      name: "Ongoing Enhancements",
      description: "New features and pages added as the site needs to grow.",
      benefits: [
        "New pages & features added over time",
        "Analytics reviewed to guide priorities",
        "Integrations added as new tools come on",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "growth",
      featured: true,
    },
    {
      /* Deliberately close to the original standalone page's generic
         "Support & Maintenance" tier — this is the one service where that
         framing was already the closest fit, so it is kept rather than
         reworded for the sake of being different. Only the last bullet is
         specific to this service, from its own 30-day post-launch window. */
      name: "Support & Maintenance",
      description: "Keeping an existing site healthy: updates, monitoring and small improvements.",
      benefits: [
        "Dependency & security updates",
        "Monitoring and fixes",
        "Small feature work",
        "30-day post-launch support window included",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "scale",
    },
  ],

  "ai-email-brand": [
    {
      name: "Email System Build",
      description: "Brand voice documentation plus welcome, nurture and campaign sequences, built and tested.",
      benefits: [
        "Brand voice audit & messaging pillars",
        "Sequence mapping & segment strategy",
        "Deliverability testing & cross-client rendering",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "launch",
    },
    {
      name: "Ongoing Campaigns",
      description: "New campaign sequences added as your offers and audience evolve.",
      benefits: ["New campaign sequences over time", "Monthly open/click review", "Message refinement based on real data"],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "growth",
      featured: true,
    },
    {
      name: "Deliverability & Testing",
      description: "Keeping sequences landing in the inbox, not the spam folder.",
      benefits: ["Ongoing deliverability monitoring", "Cross-client rendering checks", "Monthly optimization report"],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "scale",
    },
  ],

  "pitch-decks": [
    {
      name: "Deck Build",
      description: "A fully designed, narrative-driven deck, from story arc through final files.",
      benefits: [
        "Story arc & problem → solution → ask structure",
        "AI-assisted drafting, human-refined",
        "Custom visual design & two revision rounds",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "launch",
    },
    {
      /* See the file-level note: this is the one service where "recurring
         capacity" doesn't fit, so the middle tier describes a real, narrower
         recurring need — revising an existing deck — rather than an invented
         monthly retainer. */
      name: "Deck Refresh & Iteration",
      description:
        "For decks that need to evolve as your traction, metrics or ask change: a lighter engagement than a full rebuild.",
      benefits: [
        "Narrative & metrics updated for a new raise or audience",
        "Existing visual system reused, not rebuilt from scratch",
        "Faster turnaround than the original build",
      ],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "growth",
      featured: true,
    },
    {
      name: "Post-Pitch Revisions",
      description:
        "One light revision pass after your first real pitch, in case a live audience surfaces something the deck should answer better.",
      benefits: ["One revision pass after a real pitch", "Editable source file kept up to date", "Available on request, not a fixed retainer"],
      price: PRICE_PLACEHOLDER,
      unit: "",
      cta: "Request a quote",
      href: "/contact",
      icon: "scale",
    },
  ],
};
