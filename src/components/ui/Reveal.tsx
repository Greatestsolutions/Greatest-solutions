"use client";

import type { ReactNode } from "react";
import type { Variants } from "motion/react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { fadeUp, inView, noReveal } from "@/lib/motion";

/**
 * A scroll-triggered entrance for a whole block.
 *
 * The thin client boundary that lets a Server Component page give one section an
 * entrance without becoming a client component itself — the same shape
 * `ContactButton` uses for the contact dialog.
 *
 * Self-contained on purpose: it carries its own `initial`, `whileInView` and
 * viewport rather than inheriting a variant from a parent. Variant propagation
 * in this version does not reliably survive plain DOM elements between a motion
 * parent and a motion child (`ProcessSequence` documents measuring exactly that
 * and falling back to explicit per-child delays), so anything that must animate
 * is better off triggering itself.
 *
 * `variant`/`reducedVariant` are optional escape hatches, both defaulting to
 * exactly what this component always did (`fadeUp()`/`noReveal`) — every
 * existing call site (the service detail CTA panel, most of this page) passes
 * neither and is unaffected. They exist so a page with more than one `Reveal`
 * in the same scroll — the About page's "How we work"/"Why AI, why us"
 * columns — can ask for a different preset from `lib/motion.ts` without a
 * second copy of this whole wrapper.
 */
export function Reveal({
  children,
  className,
  variant,
  reducedVariant,
}: {
  children: ReactNode;
  className?: string;
  variant?: Variants;
  reducedVariant?: Variants;
}) {
  const reduced = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={reduced ? (reducedVariant ?? noReveal) : (variant ?? fadeUp())}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
