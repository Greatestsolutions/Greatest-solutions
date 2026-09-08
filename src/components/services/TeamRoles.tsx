"use client";

import { MotionConfig, motion } from "motion/react";
import { Picture } from "@/components/ui/Picture";
import { fadeUpTight, inView } from "@/lib/motion";
import type { ImageSource } from "@/types/media";
import type { ServiceRole } from "@/data/services";

/**
 * The roles on a service engagement.
 *
 * ## The mark
 *
 * A real icon, not a monogram. Initials in a circle ("VS", "IE", "AM") read as
 * the placeholder a designer leaves until artwork arrives — which is exactly
 * what they were — so the disc now carries one of the site's own 3D icon
 * renders, painted through the emerald ramp.
 *
 * These are the three icons `Process` already uses, in the disc treatment
 * `Process` already establishes: a round surface with the render centred inside
 * it. Three icons against two or three roles per service, so they cycle by
 * position — the same rule the service illustrations follow, and the reason a
 * service with three roles never shows the same mark twice.
 *
 * They are decorative and deliberately abstract: a role is a role on an
 * engagement, not a named person, so anything portrait-like would imply someone
 * who does not exist. `ServiceRole.initials` is still carried in the data as
 * reference content, simply no longer rendered.
 *
 * Hover lifts the card and warms the disc, on the interaction timing the rest of
 * the site uses. It is a CSS transition rather than a motion value: it responds
 * to a deliberate action, so it stays under `prefers-reduced-motion`, where the
 * scroll entrance does not.
 */
const STEP = 0.08;
const container = { hidden: {}, show: {} };

/**
 * The icon set, cycled by position.
 *
 * Only the formats the build actually produced are listed: below roughly 4 KB an
 * AVIF or WebP can come out larger than the PNG, and `build-image-assets.mjs`
 * drops those rather than ship a bigger "optimised" file. That is why `design`
 * has no WebP entry — claiming one would 404.
 */
const ICONS: ImageSource[] = [
  { avif: "/icons/discovery.avif", webp: "/icons/discovery.webp", fallback: "/icons/discovery.png" },
  { avif: "/icons/strategy.avif", webp: "/icons/strategy.webp", fallback: "/icons/strategy.png" },
  { avif: "/icons/design.avif", fallback: "/icons/design.png" },
];

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
              "ease-[var(--ease-brand)] hover:-translate-y-1 hover:shadow-float " +
              "motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            }
          >
            <span
              aria-hidden="true"
              className={
                "grid size-12 shrink-0 place-items-center rounded-full bg-brand-emerald/10 " +
                "ring-1 ring-brand-emerald/20 " +
                "transition-[background-color,box-shadow] duration-[var(--duration-quick)] " +
                "ease-[var(--ease-brand)] group-hover/role:bg-brand-emerald/16 " +
                "group-hover/role:ring-brand-emerald/40"
              }
            >
              {/*
                The ramp goes on a wrapper, not on `Picture` — that component
                takes no `style` prop, deliberately, so a caller cannot quietly
                give one image a treatment the rest of the site does not have.
                A wrapper keeps the filter at the call site where it belongs.
              */}
              <span className="block size-7" style={{ filter: "url(#gst-emerald)" }}>
                <Picture
                  source={ICONS[i % ICONS.length]!}
                  alt=""
                  width={184}
                  height={184}
                  sizes="28px"
                  className="size-full object-contain"
                />
              </span>
            </span>

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
