"use client";

import { MotionConfig, motion } from "motion/react";
import { fadeUpTight, inView } from "@/lib/motion";
import type { ServicePhase } from "@/data/services";

/**
 * The execution roadmap as an actual timeline rather than a list of cards.
 *
 * ## The rail
 *
 * A hairline runs through the phase markers — horizontally across the row on
 * desktop, vertically down the left edge below it — with an emerald line drawn
 * over it that grows from nothing as the section scrolls in. That growth is the
 * progress indicator: it reads as the engagement advancing through its phases,
 * and it is the reason this is a timeline and not six boxes in a grid.
 *
 * The rail's inset is computed from the phase count rather than hardcoded. Each
 * marker sits centred in an equal column, so the first is at `50/n` percent and
 * the last the same distance from the other end — with five phases that is 10%,
 * but nothing here assumes five, and a service with four or six phases draws a
 * correctly-terminated rail with no change.
 *
 * ## Two rails, one markup
 *
 * The marker sits above its text on desktop and beside it below, which puts the
 * rail in a different place in each case. Rather than branch the whole list, the
 * two rails are separate decorative elements that each show at one breakpoint —
 * the phases themselves are authored once.
 *
 * `MotionConfig reducedMotion="user"` covers every animation in here: the rail
 * fill and the per-phase entrance both resolve to their final state instantly
 * for anyone who has asked for less motion. The hover states are plain CSS
 * transitions and stay, being a response to a deliberate action rather than
 * something that moves on its own.
 */

/** Per-phase entrance offset. Matches `ProcessSequence`'s cadence. */
const STEP = 0.08;

/** A label-only parent so `whileInView` gives descendants a state to resolve. */
const container = { hidden: {}, show: {} };

/**
 * The rail fill. Transform-based rather than animating width or height, so
 * `reducedMotion` neutralises it and the compositor handles it — and so the
 * rail's real length is already correct in the markup before JS runs.
 */
const grow = (axis: "x" | "y") => ({
  hidden: axis === "x" ? { scaleX: 0 } : { scaleY: 0 },
  show: {
    ...(axis === "x" ? { scaleX: 1 } : { scaleY: 1 }),
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] as const, delay: 0.1 },
  },
});

export function RoadmapTimeline({ phases }: { phases: ServicePhase[] }) {
  const count = phases.length;
  /* Half a column in from each end — where the first and last markers sit. */
  const inset = `${50 / count}%`;

  return (
    <MotionConfig reducedMotion="user">
      <motion.ol
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={container}
        className="relative flex flex-col gap-8 desktop:grid desktop:gap-6"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {/* ---- rail: below desktop, vertical down the marker column -------- */}
        <span
          aria-hidden="true"
          className="absolute top-5 bottom-5 left-5 w-px bg-hairline-strong desktop:hidden"
        >
          <motion.span
            variants={grow("y")}
            className="block h-full w-full origin-top bg-brand-emerald"
          />
        </span>

        {/* ---- rail: desktop, horizontal through the marker row ------------ */}
        <span
          aria-hidden="true"
          className="absolute top-5 hidden h-px bg-hairline-strong desktop:block"
          style={{ left: inset, right: inset }}
        >
          <motion.span
            variants={grow("x")}
            className="block h-full w-full origin-left bg-brand-emerald"
          />
        </span>

        {phases.map((phase, i) => (
          <motion.li
            key={phase.name}
            variants={fadeUpTight(i * STEP)}
            className="group/phase relative flex gap-4 desktop:flex-col desktop:gap-4"
          >
            {/*
              The marker. `bg-surface` rather than transparent so the rail passes
              behind it and stops at its edge instead of striking through the
              number — the ring then reads as a station on the line.
            */}
            <span
              aria-hidden="true"
              className={
                "relative z-10 grid size-10 shrink-0 place-items-center rounded-full " +
                "border border-hairline-strong bg-surface font-mono text-body-sm text-muted " +
                "transition-colors duration-[var(--duration-quick)] ease-[var(--ease-brand)] " +
                "group-hover/phase:border-brand-emerald group-hover/phase:bg-brand-emerald/12 " +
                "group-hover/phase:text-brand-green"
              }
            >
              {String(i + 1).padStart(2, "0")}
            </span>

            <div className="flex flex-col gap-2 pb-2 desktop:pb-0">
              <span className="font-mono text-body-sm text-brand-green">{phase.days}</span>
              <h3 className="text-body-lg font-medium text-ink">{phase.name}</h3>
              <ul className="flex flex-col gap-1.5">
                {phase.items.map((item) => (
                  <li key={item} className="flex gap-2 text-body-md text-body">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1 shrink-0 rounded-full bg-brand-emerald/50"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </MotionConfig>
  );
}
