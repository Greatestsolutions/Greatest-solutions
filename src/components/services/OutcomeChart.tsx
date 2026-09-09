"use client";

import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { inView, noDrawX } from "@/lib/motion";
import type { ServiceOutcome } from "@/data/services";

/**
 * Before/after figures, drawn as paired bars that grow in on scroll.
 *
 * ## Neither bar is labelled "better"
 *
 * Direction is not universal in this data: "missed calls" falling from 78 to 22
 * is an improvement, and "after-hours response" rising from 15 to 85 is also an
 * improvement. Any arrow, colour-coded delta or "↑ 70%" badge would therefore be
 * wrong on half the entries. The chart states both figures, distinguishes them
 * by weight rather than by judgement, and lets the label carry the meaning.
 *
 * The emerald bar is the *after* value in every case — the state the service
 * produces — with *before* in a neutral grey. That is a reading order, not a
 * claim about which number is higher.
 *
 * ## Why the bar scales rather than animating its width
 *
 * The filled bar is rendered at its true width in the markup and revealed by
 * scaling from zero along its left edge. Animating `width` would relayout on
 * every frame and, worse, would leave the bar at the wrong length if JS never
 * ran. This way the correct figure is in the HTML, the animation is a transform
 * on the compositor, and `reducedMotion` resolves it straight to its final
 * state.
 *
 * Figures come from the service reference document and are presented as
 * expectations, not measured client results — the heading above the section
 * says "Expected outcomes" for that reason.
 */
const bar = (delay: number) => ({
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] as const, delay },
  },
});

const container = { hidden: {}, show: {} };

export function OutcomeChart({ outcomes }: { outcomes: ServiceOutcome[] }) {
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
        {outcomes.map((outcome, i) => (
          <li
            key={outcome.label}
            className="flex flex-col gap-5 rounded-[var(--radius-lg)] bg-surface p-6 shadow-card"
          >
            <h3 className="display-plain text-heading-sm text-ink">{outcome.label}</h3>
            {/*
              A shared origin rail down the left edge, binding the two bars into
              one comparison rather than two unrelated meters. It marks where
              both bars START — the only thing the two figures genuinely have in
              common — so it adds no claim about which way is better. That
              restraint is deliberate and stays: "missed calls" falling and
              "after-hours response" rising are both improvements, so an arrow or
              a colour-coded delta would be wrong on half the entries.
            */}
            <div className="relative flex flex-col gap-4 pl-4">
              {/* Emerald at low alpha rather than the neutral hairline: at 1px
                  on a white card, `hairline-strong` (black 8%) was invisible at
                  normal viewing distance — checked in a screenshot before
                  changing it — which is worse than no rail at all, since the
                  markup would be there doing nothing. */}
              <span
                aria-hidden="true"
                className="absolute inset-y-1 left-0 w-px bg-brand-emerald/30"
              />
              <Bar label="Before" value={outcome.before} delay={i * 0.1} tone="muted" reduced={reduced} />
              <Bar label="After" value={outcome.after} delay={i * 0.1 + 0.12} tone="brand" reduced={reduced} />
            </div>
          </li>
        ))}
      </motion.ul>
    </MotionConfig>
  );
}

function Bar({
  label,
  value,
  delay,
  tone,
  reduced,
}: {
  label: string;
  value: number;
  delay: number;
  tone: "muted" | "brand";
  reduced: boolean | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
          {label}
        </span>
        {/* The figure in real text beside the bar, so the number is readable
            whether or not the graphic renders — and so the bar itself can stay
            `aria-hidden` rather than being announced twice. */}
        <span
          className={
            tone === "brand"
              ? "text-body-lg font-medium text-ink"
              : "text-body-md font-medium text-muted"
          }
        >
          {value}%
        </span>
      </div>
      <div aria-hidden="true" className="h-2 w-full overflow-hidden rounded-full bg-scrim-06">
        <motion.div
          /*
            Triggers ITSELF rather than inheriting the list's variant.
            Measured: with only `variants` here and the state on the `<ul>`, the
            bars rendered at full width with no animation at all — a screenshot
            taken 120ms after the section scrolled in was already settled.
            Between that `<ul>` and this element sit four plain DOM wrappers (the
            `<li>`, the column, the row and the track), and variant propagation
            does not reliably survive them in this version. `ProcessSequence`
            documents measuring the same failure and abandoning parent
            orchestration for the same reason.
          */
          initial="hidden"
          whileInView="show"
          viewport={inView}
          variants={reduced ? noDrawX : bar(delay)}
          style={{ width: `${value}%` }}
          className={
            "h-full origin-left rounded-full " +
            (tone === "brand" ? "bg-brand-emerald" : "bg-black/20")
          }
        />
      </div>
    </div>
  );
}
