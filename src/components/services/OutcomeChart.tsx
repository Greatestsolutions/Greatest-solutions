"use client";

import { MotionConfig, motion } from "motion/react";
import { inView } from "@/lib/motion";
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
            <div className="flex flex-col gap-4">
              <Bar label="Before" value={outcome.before} delay={i * 0.1} tone="muted" />
              <Bar label="After" value={outcome.after} delay={i * 0.1 + 0.12} tone="brand" />
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
}: {
  label: string;
  value: number;
  delay: number;
  tone: "muted" | "brand";
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
          variants={bar(delay)}
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
