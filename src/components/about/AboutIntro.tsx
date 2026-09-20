"use client";

import type { ReactNode } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { fadeDown, fadeUp, noReveal, riseInSpring, stagger, delays } from "@/lib/motion";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/layout/Section";

/**
 * The About page's own masthead — eyebrow, then heading, then the supporting
 * line, each arriving in that reading order rather than as one static block.
 *
 * Deliberately NOT a change to `PageHeader`/`SectionHeader`: those are plain
 * Server Components shared by every sub-page (Contact, Works, Services,
 * Blog…), and giving them a staggered entrance would animate all of them,
 * not just this one. Same "thin client boundary" shape `Reveal` and
 * `ContactButton` already use — a small, page-scoped client component rather
 * than a shared-infrastructure change — with `PageHeader`'s own layout and
 * type scale copied by hand so this reads as the same masthead every other
 * page gets, just with motion this page specifically asked for.
 *
 * `fadeDown`/`fadeUp` and the `delays` ladder are the exact presets
 * `lib/motion.ts` documents as "the order the page reveals" — eyebrow first,
 * built for exactly this sequence rather than invented for it. The heading
 * alone uses `riseInSpring` instead of `fadeUp` — the page's one moment that
 * gets the tactile interaction spring rather than the calm entrance tween.
 */
export function AboutIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description: ReactNode;
}) {
  const reduced = useReducedMotion();

  return (
    <Section spacing="compact" className="pt-[136px] desktop:pt-[184px]">
      <MotionConfig reducedMotion="user">
        <motion.div
          initial="hidden"
          animate="show"
          variants={reduced ? noReveal : stagger(0, delays.immediate)}
          className="flex max-w-[520px] flex-col items-start gap-4"
        >
          <motion.div variants={reduced ? noReveal : fadeDown(delays.first)}>
            <Pill size="eyebrow">{eyebrow}</Pill>
          </motion.div>

          <motion.h1
            /* The page's single highest-weight moment gets the tactile
               interaction spring instead of the calm entrance tween every
               other reveal here uses — see `riseInSpring` in `lib/motion.ts`. */
            variants={reduced ? noReveal : riseInSpring(delays.second)}
            className="w-full text-heading-xl opsz-56 tablet:text-display-md"
          >
            {title}
          </motion.h1>

          <motion.p
            variants={reduced ? noReveal : fadeUp(delays.third)}
            className="text-body-lg text-body"
          >
            {description}
          </motion.p>
        </motion.div>
      </MotionConfig>
    </Section>
  );
}
