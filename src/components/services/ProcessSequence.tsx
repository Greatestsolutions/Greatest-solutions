"use client";

import { MotionConfig, motion } from "motion/react";
import { fadeUpTight, inView } from "@/lib/motion";

/**
 * The bolded 4-step line in the services intro — split so the sequence
 * visibly builds left to right on scroll-in instead of arriving as one
 * block, and so each phase can carry its own hover state.
 *
 * `reducedMotion="user"` on `MotionConfig`: without it, `prefers-reduced-motion`
 * users would still get the `y`-offset entrance and, if their browser paints
 * the `whileInView` "hidden" frame first, a global stylesheet rule
 * suppressing motion could leave content stuck at its hidden opacity instead
 * of just skipping straight to visible — this makes motion/react resolve
 * that itself rather than reimplementing the check by hand.
 */
const PHASES = [
  "Human strategy",
  "AI-powered execution",
  "Human quality control",
  "Measurable results",
] as const;

/**
 * Each phase and its trailing arrow gets its own explicit delay rather than
 * leaning on `stagger()`'s parent-orchestrated `staggerChildren` — measured
 * that path directly and every child animated in exact lockstep (byte-identical
 * opacity every sampled frame), so orchestration wasn't actually reaching
 * these children through the plain `<span>` grouping wrapper below. A flat
 * per-child delay sidesteps that: it only depends on `transition.delay`,
 * which composes normally regardless of propagation.
 */
const STEP = 0.08;

/** A label-only parent variant — no properties of its own, just enough for
 * `whileInView="show"` to give descendants a "show" state to animate toward. */
const container = { hidden: {}, show: {} };

export function ProcessSequence() {
  return (
    <MotionConfig reducedMotion="user">
      <motion.p
        className="text-body-lg font-medium text-ink"
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={container}
      >
        {PHASES.map((phase, i) => (
          <span key={phase}>
            <motion.span
              variants={fadeUpTight(i * STEP)}
              className="inline-block cursor-default transition-colors duration-[var(--duration-quick)] ease-[var(--ease-brand)] hover:text-brand-emerald"
            >
              {phase}
            </motion.span>
            {i < PHASES.length - 1 && (
              <motion.span
                variants={fadeUpTight((i + 0.5) * STEP)}
                /* `mx-1` for a guaranteed visual gap — a bare literal space
                   inside an `inline-block` isn't reliably rendered at full
                   width by every engine, so the margin carries the spacing
                   and the space characters below stay only for accessible
                   text/copy-paste fidelity with the original line. */
                className="mx-1 inline-block motion-safe:animate-[gst-arrow-flow_2.6s_ease-in-out_infinite] motion-reduce:animate-none"
              >
                {" → "}
              </motion.span>
            )}
          </span>
        ))}
      </motion.p>
    </MotionConfig>
  );
}
