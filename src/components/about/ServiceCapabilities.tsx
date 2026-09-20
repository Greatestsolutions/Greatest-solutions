"use client";

import Link from "next/link";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { blurFocus, inView, noBlur } from "@/lib/motion";
import type { Service } from "@/data/services";

/**
 * The ten-service grid on the About page, revealed one card at a time as it
 * scrolls in — the same "checklist" reasoning `DeliverablesList` documents:
 * the cards arrive in the order they're read, so the reveal traces the
 * reading path instead of dropping a ten-item block in at once.
 *
 * Titles and descriptions are `service.title`/`service.description` from
 * `services.ts` verbatim — this component only changes how the list arrives
 * on screen and how it responds to a pointer or keyboard, not a word of what
 * it says.
 *
 * Each tile reveals with `blurFocus` rather than `fadeUpTight` — deliberately
 * a different preset from `PortfolioStrip`'s below it, so scrolling through
 * the page doesn't read as the same animation pasted twice.
 *
 * Each tile is now a real link to its own `/services/[slug]` page — not a
 * new page, the same detail page the navbar's Services dropdown already
 * links to — which is what gives the hover/focus treatment somewhere
 * legitimate to land. The hover itself is the works cards' own `glass-sweep`
 * band plus their lift, exactly as used there and on `RoadmapTimeline`'s
 * phase cards, not a new hover language. `group-focus-visible/tile` mirrors
 * `group-hover/tile` throughout so a keyboard user gets the identical cue.
 */
const STEP = 0.05;
const container = { hidden: {}, show: {} };

export function ServiceCapabilities({ services }: { services: Service[] }) {
  const reduced = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={container}
        className="grid gap-4 tablet:grid-cols-2"
      >
        {services.map((service, i) => (
          <motion.li key={service.slug} variants={reduced ? noBlur : blurFocus(i * STEP)}>
            <Link
              href={`/services/${service.slug}`}
              className={
                "group/tile relative flex h-full flex-col gap-1.5 overflow-hidden rounded-[var(--radius-lg)] " +
                "border border-black/8 bg-surface p-5 shadow-hairline " +
                "transition-[transform,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-brand)] " +
                "hover:-translate-y-0.5 hover:shadow-float focus-visible:-translate-y-0.5 focus-visible:shadow-float " +
                "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green " +
                "motion-reduce:transition-none motion-reduce:hover:translate-y-0"
              }
            >
              <h3 className="text-body-lg font-medium text-ink">{service.title}</h3>
              <p className="text-body-md text-body">{service.description}</p>

              {/* The works cards' own glass sweep — same keyframe, same
                  timing — now also firing on keyboard focus, not just hover. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
              >
                <span
                  className={
                    "absolute inset-y-[-60%] left-0 w-[38%] -translate-x-[180%] rotate-[18deg] blur-[8px] " +
                    "bg-[linear-gradient(90deg,transparent_0%,rgb(255_255_255/0.10)_35%,rgb(255_255_255/0.40)_50%,rgb(255_255_255/0.10)_65%,transparent_100%)] " +
                    "group-hover/tile:animate-[glass-sweep_1100ms_var(--ease-brand)] " +
                    "group-focus-visible/tile:animate-[glass-sweep_1100ms_var(--ease-brand)]"
                  }
                />
              </span>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </MotionConfig>
  );
}
