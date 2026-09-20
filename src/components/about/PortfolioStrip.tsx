"use client";

import Link from "next/link";
import { MotionConfig, motion, useReducedMotion } from "motion/react";
import { inView, noReveal, scaleFade } from "@/lib/motion";
import { Picture } from "@/components/ui/Picture";
import type { Project } from "@/data/works";

/**
 * A small supporting strip of real work, under the "What we've built"
 * paragraph — four real thumbnails, each a real `Link` to its own
 * `/works/[slug]` page. Deliberately lighter than `WorksGrid`'s own cards
 * (no category pill, no "Start this project"/"View details" pair, no flip
 * animation): this page's job is to gesture at the range of work in a few
 * lines, not re-run the Works listing at a smaller size. Anyone who wants
 * more already has the "work page" link in the paragraph above this.
 *
 * Reveals with `scaleFade` — a settle rather than a fade+rise — distinct
 * from `ServiceCapabilities`' `blurFocus` above it on the same page. (A
 * `clip-path` wipe was tried here first and dropped — see `scaleFade`'s own
 * comment in `lib/motion.ts` for why.)
 *
 * The hover/focus title reveal is `ProjectCard`'s own device (an
 * opacity/scale ring naming what the card is), not a new caption pattern —
 * `group-focus-visible/thumb` mirrors `group-hover/thumb` throughout so
 * tabbing to a thumbnail shows the same title a mouse hover would.
 */
const STEP = 0.06;
const container = { hidden: {}, show: {} };

export function PortfolioStrip({ projects }: { projects: Project[] }) {
  const reduced = useReducedMotion();

  return (
    <MotionConfig reducedMotion="user">
      <motion.ul
        initial="hidden"
        whileInView="show"
        viewport={inView}
        variants={container}
        className="grid grid-cols-2 gap-3 tablet:grid-cols-4"
      >
        {projects.map((project, i) => (
          <motion.li key={project.slug} variants={reduced ? noReveal : scaleFade(i * STEP)}>
            <Link
              href={`/works/${project.slug}`}
              className="group/thumb relative block overflow-hidden rounded-[var(--radius-md)] bg-surface p-1 shadow-float focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green"
            >
              <span
                aria-hidden="true"
                className="relative block aspect-square w-full overflow-clip rounded-[var(--radius-card)]"
              >
                {project.thumbnail && (
                  <Picture
                    source={project.thumbnail}
                    alt=""
                    width={416}
                    height={416}
                    sizes="(min-width: 810px) 25vw, 50vw"
                    className={
                      "size-full scale-100 object-cover transition-transform duration-[var(--duration-medium)] " +
                      "ease-[var(--ease-brand)] group-hover/thumb:scale-110 group-focus-visible/thumb:scale-110"
                    }
                  />
                )}

                {/* Title reveal — same opacity/scale device `ProjectCard`'s
                    "View details" ring uses, naming the project instead. */}
                <span
                  aria-hidden="true"
                  className={
                    "pointer-events-none absolute inset-x-0 bottom-0 flex items-end p-3 " +
                    "bg-[linear-gradient(to_top,rgb(20_20_20/0.55),transparent_70%)] " +
                    "opacity-0 transition-opacity duration-[var(--duration-medium)] ease-[var(--ease-brand)] " +
                    "group-hover/thumb:opacity-100 group-focus-visible/thumb:opacity-100 " +
                    "[@media(hover:none)]:hidden motion-reduce:transition-none"
                  }
                >
                  <span className="text-body-sm font-medium text-white">{project.title}</span>
                </span>
              </span>

              <span className="sr-only">View {project.title}</span>
            </Link>
          </motion.li>
        ))}
      </motion.ul>
    </MotionConfig>
  );
}
