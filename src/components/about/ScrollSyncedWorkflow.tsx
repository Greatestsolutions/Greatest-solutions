"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { AiHumanWorkflow } from "@/components/services/AiHumanWorkflow";

const STEP_COUNT = 6;

/**
 * The About-page-only scroll-linked version of the shared `AiHumanWorkflow`.
 *
 * This is the "wrapper/overlay around this one usage" approach `AiHumanWorkflow`'s
 * own doc comment describes: the scroll tracking lives entirely here, and the
 * shared component only gained one optional, default-`null` prop
 * (`activeIndex`) to receive it — nothing about the component's own rendering
 * changed for the nine other pages that still call it with no props at all.
 *
 * `useScroll`'s `target` is this wrapper, so the progress is scoped to the
 * workflow's own height rather than the page's — it starts tracking as the
 * grid's top approaches the viewport and finishes as its bottom clears it,
 * which is what makes the six steps step through in pace with actually
 * scrolling past the six cards instead of the whole page.
 *
 * Reduced motion: the `useScroll` subscription itself is inert (it only ever
 * *reads* scroll position, same as any `onScroll` handler — there's nothing
 * to disable), but `activeIndex` is only ever written when
 * `useReducedMotion()` is false, so a reduced-motion visitor never sees any
 * card highlighted differently than a static render already shows it.
 */
export function ScrollSyncedWorkflow() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.35"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduced) return;
    if (v <= 0 || v >= 1) {
      setActiveIndex(null);
      return;
    }
    setActiveIndex(Math.min(STEP_COUNT - 1, Math.max(0, Math.floor(v * STEP_COUNT))));
  });

  return (
    <div ref={ref}>
      <AiHumanWorkflow activeIndex={reduced ? null : activeIndex} />
    </div>
  );
}
