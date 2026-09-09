import type { Transition, Variants } from "motion/react";

/**
 * Motion system — REBUILD-SPEC §7.
 *
 * Extracted verbatim from the reference build's `__framer__appearAnimationsContent`
 * payload: 11 entries that reduce to the six presets below.
 *
 * Two distinct motion languages are in play and they are kept separate on purpose:
 *
 *   ENTRANCE    long (1.5s), bounce 0, no overshoot   — calm, editorial
 *   INTERACTION short (0.75s), bounce 0.2, overshoot  — responsive, tactile
 *
 * Mixing them is what makes a rebuild feel subtly wrong even when the values look
 * right, so prefer these presets over ad-hoc transitions.
 */

/** Framer starts every fade at 0.001 rather than 0 — browsers may skip compositing
 *  an element at exactly `opacity: 0`, which can cause a visible pop on reveal. */
const NEARLY_INVISIBLE = 0.001;

export const spring = {
  /** Entrance: settles slowly, never overshoots. */
  entrance: (delay = 0): Transition => ({
    type: "spring",
    bounce: 0,
    duration: 1.5,
    delay,
  }),
  /** Interaction: quicker, with a slight overshoot. */
  interaction: (delay = 0): Transition => ({
    type: "spring",
    bounce: 0.2,
    duration: 0.75,
    delay,
  }),
  /** Short settle, no overshoot — used for late-arriving detail. */
  settle: (delay = 0): Transition => ({
    type: "spring",
    bounce: 0,
    duration: 0.6,
    delay,
  }),
  /** Scale-in, no overshoot. */
  pop: (delay = 0): Transition => ({
    type: "spring",
    bounce: 0,
    duration: 0.75,
    delay,
  }),
} as const;

/**
 * The hand-tuned delay ladder from the reference, in the order the page reveals.
 * Centralised so a sequence can be retimed in one place rather than across files.
 */
export const delays = {
  immediate: 0,
  first: 0.05,
  second: 0.1,
  third: 0.15,
  fourth: 0.25,
  fifth: 0.3,
  late: 0.8,
  trailing: 1.31,
} as const;

const hidden = (y: number, scale = 1) => ({ opacity: NEARLY_INVISIBLE, y, scale });
const shown = { opacity: 1, y: 0, scale: 1 };

/** y: -24 → 0, entrance spring. Reference delay 0.10. */
export const fadeDown = (delay = delays.second): Variants => ({
  hidden: hidden(-24),
  show: { ...shown, transition: spring.entrance(delay) },
});

/** y: 24 → 0, entrance spring. Reference delays 0.05–0.10. */
export const fadeUp = (delay = delays.second): Variants => ({
  hidden: hidden(24),
  show: { ...shown, transition: spring.entrance(delay) },
});

/** y: 12 → 0, interaction spring with overshoot. Reference delays 0.25–0.30. */
export const fadeUpSoft = (delay = delays.fourth): Variants => ({
  hidden: hidden(12),
  show: { ...shown, transition: spring.interaction(delay) },
});

/** y: 10 → 0, short settle. Reference delay 1.31 — the last thing to arrive. */
export const fadeUpTight = (delay: number = delays.trailing): Variants => ({
  hidden: hidden(10),
  show: { ...shown, transition: spring.settle(delay) },
});

/** Opacity only, no translation. Reference delay 0.80. */
export const fadeIn = (delay = delays.late): Variants => ({
  hidden: { opacity: NEARLY_INVISIBLE },
  show: { opacity: 1, transition: spring.entrance(delay) },
});

/**
 * scale: 0.5 → 1. In the reference this is paired with
 * `transformTemplate: translate(-50%, -50%) …` because the element is centred by
 * offset; apply {@link centeredTransform} when reproducing that case.
 */
export const pop = (delay = delays.third): Variants => ({
  hidden: hidden(0, 0.5),
  show: { ...shown, transition: spring.pop(delay) },
});

/** Matches the reference's transformTemplate for offset-centred elements. */
export const centeredTransform = (_: unknown, generated: string) =>
  `translate(-50%, -50%) ${generated}`;

/**
 * Stagger container. The reference stages children with explicit per-element
 * delays; for new sequences prefer this over hand-numbering each child.
 */
export const stagger = (staggerChildren = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

/**
 * Variants whose hidden state IS their shown state — i.e. no reveal at all.
 *
 * `MotionConfig reducedMotion="user"` is not enough on its own. It drops
 * transform animations for anyone who has asked for less motion but KEEPS
 * opacity ones, on the reasoning that a fade is not movement. Measured under
 * `prefers-reduced-motion: reduce`, a deliverables item was still mid-fade at
 * 0.52 opacity 60ms in — the bars and connectors snapped correctly, because
 * those are transforms, but anything fading did not.
 *
 * Swapping the variants for these makes the element render at its final state on
 * the first frame instead. Pair with `useReducedMotion()` at the call site.
 *
 * They are complete rather than empty objects on purpose: server rendering
 * cannot know the preference, so the hidden frame is always what ships in the
 * HTML. Naming every property the real variants animate is what lets motion
 * resolve all of them on hydration rather than leaving one behind at its
 * hidden value.
 */
export const noReveal: Variants = {
  hidden: { opacity: 1, y: 0, scale: 1 },
  show: { opacity: 1, y: 0, scale: 1 },
};

/** As {@link noReveal}, for the horizontal draw used by connectors and bars. */
export const noDrawX: Variants = { hidden: { scaleX: 1 }, show: { scaleX: 1 } };

/** As {@link noReveal}, for the vertical draw used by the stacked connectors. */
export const noDrawY: Variants = { hidden: { scaleY: 1 }, show: { scaleY: 1 } };

/** Shared viewport config so scroll-triggered reveals behave consistently. */
export const inView = { once: true, amount: 0.25 } as const;
