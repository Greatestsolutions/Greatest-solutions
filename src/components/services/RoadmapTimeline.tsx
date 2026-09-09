"use client";

import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { fadeUpTight, inView, noDrawX, noDrawY, noReveal } from "@/lib/motion";
import type { ServicePhase } from "@/data/services";

/**
 * The execution roadmap as a timeline that draws itself phase by phase.
 *
 * ## The connector belongs to the phase, not to the row
 *
 * An earlier pass drew ONE rail across the whole section and grew it with a
 * single transform. That could only ever be one continuous sweep — it had no
 * idea where the phases were, so it could not pause at each marker.
 *
 * Each phase now owns the segment that leaves it, so the connector arrives in
 * step with the phase it belongs to: phase one appears, its segment draws, phase
 * two appears, and so on. The numbering and the line finally tell the same
 * story.
 *
 * It also fixes the layout problem that made a single rail awkward. Below
 * desktop the phases stack at whatever height their bullet lists need, so a
 * percentage-positioned rail could not know where to stop; a segment anchored
 * inside its own phase spans to the next one whatever height that turns out
 * to be.
 *
 * Desktop geometry, for the horizontal case: phases sit in equal grid columns of
 * width W with the marker centred, so the next marker is 1.5W from this phase's
 * left edge. The segment runs from `50% + 20px` (the marker's right edge) for
 * `100% - 40px`, landing exactly at the next marker's left edge. Nothing here is
 * tuned to five phases — four or six draw correctly with no change.
 *
 * ## Hover
 *
 * Each phase is a card carrying the works-card hover: a small scale pop plus the
 * `glass-sweep` band crossing it once. That is the site's established hover
 * language, adapted rather than reinvented — the same keyframe, the same easing,
 * a gentler scale because these sit in a row of five rather than three.
 *
 * `MotionConfig reducedMotion="user"` covers the entrance and the segment draw;
 * the hover is a CSS transition and stays, being a response to a deliberate
 * action rather than something that moves on its own.
 */

/** Per-phase entrance offset. Slower than a plain stagger so the draw reads. */
const STEP = 0.14;

/** A label-only parent so `whileInView` gives descendants a state to resolve. */
const container = { hidden: {}, show: {} };

/**
 * A connector segment. Transform-based rather than animating width or height, so
 * `reducedMotion` neutralises it, the compositor handles it, and the segment's
 * real length is already correct in the markup before JS runs.
 *
 * The delay lands the segment just after its own phase has arrived, which is
 * what makes the line appear to be drawn BY the sequence rather than under it.
 */
const draw = (axis: "x" | "y", index: number) => ({
  hidden: axis === "x" ? { scaleX: 0 } : { scaleY: 0 },
  show: {
    ...(axis === "x" ? { scaleX: 1 } : { scaleY: 1 }),
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const, delay: index * STEP + 0.2 },
  },
});

export function RoadmapTimeline({ phases }: { phases: ServicePhase[] }) {
  const count = phases.length;
  const reduced = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.ol
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={container}
        className="grid gap-8 desktop:gap-4"
        style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
      >
        {phases.map((phase, i) => (
          <motion.li
            key={phase.name}
            variants={reduced ? noReveal : fadeUpTight(i * STEP)}
            /* One grid declaration serves both layouts: below desktop every
               phase spans the full row, which stacks them without a second
               container or a media-query branch in the markup. */
            className="group/phase relative max-desktop:col-span-full"
          >
            {/* ---- connector: below desktop, vertical to the next phase ----- */}
            {i < count - 1 && (
              <span
                aria-hidden="true"
                className="absolute top-10 -bottom-8 left-5 w-px bg-hairline-strong desktop:hidden"
              >
                <motion.span
                  /* Self-triggering: a plain <span> track sits between this and
                     the list, and variant propagation does not reliably cross a
                     plain DOM element here — see the note in `OutcomeChart`. */
                  initial="hidden"
                  whileInView="show"
                  viewport={inView}
                  variants={reduced ? noDrawY : draw("y", i)}
                  className="block size-full origin-top bg-brand-emerald"
                />
              </span>
            )}

            {/* ---- connector: desktop, horizontal to the next marker -------- */}
            {i < count - 1 && (
              <span
                aria-hidden="true"
                /*
                  From this marker's right edge to the next marker's left edge.
                  The marker is 40px wide and sits at the START of its column
                  (the column is `flex-col`, so it left-aligns above the card) —
                  NOT centred in it. Assuming centred was wrong by half a column
                  and drew each segment overshooting into the next phase.

                  The next marker's left edge is one column width plus one grid
                  gap away, so the run is `100% + gap - 40px`, and `gap-4` makes
                  that `100% - 24px`.
                */
                className="absolute top-5 left-10 hidden h-px w-[calc(100%-1.5rem)] bg-hairline-strong desktop:block"
              >
                <motion.span
                  initial="hidden"
                  whileInView="show"
                  viewport={inView}
                  variants={reduced ? noDrawX : draw("x", i)}
                  className="block size-full origin-left bg-brand-emerald"
                />
              </span>
            )}

            <div className="flex gap-4 desktop:flex-col desktop:gap-4">
              {/*
                The marker. Opaque so the connector stops at its edge rather than
                striking through the number — it reads as a station on the line.
                It fills emerald on hover, which is what ties the card's hover
                back to the timeline it sits on.
              */}
              <span
                aria-hidden="true"
                className={
                  "relative z-10 grid size-10 shrink-0 place-items-center rounded-full " +
                  "border border-hairline-strong bg-surface font-mono text-body-sm text-muted " +
                  "transition-colors duration-[var(--duration-quick)] ease-[var(--ease-brand)] " +
                  "group-hover/phase:border-brand-emerald group-hover/phase:bg-brand-emerald " +
                  "group-hover/phase:text-white"
                }
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              {/*
                The card. `overflow-hidden` clips the sweep to the rounded shape,
                so no separate mask is needed — the same arrangement the works
                cards use.
              */}
              <div
                className={
                  "relative min-w-0 flex-1 overflow-hidden rounded-[var(--radius-lg)] bg-surface p-5 shadow-card " +
                  "transition-[scale,box-shadow] duration-[var(--duration-medium)] ease-[var(--ease-brand)] " +
                  "group-hover/phase:scale-[1.02] group-hover/phase:shadow-float " +
                  "motion-reduce:transition-none motion-reduce:group-hover/phase:scale-100"
                }
              >
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-body-sm text-brand-green">{phase.days}</span>
                  <h3 className="display-plain text-heading-sm text-ink">{phase.name}</h3>
                  <ul className="flex flex-col gap-1.5">
                    {phase.items.map((item) => (
                      <li key={item} className="flex gap-2 text-body-lg text-body">
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1 shrink-0 rounded-full bg-brand-emerald/50"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* The glass sweep — the works cards' own band, same keyframe and
                    timing, crossing the card once per hover. */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden"
                >
                  <span
                    className={
                      "absolute inset-y-[-60%] left-0 w-[38%] -translate-x-[180%] rotate-[18deg] blur-[8px] " +
                      "bg-[linear-gradient(90deg,transparent_0%,rgb(255_255_255/0.10)_35%,rgb(255_255_255/0.40)_50%,rgb(255_255_255/0.10)_65%,transparent_100%)] " +
                      "group-hover/phase:animate-[glass-sweep_1100ms_var(--ease-brand)]"
                    }
                  />
                </span>
              </div>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </MotionConfig>
  );
}
