"use client";

import { MotionConfig, motion } from "motion/react";
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
 * Steps read as a sequence from their numbering (01–06) and their staggered
 * entrance, which arrives in order. An earlier pass drew arrows between them in
 * a wrapping flex row; that broke down at desktop, where six cards split 5 + 1
 * and the stranded sixth stretched across the whole row. A grid keeps every step
 * on the same track, and the number carries the order the arrow was there to
 * show.
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
    <MotionConfig reducedMotion="user">
      <motion.ol
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={container}
        /*
          A grid, not a wrapping flex row. With `flex-wrap` and `flex-1` the six
          steps split 5 + 1 at desktop and the lone sixth card stretched the full
          width of the row — the grid gives every step the same track regardless
          of how many land on the last line, which also means a future seventh
          step needs no retuning.
        */
        className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-3"
      >
            {STEPS.map((step, i) => {
              const human = step.led === "Human";
              return (
                <motion.li
                  key={step.title}
                  variants={fadeUpTight(i * STEP_DELAY)}
                  className="flex"
                >
                  <div
                    className={
                      "group/step flex h-full w-full flex-col gap-2 rounded-[var(--radius-lg)] " +
                      "bg-surface p-5 shadow-card " +
                      "transition-[transform,box-shadow] duration-[var(--duration-quick)] " +
                      "ease-[var(--ease-brand)] hover:-translate-y-0.5 hover:shadow-float " +
                      "motion-reduce:transition-none motion-reduce:hover:translate-y-0"
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
                    <h3 className="text-body-lg font-medium text-ink [font-family:var(--font-sans)] [font-variation-settings:normal]">{step.title}</h3>
                    <p className="text-body-md text-body">{step.sub}</p>
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
