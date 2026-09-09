"use client";

import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { fadeUpTight, inView, noReveal } from "@/lib/motion";

/**
 * The deliverables checklist, revealed one line at a time as it scrolls in.
 *
 * A checklist is the one section where a stagger is more than decoration: the
 * items arrive in the order they are read, so the reveal traces the reading path
 * instead of dropping a block of text in at once. The step is small enough that
 * a seven-item list finishes well before the eye reaches the bottom.
 *
 * The tick is drawn rather than a character, so its weight matches the site's
 * other strokes instead of inheriting whatever the font ships.
 */
const STEP = 0.06;
const container = { hidden: {}, show: {} };

export function DeliverablesList({ items }: { items: string[] }) {
  /* `reducedMotion="user"` still fades opacity; this drops the reveal
     outright so the list renders complete on the first frame. */
  const reduced = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={container}
        className="grid gap-x-8 gap-y-3 tablet:grid-cols-2"
      >
        {items.map((item, i) => (
          <motion.li
            key={item}
            variants={reduced ? noReveal : fadeUpTight(i * STEP)}
            className="flex items-start gap-3 text-body-lg text-body"
          >
            {/*
              The disc is `bg-surface` + `--shadow-pill`, the same recipe every
              other round mark on the site uses (the Process icon discs, the
              contact dialog's close control). It was a flat `emerald/12` fill —
              a colour invented for this one spot, which on the white band this
              section sits on had almost nothing to separate it from the page.
              The shadow is what gives it an edge; the tick keeps the brand
              colour.
            */}
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-surface shadow-pill"
            >
              <svg viewBox="0 0 16 16" className="size-3 text-brand-green" focusable="false">
                <path
                  d="M3 8.5l3 3 7-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {item}
          </motion.li>
        ))}
      </motion.ul>
    </MotionConfig>
  );
}
