"use client";

import { MotionConfig, motion } from "motion/react";
import { fadeUpTight, inView } from "@/lib/motion";
import type { ServiceRole } from "@/data/services";

/**
 * The roles on a service engagement.
 *
 * The mark is a monogram inside an emerald disc with a pair of concentric arcs
 * behind it — deliberately abstract. These are ROLES on an engagement, not named
 * individuals, so a photograph or an avatar illustration would imply a specific
 * person who does not exist; the same reason the works cards use sculpture
 * rather than invented screenshots. The initials are real data from the service
 * reference, and the arcs are decoration that reads as a seal rather than a face.
 *
 * Hover lifts the card and brightens the ring, using the interaction timing the
 * rest of the site uses. It is a CSS transition rather than a motion value: it
 * responds to a deliberate action, so it stays under `prefers-reduced-motion`,
 * where the scroll entrance does not.
 */
const STEP = 0.08;
const container = { hidden: {}, show: {} };

export function TeamRoles({ team }: { team: ServiceRole[] }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={container}
        className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-3"
      >
        {team.map((member, i) => (
          <motion.li
            key={member.role}
            variants={fadeUpTight(i * STEP)}
            className={
              "group/role flex items-start gap-4 rounded-[var(--radius-lg)] " +
              "bg-surface p-6 shadow-card " +
              "transition-[transform,box-shadow] duration-[var(--duration-medium)] " +
              "ease-[var(--ease-brand)] hover:-translate-y-1 " +
              "hover:shadow-float motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            }
          >
            <RoleMark initials={member.initials} />
            <div className="flex flex-col gap-1">
              <h3 className="display-plain text-heading-sm text-ink">{member.role}</h3>
              <p className="text-body-lg text-body">{member.focus}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </MotionConfig>
  );
}

function RoleMark({ initials }: { initials: string }) {
  return (
    <span
      aria-hidden="true"
      className={
        "relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full " +
        "bg-brand-emerald/10 ring-1 ring-brand-emerald/20 " +
        "transition-[background-color,box-shadow] duration-[var(--duration-quick)] " +
        "ease-[var(--ease-brand)] group-hover/role:bg-brand-emerald/16 " +
        "group-hover/role:ring-brand-emerald/40"
      }
    >
      {/* Concentric arcs, struck off-centre so the disc reads as a seal rather
          than a target. Purely decorative; the monogram sits above them. */}
      <svg
        viewBox="0 0 48 48"
        className="absolute inset-0 size-full text-brand-emerald/25"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="34" cy="14" r="17" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="34" cy="14" r="25" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className="relative font-mono text-body-sm text-brand-green">{initials}</span>
    </span>
  );
}
