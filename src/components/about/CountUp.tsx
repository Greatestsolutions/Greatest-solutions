"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

/**
 * Counts up from 0 to `to` once, the moment it scrolls into view.
 *
 * Not a new fact — this only ever wraps a number the surrounding copy already
 * states in words (the About page's "10", already "Ten services" in the
 * paragraph beside it). It exists to give that already-true figure a
 * satisfying arrival, not to manufacture a number worth counting.
 *
 * `useInView(..., { once: true })` triggers it exactly once; there is no
 * whileInView/exit pairing that could re-run it on a scroll wobble.
 *
 * Reduced motion: the counting animation is skipped entirely — the render
 * itself shows `to` directly rather than routing the final value through the
 * same state the animation would otherwise drive, so there is no counting
 * effect to disable in the first place, only a value.
 */
export function CountUp({ to, className }: { to: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;

    const controls = animate(0, to, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduced, to]);

  return (
    <span ref={ref} className={className}>
      {reduced ? to : display}
    </span>
  );
}
