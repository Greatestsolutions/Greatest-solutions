"use client";

import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { fadeUpTight, inView, noDrawX, noReveal } from "@/lib/motion";
import { cn } from "@/lib/cn";
import { ConnectorArrowhead } from "@/components/ui/ConnectorArrowhead";

/**
 * How the work actually gets done: the six-step loop every service runs through.
 *
 * Shared across all ten `/services/[slug]` pages rather than stored per service,
 * because it genuinely is the same six steps every time — it describes the
 * agency's method, not any one service's plan. Duplicating it into ten data
 * entries would mean ten places to edit and ten chances to drift. Every change
 * here lands on all ten pages at once.
 *
 * It is also the same "human strategy, AI-powered execution, human quality
 * control" claim the `/services` intro already makes, expanded into its steps.
 *
 * ## Human versus AI, readable at a glance
 *
 * Four of the six steps are human-led, and the section says so plainly rather
 * than implying the work is automated end to end. An earlier pass carried that
 * in a 12px glyph and a small label — true, but only on close reading. The two
 * kinds now differ in surface: a human step is emerald-washed with an emerald
 * rule down its left edge and a filled diamond; an AI step is plain surface with
 * a neutral rule and a hollow circle. The shape of the section is legible before
 * a single word is read.
 *
 * Colour is never the only channel. The rule, the marker SHAPE and a real text
 * label all carry it, so the distinction survives a monochrome rendering and a
 * reader who cannot separate the two hues.
 *
 * ## The connector
 *
 * The same device the roadmap uses: a hairline that draws itself in as the
 * section scrolls, one segment per step, arriving just behind the step it
 * leaves. Deliberately not a unicode arrow — that was a text glyph inheriting
 * the font's own metrics and sitting at whatever baseline it liked. The track
 * is a bolder 2px (the roadmap's own hairline is 1px, but that line runs
 * beside a column of numbered markers that already carry visual weight; this
 * one is the only graphic between two cards and reads as thin at 1px), capped
 * with a rounded end and a solid {@link ConnectorArrowhead} rather than the
 * bordered-mitre shape used previously.
 *
 * Which connectors exist depends on the column count, and the row end is
 * computed here rather than left to CSS: with three columns the third and sixth
 * steps end a row, with two columns every second one does. Drawing those would
 * leave a line pointing into the gutter.
 *
 * ## No step numbers
 *
 * The six cards no longer carry a 01-06 badge. The sequence is already legible
 * from position (left-to-right, top-to-bottom) and the connectors between
 * them; a number in the corner of every card added nothing and, once the
 * connector line ran close beside it, competed with it for the same small
 * corner of space.
 */
const STEPS = [
  { title: "Human strategy", sub: "A specialist scopes the problem and the plan", led: "Human" },
  { title: "AI-assisted production", sub: "AI accelerates drafting, iteration, repetitive work", led: "AI" },
  { title: "Human review & QA", sub: "A specialist checks accuracy, quality, brand fit", led: "Human" },
  { title: "Client approval", sub: "You review and sign off before anything ships", led: "Human" },
  { title: "Implementation", sub: "The system is deployed into your business", led: "AI" },
  { title: "Optimization", sub: "Your Account Manager monitors and improves it", led: "Human" },
] as const;

const STEP_DELAY = 0.09;
const container = { hidden: {}, show: {} };

/**
 * A connector segment, drawn left to right. Transform-based rather than
 * animating width, so `reducedMotion` neutralises it, the compositor handles it,
 * and the segment's real length is already correct before JS runs.
 */
const draw = (index: number) => ({
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const, delay: index * STEP_DELAY + 0.18 },
  },
});

export function AiHumanWorkflow() {
  const reduced = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.ol
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={container}
        /* `gap-x-8` from tablet so the connector has a gutter to live in; the
           row gap stays tight because nothing is drawn vertically. */
        className="grid gap-3 tablet:grid-cols-2 tablet:gap-x-8 desktop:grid-cols-3"
      >
        {STEPS.map((step, i) => {
          const human = step.led === "Human";
          const last = i === STEPS.length - 1;
          /* Row ends by breakpoint: 2 columns from tablet, 3 from desktop. */
          const endsTabletRow = i % 2 === 1;
          const endsDesktopRow = i % 3 === 2;

          return (
            <motion.li key={step.title} variants={reduced ? noReveal : fadeUpTight(i * STEP_DELAY)} className="relative">
              {/* The connector into the next step, sitting in the column gap. */}
              {!last && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-1/2 -right-8 hidden h-0.5 w-8 -translate-y-1/2 rounded-full bg-hairline-strong",
                    endsTabletRow ? "tablet:hidden" : "tablet:block",
                    endsDesktopRow ? "desktop:hidden" : "desktop:block",
                  )}
                >
                  <motion.span
                    /* Self-triggering, for the reason documented in
                       `OutcomeChart`: the plain <span> track between this and
                       the list breaks variant propagation. */
                    initial="hidden"
                    whileInView="show"
                    viewport={inView}
                    variants={reduced ? noDrawX : draw(i)}
                    className="block size-full origin-left rounded-full bg-brand-emerald"
                  />
                  <ConnectorArrowhead
                    direction="right"
                    className="absolute top-1/2 -right-1 -translate-y-1/2"
                  />
                </span>
              )}

              <div
                className={
                  "group/step relative flex h-full flex-col gap-2 overflow-hidden " +
                  "rounded-[var(--radius-lg)] p-5 shadow-card " +
                  "transition-[transform,box-shadow] duration-[var(--duration-quick)] " +
                  "ease-[var(--ease-brand)] hover:-translate-y-0.5 hover:shadow-float " +
                  "motion-reduce:transition-none motion-reduce:hover:translate-y-0 " +
                  (human ? "bg-brand-emerald/[0.07]" : "bg-surface")
                }
              >
                {/* The edge rule — the loudest of the three channels. */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute inset-y-0 left-0 w-1",
                    human ? "bg-brand-emerald" : "bg-scrim-12",
                  )}
                />

                <div className="flex items-center gap-2 pl-2">
                  <Marker human={human} />
                  <span
                    className={cn(
                      "font-mono text-[11px] tracking-[var(--tracking-label)] uppercase",
                      human ? "text-brand-green" : "text-muted",
                    )}
                  >
                    {step.led}
                  </span>
                </div>

                <h3 className="pl-2 text-body-lg font-medium text-ink [font-family:var(--font-sans)] [font-variation-settings:normal]">
                  {step.title}
                </h3>
                <p className="pl-2 text-body-md text-body">{step.sub}</p>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
    </MotionConfig>
  );
}

/**
 * Filled emerald diamond for a human step, hollow grey circle for an AI one.
 * One of three channels carrying the same distinction — the text label beside it
 * and the card's edge rule carry it too.
 */
function Marker({ human }: { human: boolean }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" className="size-3 shrink-0">
      {human ? (
        <path d="M6 0.5 11.5 6 6 11.5 0.5 6Z" className="fill-brand-emerald" />
      ) : (
        <circle
          cx="6"
          cy="6"
          r="4.75"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-muted"
        />
      )}
    </svg>
  );
}
