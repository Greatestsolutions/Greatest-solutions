"use client";

import { MotionConfig, motion } from "motion/react";
import { fadeUpTight, inView } from "@/lib/motion";

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
            variants={fadeUpTight(i * STEP)}
            className="flex items-start gap-3 text-body-lg text-body"
          >
            <span
              aria-hidden="true"
              className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand-emerald/12"
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
