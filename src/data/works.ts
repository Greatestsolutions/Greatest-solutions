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
 * `priority` 1–29 deliberately INTERLEAVES the 14 video entries and 15 Baytix
 * entries rather than grouping them into two blocks — the client wants the
 * `/works` grid to read as one mixed body of work, not "videos, then web
 * apps." Positions 1–6 are a specific hand-picked sequence (Work 1, Work 2,
 * one Baytix entry, Work 3, a second Baytix entry, Work 4) matching the
 * "View more" batch size, so that's exactly what a visitor sees before ever
 * clicking it. Positions 7–29 mix the remaining 10 videos and 13 Baytix
 * entries in a fixed, deliberately-chosen order — genuinely mixed (no run
 * longer than two of the same type) but NOT re-randomized per request: a
 * `/works` page whose order changes between page loads (or between the
 * initial load and a "View more" click) fights Next.js's static rendering
 * and can duplicate or drop entries from the paginated view. This is a
 * one-time deliberate shuffle, not an algorithm — reordering the mix further
 * is a matter of editing these numbers directly, the same as any other
 * priority value on this array. See `Works.tsx` for why the homepage's own
 * featured selection does NOT simply take the first 4 of this order.
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
 * and {@link VideoModal} — see `WorksGrid.tsx`.
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
  /**
   * Slugs from `services.ts`, for `/works`' quick-search chips
   * (`WorksIndex.tsx`) — deliberately separate from `services` above rather
   * than reusing it. `services` is a formal "this work was delivered as an
   * instance of that packaged service" claim, which is why it's empty on
   * every video work (portfolio/demo pieces, not commissioned engagements —
   * see that field's own history). `serviceTags` is a looser browsing
   * category — "a visitor clicking this service's name would reasonably
   * expect to find this work" — so it can be populated more broadly (e.g.
   * every AI-produced video work tagged `ai-video-ugc`) without also
   * retroactively claiming those were paid `ai-video-ugc` engagements.
   * Still real matches only, never a loose thematic guess: omitted/empty for
   * any work with no clear, specific connection to a real service.
   */
  serviceTags?: string[];
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
   * their original array order (the sort below is stable). This is `/works`'
   * own ordering signal — a deliberate mix of video and Baytix entries (see
   * the top-of-file doc comment).
   *
   * `featured?: boolean` briefly lived here too, for the homepage's old
   * "Featured Work" teaser to pick its 4 cards independently of this field.
   * That teaser is gone — replaced by a services-based "Solutions" section,
   * `sections/Solutions.tsx` — so nothing reads `featured` anymore; removed
   * rather than left as unread dead weight, the same call made about it once
   * before. If a future homepage section ever needs to curate Works entries
   * again independently of `priority`, that's the precedent for how.
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

const allProjects: Project[] = [
  /* ---------------------------------------------------------------------- *
   * Real featured-work videos, supplied directly by the client along with
   * their real titles, descriptions and thumbnails (`AI_Video_Portfolio_Data
   * _Sheet 3.docx`, relocated to `docs/` once ingested — see that file for
   * the verbatim source text). This replaces an earlier, purely
   * filename-derived import of a smaller local video set.
   *
   * These 14 entries are kept together here purely for authoring
   * convenience — grouping the client's own data together on the page — but
   * their `priority` values are NOT sequential and do NOT keep them grouped
   * on either card surface: `/works` deliberately interleaves them with the
   * Baytix entries below (see the top-of-file doc comment for why), so array
   * position and `priority` intentionally disagree here.
   *
   * `description`/`fullDescription` are the client's own "Description" and
   * "Creative POV" text verbatim (concatenated for `fullDescription`, not
   * paraphrased). `technologies` carries only what the sheet's own
   * "Tools / Credits" line named for that entry — most entries have none, so
   * it stays empty rather than guessing. `services`/`tags` are left empty on
   * all 14: nothing in the sheet names a specific commissioned service
   * engagement (these are portfolio/demo pieces, not client deliverables),
   * matching exactly how the prior video import handled the same question.
   *
   * Work 10 ("Baytix Forms: AI Creative Ad") names its own client in the
   * sheet — coincidentally sharing the word "Baytix" with this file's
   * unrelated baytix.net portfolio import below. Same word, two unrelated
   * things: one is a client name, the other is a source site.
   * ---------------------------------------------------------------------- */

  {
    slug: "classic-royal-fantasy",
    title: "A Classic Royal Fantasy",
    description:
      "A mysterious prince arrives at the royal palace with gifts no one expects. This short fantasy-comedy blends epic palace visuals, dramatic entrances and absurd gift reveals (blue pottery, birds in golden cages, tiny ceremonial cups), with exaggerated reactions from the royal advisers.",
    fullDescription:
      "A mysterious prince arrives at the royal palace with gifts no one expects. This short fantasy-comedy blends epic palace visuals, dramatic entrances and absurd gift reveals (blue pottery, birds in golden cages, tiny ceremonial cups), with exaggerated reactions from the royal advisers. A playful parody of classic Aladdin-style tales: grand scale played for laughs. Proves AI can deliver comedic timing and a strong visual identity without a traditional studio pipeline.",
    type: "Client Project",
    category: "Short Film",
    tags: [],
    technologies: ["Veo 3"],
    services: [],
    priority: 1,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/classic-royal-fantasy.avif", webp: "/works/video/classic-royal-fantasy.webp", fallback: "/works/video/classic-royal-fantasy.png" },
    media: {
      type: "video",
      src: "/works/video/classic-royal-fantasy.mp4",
      poster: { avif: "/works/video/classic-royal-fantasy.avif", webp: "/works/video/classic-royal-fantasy.webp", fallback: "/works/video/classic-royal-fantasy.png" },
    },
  },
  {
    slug: "future-minds",
    title: "FUTURE MINDS",
    description:
      "A psychological sci-fi concept where war doesn't happen outside, but inside your own mind. Built over 7 days, from concept to visuals to execution.",
    fullDescription:
      "A psychological sci-fi concept where war doesn't happen outside, but inside your own mind. Built over 7 days, from concept to visuals to execution. An experiment in blending AI, storytelling and cinematic design. Most people use AI to make more content; this piece aims to make better content, with series potential.",
    type: "Client Project",
    category: "Video",
    tags: [],
    technologies: ["Kling 2.6"],
    services: [],
    priority: 2,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/future-minds.avif", webp: "/works/video/future-minds.webp", fallback: "/works/video/future-minds.png" },
    media: {
      type: "video",
      src: "/works/video/future-minds.mp4",
      poster: { avif: "/works/video/future-minds.avif", webp: "/works/video/future-minds.webp", fallback: "/works/video/future-minds.png" },
    },
  },
  {
    slug: "ruru",
    title: "RURU | An Original AI Short Film",
    description:
      "A small robotic traveler crash-lands on Earth long after the last humans are gone. He teleports between locations using pearls stored in his body and slowly realizes the world has moved on without people, confirmed by a single dead screen in Times Square.",
    fullDescription:
      "A small robotic traveler crash-lands on Earth long after the last humans are gone. He teleports between locations using pearls stored in his body and slowly realizes the world has moved on without people, confirmed by a single dead screen in Times Square. Quiet, dialogue-free and emotional, with no doomsday tone. A test of studio-level craft: consistent character design, cinematic continuity and pacing. Made in about 4 hours by Acidic Studios.",
    type: "Client Project",
    category: "AI Short Film",
    tags: [],
    technologies: ["Seedance 2.5", "Higgsfield AI"],
    services: [],
    priority: 4,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/ruru.avif", webp: "/works/video/ruru.webp", fallback: "/works/video/ruru.png" },
    media: {
      type: "video",
      src: "/works/video/ruru.mp4",
      poster: { avif: "/works/video/ruru.avif", webp: "/works/video/ruru.webp", fallback: "/works/video/ruru.png" },
    },
  },
  {
    slug: "after-blinders",
    title: "AFTER BLINDERS",
    description:
      "An AI reimagining of the dark, cinematic world of The Immortal Man, rebuilt as a trailer through AI workflows: mood, atmosphere, characters, storytelling and trailer-level visuals.",
    fullDescription:
      "An AI reimagining of the dark, cinematic world of The Immortal Man, rebuilt as a trailer through AI workflows: mood, atmosphere, characters, storytelling and trailer-level visuals. Not a copy, but an experiment in capturing tension: smoke, silence, streets, emotion and cinematic weight. Asks how far imagination can go when production limits disappear.",
    type: "Client Project",
    category: "Trailer",
    tags: [],
    technologies: [],
    services: [],
    priority: 6,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/after-blinders.avif", webp: "/works/video/after-blinders.webp", fallback: "/works/video/after-blinders.png" },
    media: {
      type: "video",
      src: "/works/video/after-blinders.mp4",
      poster: { avif: "/works/video/after-blinders.avif", webp: "/works/video/after-blinders.webp", fallback: "/works/video/after-blinders.png" },
    },
  },
  {
    slug: "flower-robot",
    title: "Flower Robot",
    description: "A cinematic, Netflix-style video centred on a robot character and flower imagery.",
    fullDescription:
      "A cinematic, Netflix-style video centred on a robot character and flower imagery. Premium streaming-quality visuals: a delicate, organic subject treated with the polish of a high-end series.",
    type: "Client Project",
    category: "Video",
    tags: [],
    technologies: [],
    services: [],
    priority: 8,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/flower-robot.avif", webp: "/works/video/flower-robot.webp", fallback: "/works/video/flower-robot.png" },
    media: {
      type: "video",
      src: "/works/video/flower-robot.mp4",
      poster: { avif: "/works/video/flower-robot.avif", webp: "/works/video/flower-robot.webp", fallback: "/works/video/flower-robot.png" },
    },
  },
  {
    slug: "90s-love-story-train",
    title: "This Entire Short Film Was Created by AI: A 90s Love Story on a Train",
    description:
      "An emotional short about falling in love in the era of walkmans, payphones and no internet, brought to life entirely with AI.",
    fullDescription:
      "An emotional short about falling in love in the era of walkmans, payphones and no internet, brought to life entirely with AI. Technology meets nostalgia. Shows AI can carry warmth and human emotion, not just spectacle.",
    type: "Client Project",
    category: "Short Film",
    tags: [],
    technologies: [],
    services: [],
    priority: 10,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/90s-love-story-train.avif", webp: "/works/video/90s-love-story-train.webp", fallback: "/works/video/90s-love-story-train.png" },
    media: {
      type: "video",
      src: "/works/video/90s-love-story-train.mp4",
      poster: { avif: "/works/video/90s-love-story-train.avif", webp: "/works/video/90s-love-story-train.webp", fallback: "/works/video/90s-love-story-train.png" },
    },
  },
  {
    slug: "rattlesnake-gospel",
    title: "THE RATTLESNAKE GOSPEL: A Tale of Snake Oil & the Selling of Hope",
    description:
      "A cinematic Wild West prologue following a traveling salesman whose promises sound like salvation to farmers, miners, mothers and the sick. Set beneath a burning sunset, with wagon wheels and fiddle strings.",
    fullDescription:
      "A cinematic Wild West prologue following a traveling salesman whose promises sound like salvation to farmers, miners, mothers and the sick. Set beneath a burning sunset, with wagon wheels and fiddle strings. What if the West was built on belief rather than gold? Explores persuasion, myth-making and how stories shape decisions, asking whether we're still buying the same promises in new packaging.",
    type: "Client Project",
    category: "Video",
    tags: [],
    technologies: [],
    services: [],
    priority: 13,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/rattlesnake-gospel.avif", webp: "/works/video/rattlesnake-gospel.webp", fallback: "/works/video/rattlesnake-gospel.png" },
    media: {
      type: "video",
      src: "/works/video/rattlesnake-gospel.mp4",
      poster: { avif: "/works/video/rattlesnake-gospel.avif", webp: "/works/video/rattlesnake-gospel.webp", fallback: "/works/video/rattlesnake-gospel.png" },
    },
  },
  {
    slug: "blue-tick",
    title: "Blue Tick",
    description: "An AI horror short made to test whether visuals alone can deliver real fear and real emotion.",
    fullDescription:
      "An AI horror short made to test whether visuals alone can deliver real fear and real emotion. AI video is at the stage VFX was when it first appeared: not yet trusted. The goal is videos so good people forget AI made them and focus on the story. Produced by Acidic Studios.",
    type: "Client Project",
    category: "Short Film",
    tags: [],
    technologies: ["Claude", "Higgsfield AI"],
    services: [],
    priority: 15,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/blue-tick.avif", webp: "/works/video/blue-tick.webp", fallback: "/works/video/blue-tick.png" },
    media: {
      type: "video",
      src: "/works/video/blue-tick.mp4",
      poster: { avif: "/works/video/blue-tick.avif", webp: "/works/video/blue-tick.webp", fallback: "/works/video/blue-tick.png" },
    },
  },
  {
    slug: "bar-attack",
    title: "Bar Attack",
    description: "A bar-set action scene.",
    fullDescription:
      "A bar-set action scene. High-energy, tension-driven staging that turns a confined location into a dynamic set piece.",
    type: "Client Project",
    category: "Video",
    tags: [],
    technologies: [],
    services: [],
    priority: 17,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/bar-attack.avif", webp: "/works/video/bar-attack.webp", fallback: "/works/video/bar-attack.png" },
    media: {
      type: "video",
      src: "/works/video/bar-attack.mp4",
      poster: { avif: "/works/video/bar-attack.avif", webp: "/works/video/bar-attack.webp", fallback: "/works/video/bar-attack.png" },
    },
  },
  {
    slug: "baytix-forms",
    title: "Baytix Forms: AI Creative Ad",
    client: "Baytix Forms",
    description: "An AI-generated creative advertisement for Baytix Forms",
    fullDescription:
      "An AI-generated creative advertisement for Baytix Forms. Shows AI-driven video works for brand and product messaging, with a clean, attention-grabbing look at a fraction of traditional ad production cost.",
    type: "Client Project",
    category: "Ad",
    tags: [],
    technologies: [],
    services: [],
    priority: 19,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/baytix-forms.avif", webp: "/works/video/baytix-forms.webp", fallback: "/works/video/baytix-forms.png" },
    media: {
      type: "video",
      src: "/works/video/baytix-forms.mp4",
      poster: { avif: "/works/video/baytix-forms.avif", webp: "/works/video/baytix-forms.webp", fallback: "/works/video/baytix-forms.png" },
    },
  },
  {
    slug: "after-dunes",
    title: "AFTER DUNES | AI Trailer",
    description:
      "A cinematic AI trailer imagining humanity's return to the sands after the events of Dune: a mysterious future buried beneath endless deserts, forgotten civilizations and the echoes of a lost empire.",
    fullDescription:
      "A cinematic AI trailer imagining humanity's return to the sands after the events of Dune: a mysterious future buried beneath endless deserts, forgotten civilizations and the echoes of a lost empire. Post-apocalyptic world-building: what comes after the fall. Created entirely with AI tools, combining storytelling, visual design and cinematic scale.",
    type: "Client Project",
    category: "Trailer",
    tags: [],
    technologies: [],
    services: [],
    priority: 22,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/after-dunes.avif", webp: "/works/video/after-dunes.webp", fallback: "/works/video/after-dunes.png" },
    media: {
      type: "video",
      src: "/works/video/after-dunes.mp4",
      poster: { avif: "/works/video/after-dunes.avif", webp: "/works/video/after-dunes.webp", fallback: "/works/video/after-dunes.png" },
    },
  },
  {
    slug: "dont-come-back-sam",
    title: "Don't Come Back, Sam",
    description:
      "An indie neo-western music video on a sun-bleached desert highway, inspired by 1970s–80s Americana. Sam cruises in a red Mercedes convertible, eats roadside donuts, jams with a cobweb-draped jazz band and waves at eccentric villagers, building to a moody tunnel climax.",
    fullDescription:
      "An indie neo-western music video on a sun-bleached desert highway, inspired by 1970s–80s Americana. Sam cruises in a red Mercedes convertible, eats roadside donuts, jams with a cobweb-draped jazz band and waves at eccentric villagers, building to a moody tunnel climax. A visual love letter to vintage Americana and the pull of the open road: happy on the surface, emotionally layered underneath. Themes of freedom, identity and escape.",
    type: "Client Project",
    category: "Music Video",
    tags: [],
    technologies: [],
    services: [],
    priority: 24,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/dont-come-back-sam.avif", webp: "/works/video/dont-come-back-sam.webp", fallback: "/works/video/dont-come-back-sam.png" },
    media: {
      type: "video",
      src: "/works/video/dont-come-back-sam.mp4",
      poster: { avif: "/works/video/dont-come-back-sam.avif", webp: "/works/video/dont-come-back-sam.webp", fallback: "/works/video/dont-come-back-sam.png" },
    },
  },
  {
    slug: "the-bank-robbery",
    title: "THE BANK ROBBERY | AI Trailer",
    description:
      "An RDR2-inspired short trailer set in London, 1890, where the grit of the Wild West collides with industrial shadows. A story of outlaws, fire and freedom.",
    fullDescription:
      "An RDR2-inspired short trailer set in London, 1890, where the grit of the Wild West collides with industrial shadows. A story of outlaws, fire and freedom. Dark, moody and raw: more than a heist, it's survival. A genre mash-up that gives a Western sensibility a Victorian city backdrop.",
    type: "Client Project",
    category: "Trailer",
    tags: [],
    technologies: [],
    services: [],
    priority: 27,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/the-bank-robbery.avif", webp: "/works/video/the-bank-robbery.webp", fallback: "/works/video/the-bank-robbery.png" },
    media: {
      type: "video",
      src: "/works/video/the-bank-robbery.mp4",
      poster: { avif: "/works/video/the-bank-robbery.avif", webp: "/works/video/the-bank-robbery.webp", fallback: "/works/video/the-bank-robbery.png" },
    },
  },
  {
    slug: "throne-of-blood",
    title: "THRONE OF BLOOD: A War Epic Reimagined by AI",
    description:
      "A trailer fully generated by AI, bringing an ancient war saga to life with brutal history and cinematic power.",
    fullDescription:
      "A trailer fully generated by AI, bringing an ancient war saga to life with brutal history and cinematic power. Asks what an ancient war epic looks like reborn through AI, and whether audiences would watch a full film like it.",
    type: "Client Project",
    category: "Trailer",
    tags: [],
    technologies: [],
    services: [],
    priority: 29,
    serviceTags: ["ai-video-ugc"],
    thumbnail: { avif: "/works/video/throne-of-blood.avif", webp: "/works/video/throne-of-blood.webp", fallback: "/works/video/throne-of-blood.png" },
    media: {
      type: "video",
      src: "/works/video/throne-of-blood.mp4",
      poster: { avif: "/works/video/throne-of-blood.avif", webp: "/works/video/throne-of-blood.webp", fallback: "/works/video/throne-of-blood.png" },
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
    priority: 3,
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
    priority: 5,
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
    priority: 7,
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
    priority: 9,
    serviceTags: ["web-development"],
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
    priority: 11,
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
    priority: 12,
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
    priority: 14,
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
    priority: 16,
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
    priority: 18,
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
    priority: 20,
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
    priority: 21,
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
    priority: 23,
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
    priority: 25,
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
    priority: 26,
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
    priority: 28,
    serviceTags: ["web-development"],
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
