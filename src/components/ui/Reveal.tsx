"use client";

import type { ReactNode } from "react";
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
 */
export function Reveal({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={reduced ? noReveal : fadeUp()}
        className={className}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
