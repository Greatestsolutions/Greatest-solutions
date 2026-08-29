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
    title: "Discovery",
    description:
      "Understanding the problem, requirements, constraints and systems involved before development begins.",
    icon: icon("discovery", ["avif", "webp"]),
    iconSize: 144,
  },
  {
    title: "Design & Architecture",
    description:
      "Planning interfaces, user experiences and technical foundations before building the product.",
    icon: icon("strategy", ["avif", "webp"]),
    iconSize: 184,
  },
  {
    title: "Build & Ship",
    description:
      "Developing, testing and delivering software in reviewable increments with documentation and support.",
    // webp came out larger than the png for this one and was dropped.
    icon: icon("design", ["avif"]),
    iconSize: 184,
  },
];

export const processEyebrow = "How we work";
export const processTitle = ["From Problem", "to Production"] as const;
