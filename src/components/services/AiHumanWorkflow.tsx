"use client";

import { MotionConfig, motion } from "motion/react";
import { Section } from "@/components/layout/Section";
import { SectionLabel } from "@/components/services/SectionLabel";
import { fadeUpTight, inView } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * How the work actually gets done: the six-step loop every service runs through.
 *
 * Shared across all ten `/services/[slug]` pages rather than stored per service,
 * because it genuinely is the same six steps every time — it describes the
 * agency's method, not any one service's plan. Duplicating it into ten data
 * entries would mean ten places to edit and ten chances to drift.
 *
 * It is also the same "human strategy, AI-powered execution, human quality
 * control" claim the `/services` intro already makes, expanded into its steps,
 * so the two are consistent by construction rather than by memory.
 *
 * ## Reading it as a flow
 *
 * Steps sit in a wrapping row with an arrow between them, so the sequence reads
 * as one continuous path rather than six unrelated tiles. The arrow is a flex
 * sibling of its step rather than an absolutely-positioned connector, which is
 * what lets the row wrap at any width without a connector stranding itself at
 * the end of a line — it simply wraps along with the step it follows. It reuses
 * the `gst-arrow-flow` drift the services intro already uses, under
 * `motion-safe`.
 *
 * ## Human versus AI
 *
 * Four of the six steps are human-led, and the section says so plainly rather
 * than implying the work is automated end to end. The distinction carries in
 * three channels at once — a filled diamond against a hollow circle, emerald
 * against grey, and a real text label — because shape and colour alone are not
 * information anyone can rely on, and this is load-bearing content rather than
 * decoration.
 */
const STEPS = [
  { title: "Human strategy", sub: "A specialist scopes the problem and the plan", led: "Human" },
  { title: "AI-assisted production", sub: "AI accelerates drafting, iteration, repetitive work", led: "AI" },
  { title: "Human review & QA", sub: "A specialist checks accuracy, quality, brand fit", led: "Human" },
  { title: "Client approval", sub: "You review and sign off before anything ships", led: "Human" },
  { title: "Implementation", sub: "The system is deployed into your business", led: "AI" },
  { title: "Optimization", sub: "Your Account Manager monitors and improves it", led: "Human" },
] as const;

const STEP_DELAY = 0.07;
const container = { hidden: {}, show: {} };

export function AiHumanWorkflow() {
  return (
    <Section spacing="compact">
      <MotionConfig reducedMotion="user">
        <div className="flex flex-col gap-6">
          <SectionLabel>AI + human workflow</SectionLabel>

          <motion.ol
            initial="hidden"
            whileInView="show"
            viewport={inView}
            variants={container}
            className="flex flex-col gap-3 tablet:flex-row tablet:flex-wrap tablet:items-stretch"
          >
            {STEPS.map((step, i) => {
              const human = step.led === "Human";
              return (
                <motion.li
                  key={step.title}
                  variants={fadeUpTight(i * STEP_DELAY)}
                  className="flex items-center gap-3 tablet:flex-1 tablet:basis-[240px]"
                >
                  <div
                    className={
                      "group/step flex h-full w-full flex-col gap-2 rounded-[var(--radius-lg)] " +
                      "border border-black/8 bg-surface p-4 " +
                      "transition-[border-color,box-shadow] duration-[var(--duration-quick)] " +
                      "ease-[var(--ease-brand)] hover:border-brand-emerald/40 hover:shadow-pill"
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Marker human={human} />
                      <span
                        className={cn(
                          "font-mono text-[11px] tracking-[var(--tracking-label)] uppercase",
                          human ? "text-brand-green" : "text-muted",
                        )}
                      >
                        {step.led}
                      </span>
                      <span className="ml-auto font-mono text-body-sm text-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="text-body-md font-medium text-ink">{step.title}</h3>
                    <p className="text-body-sm text-body">{step.sub}</p>
                  </div>

                  {/* The connector. Hidden on the stacked phone layout, where the
                      cards already read top-to-bottom without one. */}
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden shrink-0 text-muted tablet:block motion-safe:animate-[gst-arrow-flow_2.6s_ease-in-out_infinite] motion-reduce:animate-none"
                    >
                      &rarr;
                    </span>
                  )}
                </motion.li>
              );
            })}
          </motion.ol>
        </div>
      </MotionConfig>
    </Section>
  );
}

/**
 * Filled emerald diamond for a human step, hollow grey circle for an AI one.
 * Decorative only — the text label beside it carries the same information.
 */
function Marker({ human }: { human: boolean }) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false" className="size-3 shrink-0">
      {human ? (
        <path d="M6 0.5 11.5 6 6 11.5 0.5 6Z" className="fill-brand-emerald" />
      ) : (
        <circle cx="6" cy="6" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted" />
      )}
    </svg>
  );
}
