import type { ImageSource } from "@/types/media";

/**
 * "How we work" — the three-step process. `Section - Progress` in the reference.
 *
 * Renamed `process` here because the project already has a `ProgressDial` in the
 * services choreography, and two unrelated "progress" concepts in one codebase is
 * a maintenance trap. The Framer name is recorded above so the mapping stays
 * traceable.
 *
 * Icons are the reference's 3D renders, downloaded once and served from `/icons`
 * — see `scripts/build-image-assets.mjs`. They restate the step name and carry no
 * information the heading does not, so they render with an empty `alt`.
 *
 * The three steps were rewritten from the reference's generic "Discovery /
 * Design & Architecture / Build & Ship" software-delivery language, which
 * described the site's earlier positioning as a general dev agency and now
 * contradicts the AI-services model established everywhere else. They compress
 * the same six-step human+AI loop `AiHumanWorkflow` runs on every service page
 * (human strategy → AI-assisted production → human review & QA → client
 * approval → implementation → optimization) into three broader phases sized
 * for a homepage summary rather than restate the fuller version — same model,
 * same claims, coarser grain. No timeline, team size or metric is stated here
 * that isn't already established elsewhere on the site.
 */
export interface ProcessStep {
  title: string;
  description: string;
  icon: ImageSource;
  /** Intrinsic size of the source PNG, needed to reserve space. */
  iconSize: number;
}

const icon = (name: string, formats: ("avif" | "webp")[]): ImageSource => ({
  // Only the formats the build actually produced: below ~4 KB an AVIF or WebP
  // can come out larger than the PNG, and the pipeline drops those rather than
  // ship a bigger "optimised" file.
  avif: formats.includes("avif") ? `/icons/${name}.avif` : undefined,
  webp: formats.includes("webp") ? `/icons/${name}.webp` : undefined,
  fallback: `/icons/${name}.png`,
});

export const processSteps: ProcessStep[] = [
  {
    title: "Strategy & Scope",
    description:
      "A specialist maps the problem, defines the plan, and sets what AI will and won't touch before any work begins.",
    icon: icon("discovery", ["avif", "webp"]),
    iconSize: 144,
  },
  {
    title: "AI-Powered Build",
    description:
      "AI accelerates drafting and production while a specialist directs the work throughout, not just at the end.",
    icon: icon("strategy", ["avif", "webp"]),
    iconSize: 184,
  },
  {
    title: "Human QA & Launch",
    description:
      "Every output is checked for accuracy, quality and brand fit, then approved by you before it ships, with monitoring after launch.",
    // webp came out larger than the png for this one and was dropped.
    icon: icon("design", ["avif"]),
    iconSize: 184,
  },
];

export const processEyebrow = "How we work";
export const processTitle = ["From Problem", "to Production"] as const;
