import type { ImageSource } from "@/types/media";

/**
 * Portfolio.
 *
 * Every entry below is `type: "Client Project"` — real client work, either
 * the prioritised local video imports (`media`, no `services[]`, no client
 * named since none was given) or the Baytix portfolio import (real downloaded
 * thumbnails under `public/works/<slug>.*`, copy condensed from that site's
 * own case-study text, same no-forced-`services[]` reasoning). See each
 * group's own comment below for specifics.
 *
 * `Internal Project` and `Personal Project` remain valid `ProjectType` values
 * for exactly the case they were built for — real, uncommissioned work with
 * no client to name — but nothing currently uses them. The six placeholder
 * entries that used to (PriceWatch, DocChat AI, PolicAI, LinkedIn Job
 * Scraper, FlipSense, ComixHub, plus their `-2` pagination-test duplicates)
 * were retired once real client work made them unnecessary as portfolio
 * filler — see the git history for that removal if the copy is ever wanted
 * back for a genuinely personal project.
 */
export type ProjectType = "Client Project" | "Internal Project" | "Personal Project";

export interface ProjectImage {
  source: ImageSource;
  /** Required: gallery images are content, not decoration. */
  alt: string;
  caption?: string;
}

/**
 * A real video attached to a project's card. Drives the play-button overlay
 * and {@link VideoModal} on both card surfaces — see `WorksGrid.tsx` and
 * `ProjectCard.tsx`.
 */
export interface ProjectVideo {
  type: "video";
  /** Local path under `public/`, never a remote URL. */
  src: string;
  /** Poster frame shown before playback. Falls back to `thumbnail`, then the
   *  cycled placeholder illustration, when omitted. */
  poster?: ImageSource;
}

export interface Project {
  /** Route under /works. */
  slug: string;
  title: string;
  /**
   * Who the work was for. Omit unless there is a real, named client who has
   * agreed to be named — an absent value renders nothing rather than "Internal".
   */
  client?: string;
  /** Stated on the card so no entry is read as client work by default. */
  type: ProjectType;
  category: string;
  /** One or two lines; clamped to two in the card. */
  description: string;
  /** The case study body on the detail page. */
  fullDescription: string;
  /** Slugs from `services.ts`. Drives the "Services provided" section. */
  services: string[];
  /** Confirmed from the repository or the client only — never inferred. */
  technologies: string[];
  /** Capability tags, rendered as `Pill`s on the card. */
  tags: string[];
  /** Card and detail hero. Omitted when no real screenshot exists. */
  thumbnail?: ImageSource;
  /** A real video for this project. When present, the card shows a play
   *  button over its poster instead of (or in addition to) `thumbnail`. */
  media?: ProjectVideo;
  /** Detail-page gallery. Omitted or empty when there are no real images. */
  gallery?: ProjectImage[];
  /** Live site or repository, when one is public. */
  url?: string;
  /**
   * Lower sorts first; omitted entries sort after every numbered one, in
   * their original array order (the sort below is stable). Replaces the
   * previous `featured?: boolean`, which the render path never actually
   * read — this project needed a real ordering signal, not a second unused
   * one next to it.
   */
  priority?: number;
}

/*
 * Schema reference — NOT rendered. A fully-populated client entry looks like:
 *
 *   {
 *     slug: "acme-portal",
 *     title: "Acme Customer Portal",
 *     client: "Acme Ltd",                     // only with permission to name them
 *     type: "Client Project",
 *     category: "Web Application",
 *     description: "A self-service portal for account and billing management.",
 *     fullDescription: "...",
 *     services: ["web-development", "vertical-automation"],
 *     technologies: ["Next.js", "PostgreSQL"],
 *     tags: ["Dashboard", "Authentication"],
 *     thumbnail: { avif: "/works/acme.avif", webp: "...", fallback: "..." },
 *     gallery: [{ source: {...}, alt: "The billing screen", caption: "Billing" }],
 *     url: "https://example.com",
 *     priority: 1,
 *   }
 *
 * Adding a project is a data edit alone: the card, the grid, `/works/[slug]`,
 * `generateStaticParams` and the sitemap all read from this array.
 */

/** Intrinsic size of a project thumbnail, when one exists. */
export const THUMB_WIDTH = 832;
export const THUMB_HEIGHT = 1104;

export const worksEyebrow = "Featured Work";
export const worksTitle = "Things we have designed, built and shipped";
export const worksCta = "Book an intro call";

const allProjects: Project[] = [
  /* ---------------------------------------------------------------------- *
   * Real video work, imported from `vedios/` (a sibling folder of this repo,
   * supplied directly rather than found on a public site). `priority` 1-10
   * puts these ahead of everything else on both card surfaces; kept first
   * here too so array order and `priority` agree at a glance.
   *
   * Only the title is confidently derived from each source filename —
   * description/category/tags/technologies/services have no real signal
   * beyond the filename to draw from, so they stay honestly minimal rather
   * than invented. Every one of these is flagged in the import report for
   * the business to fill in with the real story.
   *
   * `THE 90S.mp4` and `THE 90S (1).mp4` were byte-identical duplicates in the
   * source folder (same size, duration, codec) — imported once.
   * ---------------------------------------------------------------------- */

  {
    slug: "throne-of-blood",
    title: "Throne of Blood",
    description: "A real video project. Full details to be added.",
    fullDescription:
      "This project doesn't have a written case study yet. Ask us directly for the full story behind it.",
    type: "Client Project",
    category: "Video",
    tags: [],
    technologies: [],
    services: [],
    priority: 1,
    thumbnail: { avif: "/works/video/throne-of-blood.avif", webp: "/works/video/throne-of-blood.webp", fallback: "/works/video/throne-of-blood.png" },
    media: {
      type: "video",
      src: "/works/video/throne-of-blood.mp4",
      poster: { avif: "/works/video/throne-of-blood.avif", webp: "/works/video/throne-of-blood.webp", fallback: "/works/video/throne-of-blood.png" },
    },
  },
  {
    slug: "the-bank-robbery-hq",
    title: "The Bank Robbery HQ",
    description: "A real video project. Full details to be added.",
    fullDescription:
      "This project doesn't have a written case study yet. Ask us directly for the full story behind it.",
    type: "Client Project",
    category: "Video",
    tags: [],
    technologies: [],
    services: [],
    priority: 2,
    thumbnail: { avif: "/works/video/the-bank-robbery-hq.avif", webp: "/works/video/the-bank-robbery-hq.webp", fallback: "/works/video/the-bank-robbery-hq.png" },
    media: {
      type: "video",
      src: "/works/video/the-bank-robbery-hq.mp4",
      poster: { avif: "/works/video/the-bank-robbery-hq.avif", webp: "/works/video/the-bank-robbery-hq.webp", fallback: "/works/video/the-bank-robbery-hq.png" },
    },
  },
  {
    slug: "after-blinders",
    title: "After Blinders",
    description: "A real video project. Full details to be added.",
    fullDescription:
      "This project doesn't have a written case study yet. Ask us directly for the full story behind it.",
    type: "Client Project",
    category: "Video",
    tags: [],
    technologies: [],
    services: [],
    priority: 3,
    thumbnail: { avif: "/works/video/after-blinders.avif", webp: "/works/video/after-blinders.webp", fallback: "/works/video/after-blinders.png" },
    media: {
      type: "video",
      src: "/works/video/after-blinders.mp4",
      poster: { avif: "/works/video/after-blinders.avif", webp: "/works/video/after-blinders.webp", fallback: "/works/video/after-blinders.png" },
    },
  },
  {
    slug: "blue-tick",
    title: "Blue Tick: Acidic Studios Short Film",
    description: "A real video project. Full details to be added.",
    fullDescription:
      "This project doesn't have a written case study yet. Ask us directly for the full story behind it.",
    type: "Client Project",
    category: "Short Film",
    tags: [],
    technologies: [],
    services: [],
    priority: 4,
    thumbnail: { avif: "/works/video/blue-tick.avif", webp: "/works/video/blue-tick.webp", fallback: "/works/video/blue-tick.png" },
    media: {
      type: "video",
      src: "/works/video/blue-tick.mp4",
      poster: { avif: "/works/video/blue-tick.avif", webp: "/works/video/blue-tick.webp", fallback: "/works/video/blue-tick.png" },
    },
  },
  {
    slug: "callixa-hero-demo",
    title: "Callixa Hero Demo",
    description: "A real video project. Full details to be added.",
    fullDescription:
      "This project doesn't have a written case study yet. Ask us directly for the full story behind it.",
    type: "Client Project",
    category: "Demo",
    tags: [],
    technologies: [],
    services: [],
    priority: 5,
    thumbnail: { avif: "/works/video/callixa-hero-demo.avif", webp: "/works/video/callixa-hero-demo.webp", fallback: "/works/video/callixa-hero-demo.png" },
    media: {
      type: "video",
      src: "/works/video/callixa-hero-demo.mp4",
      poster: { avif: "/works/video/callixa-hero-demo.avif", webp: "/works/video/callixa-hero-demo.webp", fallback: "/works/video/callixa-hero-demo.png" },
    },
  },
  {
    // Filename after stripping "Copy of" and the "0111(1)" version code was
    // just "PATA NI" — short and possibly not the intended real title. Flagged
    // in the import report; happy to be corrected.
    slug: "pata-ni",
    title: "Pata Ni",
    description: "A real video project. Full details to be added.",
    fullDescription:
      "This project doesn't have a written case study yet. Ask us directly for the full story behind it.",
    type: "Client Project",
    category: "Video",
    tags: [],
    technologies: [],
    services: [],
    priority: 6,
    thumbnail: { avif: "/works/video/pata-ni.avif", webp: "/works/video/pata-ni.webp", fallback: "/works/video/pata-ni.png" },
    media: {
      type: "video",
      src: "/works/video/pata-ni.mp4",
      poster: { avif: "/works/video/pata-ni.avif", webp: "/works/video/pata-ni.webp", fallback: "/works/video/pata-ni.png" },
    },
  },
  {
    slug: "flower-robot",
    title: "Flower Robot",
    description: "A real video project. Full details to be added.",
    fullDescription:
      "This project doesn't have a written case study yet. Ask us directly for the full story behind it.",
    type: "Client Project",
    category: "Video",
    tags: [],
    technologies: [],
    services: [],
    priority: 7,
    thumbnail: { avif: "/works/video/flower-robot.avif", webp: "/works/video/flower-robot.webp", fallback: "/works/video/flower-robot.png" },
    media: {
      type: "video",
      src: "/works/video/flower-robot.mp4",
      poster: { avif: "/works/video/flower-robot.avif", webp: "/works/video/flower-robot.webp", fallback: "/works/video/flower-robot.png" },
    },
  },
  {
    slug: "mind-tunnels",
    title: "Mind Tunnels",
    description: "A real video project. Full details to be added.",
    fullDescription:
      "This project doesn't have a written case study yet. Ask us directly for the full story behind it.",
    type: "Client Project",
    category: "Video",
    tags: [],
    technologies: [],
    services: [],
    priority: 8,
    thumbnail: { avif: "/works/video/mind-tunnels.avif", webp: "/works/video/mind-tunnels.webp", fallback: "/works/video/mind-tunnels.png" },
    media: {
      type: "video",
      src: "/works/video/mind-tunnels.mp4",
      poster: { avif: "/works/video/mind-tunnels.avif", webp: "/works/video/mind-tunnels.webp", fallback: "/works/video/mind-tunnels.png" },
    },
  },
  {
    // Source filename repeated "AI Short Film" / "AI video" and tool names
    // (Higgsfield, Claude) many times over — export metadata, not title. The
    // one real name in it is "RURU"; "AI Short Film" is kept once as category.
    slug: "ruru",
    title: "RURU: AI Short Film",
    description: "A real video project. Full details to be added.",
    fullDescription:
      "This project doesn't have a written case study yet. Ask us directly for the full story behind it.",
    type: "Client Project",
    category: "AI Short Film",
    tags: [],
    technologies: [],
    services: [],
    priority: 9,
    thumbnail: { avif: "/works/video/ruru.avif", webp: "/works/video/ruru.webp", fallback: "/works/video/ruru.png" },
    media: {
      type: "video",
      src: "/works/video/ruru.mp4",
      poster: { avif: "/works/video/ruru.avif", webp: "/works/video/ruru.webp", fallback: "/works/video/ruru.png" },
    },
  },
  {
    // "THE 90S.mp4" and "THE 90S (1).mp4" were byte-identical — see note above.
    slug: "the-90s",
    title: "The 90s",
    description: "A real video project. Full details to be added.",
    fullDescription:
      "This project doesn't have a written case study yet. Ask us directly for the full story behind it.",
    type: "Client Project",
    category: "Video",
    tags: [],
    technologies: [],
    services: [],
    priority: 10,
    thumbnail: { avif: "/works/video/the-90s.avif", webp: "/works/video/the-90s.webp", fallback: "/works/video/the-90s.png" },
    media: {
      type: "video",
      src: "/works/video/the-90s.mp4",
      poster: { avif: "/works/video/the-90s.avif", webp: "/works/video/the-90s.webp", fallback: "/works/video/the-90s.png" },
    },
  },

  /* ---------------------------------------------------------------------- *
   * Real client work, imported from baytix.net/portfolio. See the file
   * docblock above for what "imported" means here: real thumbnails, copy
   * condensed from that site's own case-study text, no forced services[].
   * ---------------------------------------------------------------------- */

  {
    slug: "eyewear-campaign-identity",
    title: "Eyewear Campaign Identity",
    description:
      "A modern, fashion-forward visual identity for a trendy eyewear brand built around contrast and clarity.",
    fullDescription:
      "A branding direction for a fashion eyewear collection, built around bold dual-tones, minimal editorial layouts and product-centric visuals aimed at a Gen Z digital audience. The system extended across shopping-app screens, hero banners and mobile-first social assets, with clear shop and CTA integration to drive purchases. The campaign recorded high click-through rates on social platforms and helped establish a distinct identity in a competitive market.",
    type: "Client Project",
    category: "Branding",
    tags: ["Brand Identity", "Visual Design"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/eyewear-campaign-identity.avif",
      webp: "/works/eyewear-campaign-identity.webp",
      fallback: "/works/eyewear-campaign-identity.png",
    },
  },
  {
    slug: "fitness-product-branding",
    title: "Fitness Product Branding",
    description:
      "A bold and powerful brand direction developed for a premium home fitness gear brand.",
    fullDescription:
      "A brand identity built around energetic red-orange tones and blocky, motivational typography for a premium home fitness gear brand. The system included hero product pages, infographic-style spec callouts and lifestyle imagery balancing product and human expression. It supported strong sales during product drops and improved conversion on landing pages.",
    type: "Client Project",
    category: "Branding",
    tags: ["Brand Identity", "Product Marketing"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/fitness-product-branding.avif",
      webp: "/works/fitness-product-branding.webp",
      fallback: "/works/fitness-product-branding.png",
    },
  },
  {
    slug: "cryptocurrency-app",
    title: "Cryptocurrency App",
    description:
      "A professional, mobile-first crypto trading platform built for simplicity, speed, and user confidence.",
    fullDescription:
      "A mobile-first crypto trading interface designed for gesture-friendly, fast actions, with a blue/yellow/black palette chosen to communicate financial trust and urgency. It included a live dashboard covering exchange, wallet and market-watch views with real-time updates, volatility alerts, and quick send, receive, trade and convert actions. The app launched to strong user adoption and retention.",
    type: "Client Project",
    category: "Mobile App",
    tags: ["App Design", "Fintech UI"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/cryptocurrency-app.avif",
      webp: "/works/cryptocurrency-app.webp",
      fallback: "/works/cryptocurrency-app.png",
    },
  },
  {
    slug: "real-estate-website",
    title: "Real Estate Website",
    description:
      "A modern, elegant real estate website built to showcase premium properties and offer a seamless property search experience.",
    fullDescription:
      "A premium real estate platform with a clean, whitespace-driven UI, an intuitive property browsing and filtering flow, and detailed listing pages covering features, amenities, map views and agent contact. Built-in inquiry forms and conversion-focused CTAs were designed to turn browsing into leads. The site helped elevate the brand's positioning and improved inquiry rates.",
    type: "Client Project",
    category: "Website",
    tags: ["Web Design", "Lead Generation"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/real-estate-website.avif",
      webp: "/works/real-estate-website.webp",
      fallback: "/works/real-estate-website.png",
    },
  },
  {
    slug: "cricket-live-app",
    title: "Cricket Live App",
    description:
      "A mobile-first cricket app that delivers real-time match updates, player stats, and allows users to host and broadcast their own matches live to followers.",
    fullDescription:
      "A community-driven cricket app combining live professional match coverage with tools for fans and amateur players to host and broadcast their own matches. The design centres on a real-time match feed, rich player profiles with career stats and highlights, and a minimalist layout built for fast access to scores. It became a platform for both spectators and player-broadcasters, increasing community interaction.",
    type: "Client Project",
    category: "Mobile App",
    tags: ["App Design", "Live Sports"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/cricket-live-app.avif",
      webp: "/works/cricket-live-app.webp",
      fallback: "/works/cricket-live-app.png",
    },
  },
  {
    slug: "accounting-desktop-app",
    title: "Accounting Desktop App",
    description:
      "A comprehensive desktop accounting app designed to help businesses manage clients, invoices, and transactions with ease.",
    fullDescription:
      "A desktop accounting application built around a professional financial dashboard, a dedicated client-management module covering contact details, transaction history and documents, and simplified invoicing, payment tracking and reporting. The interface prioritises legible typography and clear data presentation so day-to-day accounting tasks stay easy to follow. It helped businesses streamline accounting processes and reduce manual errors.",
    type: "Client Project",
    category: "Desktop App",
    tags: ["App Design", "Financial Tools"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/accounting-desktop-app.avif",
      webp: "/works/accounting-desktop-app.webp",
      fallback: "/works/accounting-desktop-app.png",
    },
  },
  {
    slug: "playful-toy-branding",
    title: "Playful Toy Branding",
    description:
      "A fun and vibrant brand identity system crafted to spark imagination in young minds and trust among parents.",
    fullDescription:
      "An educational toy brand identity built around playful, rounded typography, a custom character system, and a bold, balanced colour palette. The system extended across packaging, billboards, ID cards, merchandise and digital assets, with a flexible design language built to scale across marketing, packaging and events. It supported multiple product launches with cohesive storytelling and improved engagement among parent communities.",
    type: "Client Project",
    category: "Branding",
    tags: ["Brand Identity", "Packaging"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/playful-toy-branding.avif",
      webp: "/works/playful-toy-branding.webp",
      fallback: "/works/playful-toy-branding.png",
    },
  },
  {
    slug: "skincare-identity-design",
    title: "Skincare Identity Design",
    description:
      "A clean and calming brand identity created for a nature-inspired skincare line.",
    fullDescription:
      "A soothing, trust-centric brand identity for a nature-inspired skincare line, using muted green tones, whitespace and botanical visual cues to convey purity and self-care. The system covered landing-page hero sections, shop modules, packaging visuals and callout labels such as \"Vegan\" and \"Naturally Derived\". It improved online trust and increased product-page retention.",
    type: "Client Project",
    category: "Branding",
    tags: ["Brand Identity", "Packaging"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/skincare-identity-design.avif",
      webp: "/works/skincare-identity-design.webp",
      fallback: "/works/skincare-identity-design.png",
    },
  },
  {
    slug: "food-delivery-branding",
    title: "Food Delivery Branding",
    description:
      "A warm, inviting branding system designed for a modern food delivery experience.",
    fullDescription:
      "A branding system for a modern food-delivery service, built around a soft, warm palette, a friendly rounded icon set, and typography chosen for modern simplicity. It covered mobile-app screens for onboarding, menus and checkout, a distinct brand font and colour system, and structured cards for featured restaurants and menus. The new branding helped position the service as a premium yet personal option and improved new-user conversion.",
    type: "Client Project",
    category: "Branding",
    tags: ["Brand Identity", "App Design"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/food-delivery-branding.avif",
      webp: "/works/food-delivery-branding.webp",
      fallback: "/works/food-delivery-branding.png",
    },
  },
  {
    slug: "streaming-service-identity",
    title: "Streaming Service Identity",
    description:
      "A playful and retro-inspired identity system crafted for a streaming content brand.",
    fullDescription:
      "A retro-inspired, Gen Z–facing identity for a streaming content brand, combining a muted retro colour palette with nostalgic visual motifs and a flexible component system for both app and out-of-home media. The system included OTT app onboarding and home-screen previews, campaign mockups spanning bus ads and merchandise, and shareable character-driven visuals. The refresh drove strong engagement and social shares among younger audiences.",
    type: "Client Project",
    category: "Branding",
    tags: ["Brand Identity", "App Design"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/streaming-service-identity.avif",
      webp: "/works/streaming-service-identity.webp",
      fallback: "/works/streaming-service-identity.png",
    },
  },
  {
    slug: "trading-platform",
    title: "Trading Platform",
    description:
      "A comprehensive trading and investment app designed to empower users with insights, tools, and real-time market access.",
    fullDescription:
      "A trading and investment application for both novice and experienced investors, built around a dark, high-contrast interface optimised for prolonged use and fast decision-making. Interactive prototypes let stakeholders test core flows (stock purchasing, watchlist tracking and order history) before development, and the mobile-first layout leans on gesture-based, thumb-friendly navigation. Live market data, portfolio breakdowns and trigger-based alerts round out the feature set; the app was well received during stakeholder testing.",
    type: "Client Project",
    category: "Web App",
    tags: ["App Design", "Fintech UI"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/trading-platform.avif",
      webp: "/works/trading-platform.webp",
      fallback: "/works/trading-platform.png",
    },
  },
  {
    slug: "automotive-services",
    title: "Automotive Services",
    description:
      "A user-friendly car care platform that allows users to schedule, manage, and track vehicle services through a sleek mobile app.",
    fullDescription:
      "A car-care booking platform letting users schedule detailing, maintenance and repairs from their phone in under three taps, with icon-based service categories and real-time status tracking from technician arrival through completion. Geo-aware design helps users find nearby service providers, and a loyalty system rewards repeat customers. The app boosted booking rates by 65% and became a preferred digital channel for users.",
    type: "Client Project",
    category: "Mobile App",
    tags: ["App Design", "Booking & Scheduling"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/automotive-services.avif",
      webp: "/works/automotive-services.webp",
      fallback: "/works/automotive-services.png",
    },
  },
  {
    slug: "accounting-mobile-app",
    title: "Accounting Mobile App",
    description:
      "A user-friendly mobile accounting app designed to simplify financial tracking and provide clear insights for small businesses.",
    fullDescription:
      "A mobile accounting app for small businesses, built around a minimal UI, clean typography and touch-first, gesture-friendly navigation. It presents a monthly summary of transactions and balances alongside interactive charts tracking income, expense and spending patterns, with quick access to core features through a persistent bottom nav. The app improved financial awareness and reduced the friction of everyday bookkeeping.",
    type: "Client Project",
    category: "Mobile App",
    tags: ["App Design", "Financial Tools"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/accounting-mobile-app.avif",
      webp: "/works/accounting-mobile-app.webp",
      fallback: "/works/accounting-mobile-app.png",
    },
  },
  {
    slug: "e-commerce-store",
    title: "E-commerce Store",
    description:
      "A modern e-commerce platform offering unbeatable variety and value, all in one convenient digital experience.",
    fullDescription:
      "A large-catalogue e-commerce experience spanning categories from groceries to electronics, built around a product-first browsing interface with dynamic filtering by category, brand and price, a real-time cart with contextual promotions, and mobile-optimised checkout with saved-card payment options and order tracking. The app increased online conversions by 43% and reduced cart abandonment by 28%.",
    type: "Client Project",
    category: "Web App",
    tags: ["App Design", "E-commerce"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/e-commerce-store.avif",
      webp: "/works/e-commerce-store.webp",
      fallback: "/works/e-commerce-store.png",
    },
  },
  {
    slug: "digital-design-agency",
    title: "Digital Design Agency",
    description:
      "A modern and professional website designed to enhance user experience and communicate brand value effectively.",
    fullDescription:
      "A responsive website for a creative digital agency, built around clean layouts, refined typography and a structured homepage covering services, about and contact sections. The site was optimised for fast loading and smooth performance across desktop, tablet and mobile, with a strong visual identity built to convey professionalism and innovation. It contributed to improved brand perception and increased lead generation.",
    type: "Client Project",
    category: "Website",
    tags: ["Web Design", "Brand Identity"],
    technologies: [],
    services: [],
    thumbnail: {
      avif: "/works/digital-design-agency.avif",
      webp: "/works/digital-design-agency.webp",
      fallback: "/works/digital-design-agency.png",
    },
  },

];

/**
 * Priority-first, then original array order (a stable sort, so ties never
 * reshuffle). Every consumer — the homepage's `FEATURED_COUNT` slice,
 * `WorksGrid`, `generateStaticParams`, the sitemap — reads from this export,
 * not `allProjects`, so the ordering is enforced once rather than re-applied
 * (or forgotten) at each call site.
 */
export const projects: Project[] = [...allProjects].sort(
  (a, b) => (a.priority ?? Infinity) - (b.priority ?? Infinity),
);
