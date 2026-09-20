import type { ImageSource } from "@/types/media";

/**
 * The service catalogue, in the order the carousel reveals them.
 *
 * These are the ten services the business actually offers, transcribed from the
 * service reference document — descriptions are each service's tagline verbatim,
 * and the detail fields below carry that document's own copy for the problem it
 * addresses, what gets built, the phased roadmap, the delivery team, the tooling,
 * the deliverables and the outcome figures. The wording a visitor reads is the
 * business's own rather than a paraphrase.
 *
 * Everything downstream is generated from this array: the dial numbers (01–10)
 * come from array position, `Services.tsx` passes `services.length` to the
 * scroller, and the navbar dropdown, contact `<select>`, sitemap and
 * `/services/[slug]` params all derive from it. Adding a service is a data edit.
 *
 * Tags are derived from each service's own build description and tooling rather
 * than invented — three short capability labels.
 *
 * Illustrations are the reference build's 1360px greyscale renders, served from
 * `/services` — see `scripts/build-image-assets.mjs`. There are five and ten
 * services, so they cycle. They are abstract forms carrying no information the
 * copy does not already give, so they render with an empty `alt`. The brand
 * colour is NOT in the asset: it comes from the `#gst-emerald` luminance ramp
 * applied at render time.
 */

/** One phase of the delivery roadmap. `days` is a human range, not a date. */
export interface ServicePhase {
  name: string;
  /** e.g. "Days 1–3". Presentational — nothing parses this. */
  days: string;
  items: string[];
}

/** A role on the delivery team. `initials` is the avatar monogram. */
export interface ServiceRole {
  role: string;
  focus: string;
  initials: string;
}

/** One category of the technology stack, rendered as a group of chips. */
export interface ServiceStackGroup {
  category: string;
  tools: string[];
}

/**
 * A before/after pair, as percentages.
 *
 * Deliberately typed as required numbers on an OPTIONAL field: a service either
 * has measured figures or it has none, and a half-populated outcome would render
 * a bar chart with a missing end.
 */
export interface ServiceOutcome {
  label: string;
  before: number;
  after: number;
}

export interface Service {
  /** Route under /services, and the value the contact form submits. */
  slug: string;
  title: string;
  description: string;
  /** Short capability labels. Rendered in order, wrapping when the column is narrow. */
  tags: string[];
  illustration: ImageSource;
  /** Headline duration, e.g. "21-day rollout". */
  timeline: string;
  /** The pain point this service addresses. */
  problem: string;
  /** The concrete thing delivered. */
  build: string;
  roadmap: ServicePhase[];
  team: ServiceRole[];
  stack: ServiceStackGroup[];
  deliverables: string[];
  /** Omitted where no figures exist — the detail page renders nothing for it. */
  outcomes?: ServiceOutcome[];
  /** Closing note on what happens after launch. */
  support: string;
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
    timeline: "21-day rollout",
    problem:
      "Missed calls are missed revenue. Front desks can't answer every call, especially after hours or during rushes, and the businesses that feel this hardest lose bookings to whichever competitor picks up first.",
    build:
      "A custom-scripted AI voice agent that answers, qualifies, and books directly into your calendar, built around your actual call flow, not a generic script.",
    roadmap: [
      { name: "Discovery & Call Mapping", days: "Days 1–3", items: ["Audit current call flow", "Identify FAQs & edge cases", "Map booking logic"] },
      { name: "Agent Strategy & Persona", days: "Days 4–7", items: ["Voice & tone design", "Conversation structure", "Escalation rules"] },
      { name: "Integration", days: "Days 8–12", items: ["Phone system", "Calendar & CRM", "Lead database"] },
      { name: "Testing & QA", days: "Days 13–17", items: ["Test calls", "Edge-case stress test", "Human transcript review"] },
      { name: "Launch & Optimization", days: "Days 18–21", items: ["Go-live", "Weekly transcript review", "Response tuning"] },
    ],
    team: [
      { role: "Voice Strategist", focus: "Designs conversation architecture and brand tone", initials: "VS" },
      { role: "Integrations Engineer", focus: "Connects phone, CRM, and calendar systems", initials: "IE" },
      { role: "Account Manager", focus: "Monitors performance and manages optimization", initials: "AM" },
    ],
    stack: [
      { category: "AI & Intelligence", tools: ["Conversational voice AI", "Language reasoning model"] },
      { category: "Communication", tools: ["Telephony", "SMS follow-up"] },
      { category: "CRM & Data", tools: ["Calendar sync", "Lead database"] },
      { category: "Analytics", tools: ["Call transcripts", "Reporting dashboard"] },
    ],
    deliverables: [
      "Custom AI voice agent",
      "Call scripts & decision tree",
      "CRM integration",
      "Calendar integration",
      "Call transcript log",
      "Escalation routing",
      "Monthly performance report",
    ],
    outcomes: [
      { label: "Missed calls", before: 78, after: 22 },
      { label: "After-hours response", before: 15, after: 85 },
    ],
    support:
      "Your Account Manager reviews real call transcripts weekly for the first month, then monthly after that, tuning responses as your business evolves.",
  },
  {
    slug: "vertical-automation",
    title: "Vertical Automation",
    description:
      "Industry-specific automation systems built around how your business actually runs.",
    tags: ["Workflow Design", "Integrations", "Reporting"],
    illustration: illustration("digital-marketing"),
    timeline: "28-day rollout",
    problem:
      "Off-the-shelf automation tools assume every business works the same way. Generic automation breaks the moment it hits real operational complexity: legal intake isn't dental scheduling.",
    build:
      "A custom-built automation system covering intake, follow-up, handoffs, and reporting, architected around your industry's specific rules, not a template.",
    roadmap: [
      { name: "Workflow Audit", days: "Days 1–5", items: ["Map manual steps", "Identify handoffs", "Flag reporting gaps"] },
      { name: "System Architecture", days: "Days 6–10", items: ["Design around industry rules", "Compliance mapping", "Integration plan"] },
      { name: "Build", days: "Days 11–20", items: ["Workflow construction", "Tool integration", "Internal testing"] },
      { name: "Human QA", days: "Days 21–23", items: ["Scenario testing", "Edge-case review", "Compliance check"] },
      { name: "Rollout & Training", days: "Days 24–28", items: ["Deployment", "Staff training", "Documentation"] },
    ],
    team: [
      { role: "Automation Strategist", focus: "Designs the system around your industry's rules", initials: "AS" },
      { role: "Automation Engineer", focus: "Builds and QA's the workflow", initials: "AE" },
      { role: "Support Engineer", focus: "Owns the live rollout period", initials: "SE" },
    ],
    stack: [
      { category: "Automation", tools: ["Workflow orchestration", "Trigger-based logic"] },
      { category: "CRM & Data", tools: ["CRM / EHR / case management integration"] },
      { category: "AI & Intelligence", tools: ["Document parsing", "Decision logic"] },
      { category: "Analytics", tools: ["Workflow reporting"] },
    ],
    deliverables: [
      "Full workflow audit document",
      "Custom-built automation system",
      "Integration with existing tools",
      "Staff training session",
      "Documentation",
      "2-week live support window",
    ],
    outcomes: [
      { label: "Manual admin hours", before: 82, after: 34 },
      { label: "Dropped handoffs", before: 65, after: 12 },
    ],
    support:
      "A Support Engineer stays on for two weeks post-launch, then your Account Manager checks in monthly to catch anything that needs adjusting as your workflows evolve.",
  },
  {
    slug: "ai-lead-generation",
    title: "AI Lead Generation",
    description:
      "Every lead followed up in minutes, not days, managed by a real growth team.",
    tags: ["Multi-channel", "Follow-up", "CRM"],
    illustration: illustration("social-content"),
    timeline: "30-day rollout",
    problem:
      "Most businesses lose 60–70% of leads simply through slow or inconsistent follow-up. By the time a rep calls back, the prospect has already booked with someone else.",
    build:
      "A multi-channel follow-up system (SMS, email, and voice) timed to industry-specific buying behavior, connected directly into your CRM.",
    roadmap: [
      { name: "Lead Flow Audit", days: "Days 1–4", items: ["Source mapping", "Response-time baseline", "CRM review"] },
      { name: "Follow-Up Architecture", days: "Days 5–8", items: ["Channel sequencing", "Message strategy", "Qualification logic"] },
      { name: "Build & Integration", days: "Days 9–15", items: ["CRM connection", "Sequence build", "Routing rules"] },
      { name: "Simulation & QA", days: "Days 16–18", items: ["Simulated lead runs", "Edge-case testing"] },
      { name: "Launch & Optimization", days: "Days 19–30", items: ["Go-live", "Weekly rate review", "Message tuning"] },
    ],
    team: [
      { role: "Growth Strategist", focus: "Owns follow-up logic and offer positioning", initials: "GS" },
      { role: "Automation Engineer", focus: "Builds and connects the sequences", initials: "AE" },
      { role: "Account Manager", focus: "Reviews performance weekly", initials: "AM" },
    ],
    stack: [
      { category: "Automation", tools: ["Multi-channel sequencing"] },
      { category: "Communication", tools: ["SMS", "Email", "Voice follow-up"] },
      { category: "CRM & Data", tools: ["CRM integration", "Lead scoring"] },
      { category: "Analytics", tools: ["Response-rate dashboard"] },
    ],
    deliverables: [
      "Multi-channel follow-up system",
      "CRM integration",
      "Lead-response dashboard",
      "Automated sequences",
      "Monthly optimization review",
    ],
    outcomes: [
      { label: "First response time", before: 80, after: 18 },
      { label: "Leads reached before cold", before: 35, after: 78 },
    ],
    support:
      "Your Account Manager reviews response and booking rates weekly for the first month, shifting to monthly optimization once the system stabilizes.",
  },
  {
    slug: "ai-content-social",
    title: "AI Content & Social",
    description:
      "Consistent, on-brand content across every platform, directed by a real content team.",
    tags: ["Content Calendar", "Social", "Human Review"],
    illustration: illustration("product-design"),
    timeline: "Ongoing, weekly batches",
    problem:
      "Consistent content production is one of the biggest time drains for growing businesses, and inconsistency kills algorithmic reach and brand trust alike.",
    build:
      "A monthly content calendar and platform-native posts, drafted with AI assistance and edited, fact-checked, and approved by a human before publishing.",
    roadmap: [
      { name: "Brand & Voice Onboarding", days: "Days 1–3", items: ["Voice audit", "Audience mapping", "Top-content review"] },
      { name: "Content Calendar Build", days: "Days 4–7", items: ["Monthly plan", "Platform mix", "Goal alignment"] },
      { name: "Production", days: "Ongoing", items: ["AI-assisted drafting", "Human editing", "Fact-checking"] },
      { name: "Review Cycle", days: "Weekly", items: ["Client approval", "Revisions"] },
      { name: "Performance Review", days: "Monthly", items: ["What's working", "Calendar adjustment"] },
    ],
    team: [
      { role: "Content Strategist", focus: "Owns the calendar and brand voice", initials: "CS" },
      { role: "Human Editor", focus: "Reviews and refines every AI-assisted draft", initials: "HE" },
      { role: "Account Manager", focus: "Reports on performance monthly", initials: "AM" },
    ],
    stack: [
      { category: "AI & Intelligence", tools: ["Drafting & repurposing assistance"] },
      { category: "Automation", tools: ["Scheduling & publishing"] },
      { category: "Analytics", tools: ["Platform performance tracking"] },
    ],
    deliverables: [
      "Monthly content calendar",
      "Platform-native posts",
      "Human-edited copy",
      "Repurposed content",
      "Monthly performance report",
    ],
    outcomes: [
      { label: "Publishing consistency", before: 30, after: 90 },
      { label: "Monthly content output", before: 25, after: 75 },
    ],
    support:
      "Your Content Strategist reviews what's resonating every month and adjusts the calendar: no static plan running on autopilot.",
  },
  {
    slug: "ai-video-ugc",
    title: "AI Video / UGC",
    description:
      "Scroll-stopping video, directed by real creative producers, produced at AI-assisted speed.",
    tags: ["Short-form Video", "Scripting", "Editing"],
    illustration: illustration("brand-identity"),
    timeline: "20-day cycle",
    problem:
      "Video is the highest-converting content format, but traditional production (crews, editors, weeks-long turnaround) is slow and expensive.",
    build:
      "A batch of platform-ready videos, scripted by a human copywriter and finished by a human editor, with AI accelerating generation and first-pass editing.",
    roadmap: [
      { name: "Creative Strategy", days: "Days 1–3", items: ["Hooks & concepts", "Format selection"] },
      { name: "Script Development", days: "Days 4–6", items: ["Human-written scripts", "AI-assisted iteration"] },
      { name: "Production", days: "Days 7–14", items: ["AI-assisted generation", "First-pass editing"] },
      { name: "Human Editing & QA", days: "Days 15–17", items: ["Final cuts", "Pacing & brand check"] },
      { name: "Delivery", days: "Days 18–20", items: ["Platform-ready export", "Posting recommendations"] },
    ],
    team: [
      { role: "Creative Producer", focus: "Directs concept and hooks", initials: "CP" },
      { role: "Copywriter", focus: "Writes and refines scripts", initials: "CW" },
      { role: "Video Editor", focus: "Finishes every cut by hand", initials: "VE" },
    ],
    stack: [
      { category: "AI & Intelligence", tools: ["AI-assisted generation & editing"] },
      { category: "Automation", tools: ["Repurposing across formats"] },
      { category: "Analytics", tools: ["Posting schedule optimization"] },
    ],
    deliverables: [
      "Platform-ready video batch",
      "Scripts & storyboards",
      "Two rounds of revisions",
      "Posting schedule recommendations",
    ],
    outcomes: [
      { label: "Production turnaround", before: 85, after: 25 },
      { label: "Monthly video output", before: 20, after: 70 },
    ],
    support:
      "Two revision rounds are included on every batch, and your Creative Producer stays involved through final delivery, not just the brief.",
  },
  {
    slug: "ai-copy-sales-pages",
    title: "AI Copy & Sales Pages",
    description:
      "Conversion-focused copy, written by real copywriters and stress-tested with AI iteration.",
    tags: ["Copywriting", "Landing Pages", "Conversion"],
    illustration: illustration("web-development"),
    timeline: "15-day cycle",
    problem:
      "Weak copy is one of the most common, and most fixable, reasons offers underperform. Most businesses either write it themselves without conversion expertise, or hire freelancers with inconsistent quality.",
    build:
      "Full sales or landing page copy, researched and structured by a dedicated copywriter, with AI used to rapidly test angles and headlines.",
    roadmap: [
      { name: "Research", days: "Days 1–4", items: ["Audience & objections", "Competitor positioning"] },
      { name: "Strategic Draft", days: "Days 5–8", items: ["Multiple angles tested", "Headline variations"] },
      { name: "Human Refinement", days: "Days 9–11", items: ["Voice matching", "Objection-proofing"] },
      { name: "Client Review", days: "Days 12–14", items: ["Feedback round", "Revisions"] },
      { name: "Delivery", days: "Day 15", items: ["Final copy handoff"] },
    ],
    team: [
      { role: "Copywriter", focus: "Owns research, structure, and final voice", initials: "CW" },
      { role: "Conversion Strategist", focus: "Reviews structure against conversion best practice", initials: "CS" },
    ],
    stack: [
      { category: "AI & Intelligence", tools: ["Headline & angle testing"] },
      { category: "Analytics", tools: ["Competitor & offer research"] },
    ],
    deliverables: [
      "Sales or landing page copy",
      "3 headline/angle options",
      "Two rounds of revisions",
      "Copy formatted for direct handoff",
    ],
    outcomes: [
      { label: "Page conversion potential", before: 35, after: 80 },
    ],
    support:
      "One round of light-touch adjustments is available after launch if early performance data suggests a specific section needs tightening.",
  },
  {
    slug: "ai-seo-content",
    title: "AI SEO Content",
    description:
      "Search-optimized content built on real keyword strategy, produced at scale with human review.",
    tags: ["Keyword Strategy", "Editorial", "Publishing Cadence"],
    illustration: illustration("digital-marketing"),
    timeline: "3–6 month retainer",
    problem:
      "SEO content requires consistent volume and quality over months to work, a combination most businesses can't sustain in-house, and most cheap AI content mills fail at.",
    build:
      "A keyword-driven content calendar and human-edited, SEO-optimized articles published on a consistent weekly cadence.",
    roadmap: [
      { name: "Keyword Research", days: "Days 1–5", items: ["Search intent mapping", "Competitive gap analysis"] },
      { name: "Content Plan", days: "Days 6–8", items: ["Prioritized calendar", "Buyer-journey mapping"] },
      { name: "Production", days: "Ongoing", items: ["AI-assisted drafting", "Human editing & fact-check"] },
      { name: "Publishing & On-Page SEO", days: "Weekly", items: ["Formatting", "Internal linking"] },
      { name: "Reporting", days: "Monthly", items: ["Ranking review", "Plan adjustment"] },
    ],
    team: [
      { role: "SEO Strategist", focus: "Owns keyword strategy and reporting", initials: "SS" },
      { role: "Content Editor", focus: "Fact-checks and refines every draft", initials: "CE" },
      { role: "Account Manager", focus: "Delivers monthly reporting", initials: "AM" },
    ],
    stack: [
      { category: "AI & Intelligence", tools: ["AI-assisted drafting"] },
      { category: "Analytics", tools: ["SEO research platform", "Search analytics"] },
      { category: "Automation", tools: ["CMS publishing"] },
    ],
    deliverables: [
      "Keyword research & content calendar",
      "Human-edited SEO articles",
      "On-page optimization",
      "Monthly ranking & traffic report",
    ],
    outcomes: [
      { label: "Organic visibility (6mo)", before: 20, after: 65 },
    ],
    support:
      "This is a compounding retainer, not a one-time build: the objective is growing organic visibility and qualified traffic over time, not an overnight ranking jump.",
  },
  {
    slug: "web-development",
    title: "Web Development",
    description:
      "Fast, professional websites, designed by a real team and built with AI-accelerated development.",
    tags: ["Web Design", "Responsive Build", "UX & QA"],
    illustration: illustration("social-content"),
    timeline: "28-day build",
    problem:
      "Traditional web builds take months and cost tens of thousands; DIY builders produce generic, slow, poorly-converting sites.",
    build:
      "A custom-designed, mobile-responsive website matched to your brand, with AI accelerating development while a human handles UX, integrations, and QA.",
    roadmap: [
      { name: "Discovery & Wireframes", days: "Days 1–5", items: ["Site structure", "Conversion paths"] },
      { name: "Design", days: "Days 6–12", items: ["Custom visual design", "Brand alignment"] },
      { name: "Development", days: "Days 13–20", items: ["AI-assisted build", "Integrations"] },
      { name: "Review & Revisions", days: "Days 21–24", items: ["Client feedback", "Two revision rounds"] },
      { name: "Launch", days: "Days 25–28", items: ["Domain & hosting", "Final QA pass"] },
    ],
    team: [
      { role: "Web Designer", focus: "Owns visual and UX direction", initials: "WD" },
      { role: "Developer", focus: "Handles build, integrations, and QA", initials: "DV" },
      { role: "QA Specialist", focus: "Tests across devices before launch", initials: "QA" },
    ],
    stack: [
      { category: "AI & Intelligence", tools: ["AI-assisted development"] },
      { category: "Analytics", tools: ["Site analytics", "Basic SEO setup"] },
      { category: "Automation", tools: ["Form & booking integrations"] },
    ],
    deliverables: [
      "Custom-designed responsive website",
      "Analytics & basic SEO setup",
      "Two rounds of revisions",
      "30-day post-launch support",
    ],
    outcomes: [
      { label: "Build turnaround", before: 90, after: 30 },
    ],
    support:
      "A 30-day post-launch support window is included. After that, an optional monthly care plan covers updates, backups, and small changes.",
  },
  {
    slug: "ai-email-brand",
    title: "AI Email & Brand",
    description:
      "Email systems and brand messaging that actually sound like you.",
    tags: ["Email Sequences", "Brand Voice", "Lifecycle"],
    illustration: illustration("product-design"),
    timeline: "19-day build",
    problem:
      "Most businesses either neglect email entirely or send generic, inconsistent messaging that doesn't reflect their brand, leaving one of the highest-ROI channels underused.",
    build:
      "Documented brand voice plus built-out welcome, nurture, and campaign email sequences, drafted with AI and finalized by a human copywriter.",
    roadmap: [
      { name: "Brand Voice Audit", days: "Days 1–4", items: ["Tone documentation", "Messaging pillars"] },
      { name: "Email System Architecture", days: "Days 5–9", items: ["Sequence mapping", "Segment strategy"] },
      { name: "Build", days: "Days 10–16", items: ["AI-assisted drafting", "Human finalization"] },
      { name: "Testing", days: "Days 17–19", items: ["Deliverability testing", "Cross-client rendering"] },
      { name: "Launch & Optimization", days: "Monthly", items: ["Open/click review", "Message refinement"] },
    ],
    team: [
      { role: "Brand Strategist", focus: "Defines voice and messaging architecture", initials: "BS" },
      { role: "Copywriter", focus: "Finalizes every sequence by hand", initials: "CW" },
      { role: "Automation Specialist", focus: "Builds and tests the sequences", initials: "AS" },
    ],
    stack: [
      { category: "AI & Intelligence", tools: ["Copy drafting assistance"] },
      { category: "Communication", tools: ["Email platform integration"] },
      { category: "Analytics", tools: ["Open/click reporting"] },
    ],
    deliverables: [
      "Documented brand voice guide",
      "Welcome & nurture sequences",
      "Campaign templates",
      "Deliverability testing",
      "Monthly optimization report",
    ],
    outcomes: [
      { label: "Open rate", before: 40, after: 72 },
      { label: "Click-through rate", before: 30, after: 68 },
    ],
    support:
      "Your Brand Strategist reviews open and click data monthly and refines messaging: the sequences aren't static once they launch.",
  },
  {
    slug: "pitch-decks",
    title: "Pitch Decks",
    description:
      "Investor- and client-ready decks, strategized by real deck specialists.",
    tags: ["Narrative", "Deck Design", "Investor Ready"],
    illustration: illustration("brand-identity"),
    timeline: "17-day build",
    problem:
      "A weak deck can kill a strong business, whether pitching investors, closing enterprise clients, or presenting internally.",
    build:
      "A fully designed, narrative-driven pitch deck: story arc built by a strategist, copy drafted with AI assistance, visuals finished by a designer.",
    roadmap: [
      { name: "Narrative Strategy", days: "Days 1–4", items: ["Story arc", "Problem → solution → ask"] },
      { name: "Content Draft", days: "Days 5–7", items: ["AI-assisted drafting", "Structure refinement"] },
      { name: "Design", days: "Days 8–13", items: ["Custom visual design", "Brand alignment"] },
      { name: "Review & Revisions", days: "Days 14–16", items: ["Client feedback", "Two revision rounds"] },
      { name: "Delivery", days: "Day 17", items: ["Editable & presentation-ready files"] },
    ],
    team: [
      { role: "Deck Strategist", focus: "Owns the narrative arc", initials: "DS" },
      { role: "Copywriter", focus: "Drafts and tightens slide copy", initials: "CW" },
      { role: "Presentation Designer", focus: "Finishes the visual execution", initials: "PD" },
    ],
    stack: [
      { category: "AI & Intelligence", tools: ["Copy & structure iteration"] },
      { category: "Design", tools: ["Presentation design tools"] },
    ],
    deliverables: [
      "Narrative strategy document",
      "Custom-designed deck (10–20 slides)",
      "Editable source file + PDF",
      "Two rounds of revisions",
    ],
    outcomes: [
      { label: "Meeting-to-next-step rate", before: 30, after: 70 },
    ],
    support:
      "One light revision pass is available after your first real pitch, in case a live audience surfaces a question the deck should answer better.",
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
