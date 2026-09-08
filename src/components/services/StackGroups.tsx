"use client";

import { MotionConfig, motion } from "motion/react";
import { Pill } from "@/components/ui/Pill";
import { fadeUpTight, inView } from "@/lib/motion";
import type { ServiceStackGroup } from "@/data/services";

/**
 * The technology stack, grouped by category and rendered as the site's own chips.
 *
 * `Pill` is reused rather than restyled. Its contract is that it carries no
 * interactive state — its own doc records that none of its 38 usages has a hover
 * transition — so the hover here lives on the wrapping `<li>` instead of being
 * added to the component. That keeps every other pill on the site untouched
 * while these still respond to the cursor, the same split `FilterPill` made when
 * it needed a pressed state.
 *
 * The lift is one pixel and the shadow is the existing `--shadow-pill`. A chip
 * is a label, not a button, so the feedback acknowledges the cursor without
 * suggesting there is something to click.
 */
const STEP = 0.08;
const container = { hidden: {}, show: {} };

export function StackGroups({ stack }: { stack: ServiceStackGroup[] }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.dl
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={container}
        /*
          `auto-fit`, not a fixed four columns: services carry between two and
          four stack groups, and a hardcoded `grid-cols-4` strands two empty
          tracks on the ones with two. Auto-fit collapses the empty tracks and
          lets the surviving columns share the row, so every service fills its
          width regardless of how many groups it has.
        */
        className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]"
      >
        {stack.map((group, i) => (
          <motion.div
            key={group.category}
            variants={fadeUpTight(i * STEP)}
            className="flex flex-col gap-3"
          >
            <dt className="flex items-center gap-2 text-body-md font-medium text-ink">
              <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-emerald" />
              {group.category}
            </dt>
            <dd>
              <ul className="flex flex-wrap gap-2">
                {group.tools.map((tool) => (
                  <li
                    key={tool}
                    className={
                      "transition-[transform,box-shadow] duration-[var(--duration-quick)] " +
                      "ease-[var(--ease-brand)] hover:-translate-y-px hover:shadow-pill " +
                      "motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                    }
                  >
                    <Pill>{tool}</Pill>
                  </li>
                ))}
              </ul>
            </dd>
          </motion.div>
        ))}
      </motion.dl>
    </MotionConfig>
  );
}
