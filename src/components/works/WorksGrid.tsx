"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ContactButton } from "@/components/contact/ContactButton";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Pill } from "@/components/ui/Pill";
import { PlayButton } from "@/components/works/PlayButton";
import type { ImageSource } from "@/types/media";
import type { Project } from "@/data/works";

/**
 * The `/works` results: a plain wrapping grid of project cards.
 *
 * This replaced a timer-driven carousel, and the replacement is a deletion
 * rather than a rewrite — autoplay, arrow controls, the pointer drag/swipe
 * pipeline and the peek/falloff maths (scale, blur and opacity by distance from
 * a focused card) are gone with the component that held them, not disabled
 * behind a flag. `WorksIndex` owns the query and hands down the survivors; the
 * layout itself holds no state.
 *
 * It is a Client Component only for the decorative flip wave — see
 * {@link useSerpentineFlip}. Nothing about the grid, the cards or the links
 * needs the client; strip the one `useEffect` and this is static markup again.
 *
 * Every card is now equal. There is no focused card, so there is no
 * focused-versus-peeking distinction to express, and the card-level link always
 * navigates instead of sometimes stealing the click to re-centre the row.
 *
 * The one piece of the carousel's motion that carries over is the hover
 * treatment — the scale pop and the glass sweep. Both were written against a
 * single card rather than against the ring, so they transplant unchanged.
 */

/*
 * Placeholder artwork for projects with no real screenshot — reasoning
 * unchanged from the carousel. Every current entry has a real
 * `project.thumbnail` (see `data/works.ts`) and the render below prefers it,
 * so this doesn't currently fire for anything; it stays in place for the day
 * a real project — internal, personal or client — genuinely has no
 * screenshot yet.
 *
 * These are the abstract service renders, cycled, already in `public/services`
 * and already through `npm run assets:images`.
 *
 * Deliberately NOT the Orionix template's own leftover project screenshots
 * (axn, fluxa, nova, river, rivermark, season — still sitting unused in
 * `public/works/`, alongside the real client thumbnails now sharing that
 * directory): showing a template's dashboard under a real project's own
 * title would read as a screenshot of our work — the same invention as a
 * fake client. Abstract sculpture cannot be mistaken for a product
 * screenshot.
 */
const PLACEHOLDERS = [
  "web-development",
  "digital-marketing",
  "social-content",
  "product-design",
  "brand-identity",
] as const;

const placeholderArt = (i: number): ImageSource => {
  const name = PLACEHOLDERS[i % PLACEHOLDERS.length];
  return {
    avif: `/services/${name}.avif`,
    webp: `/services/${name}.webp`,
    fallback: `/services/${name}.png`,
  };
};

/**
 * The flip wave.
 *
 * One card at a time turns over, cascading along each row and alternating
 * direction row by row — left→right, then right→left, then left→right — and
 * restarting from the first card the moment the last one lands. A boustrophedon,
 * the way an ox ploughs a field.
 *
 * ## Why JS schedules it and CSS performs it
 *
 * The wave's shape depends on the RENDERED column count, and that changes with
 * the breakpoint: three across on desktop is a different set of rows from two on
 * tablet or one on a phone, so the same card holds a different slot in the
 * sequence at each width. Pure CSS could stagger `animation-delay` per card, but
 * only against a row grouping baked in at author time — and there is a second
 * moving part, since filtering changes how many cards exist at all.
 *
 * So the schedule is computed here and the motion is not: each card's turn is a
 * single attribute flip, and the CSS keyframes do the work on the compositor.
 *
 * Columns are read from the grid's own resolved `grid-template-columns` rather
 * than from a `matchMedia` copy of the breakpoints. The browser has already done
 * this layout; counting its tracks cannot disagree with what is on screen, where
 * a duplicated 810/1200 threshold in JS silently could.
 *
 * ## Why the DOM directly instead of React state
 *
 * A card's turn comes roughly once a second, forever. Routing that through
 * `useState` would re-render the whole grid on every step for the lifetime of
 * the page, to change one attribute. The elements are queried fresh on each step,
 * which is also what lets a resize or a filter change take effect on the very
 * next card without restarting anything.
 *
 * ## Not running when it cannot be seen
 *
 * An `IntersectionObserver` stops the wave when the grid scrolls out of view.
 * A perpetual animation is exactly the kind that otherwise keeps a phone's
 * compositor awake while the user reads the footer.
 */

/** One card's turn. Comfortably inside the 2s ceiling, and slow enough that the
 *  squash-through-zero reads as a turn rather than a glitch. */
const FLIP_MS = 1400;
/**
 * Gap between one card starting and the next.
 *
 * Below `FLIP_MS`, so the flips overlap: the next card begins at 71% of the
 * current one, while it is on its way back up from the edge. Tuned by ear
 * between two failure modes — at 1400 (no overlap) the cards read as separate
 * events in a queue, and below about 700 the wave outruns the eye and the row
 * looks like it is shimmering rather than turning over one card at a time.
 */
const STAGGER_MS = 1000;

function useSerpentineFlip(dependency: string) {
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const ul = list.current;
    if (!ul) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timers: number[] = [];
    let running = false;

    /* Resolved tracks, e.g. "341.33px 341.33px 341.33px" → 3. `none` on a grid
       that has not been laid out yet falls back to a single column, which is the
       correct answer for the narrowest case anyway. */
    const columns = () => {
      const tracks = getComputedStyle(ul).gridTemplateColumns;
      if (!tracks || tracks === "none") return 1;
      return tracks.split(/\s+/).filter(Boolean).length;
    };

    /* Cards in wave order: rows chunked by the live column count, every other
       row reversed. Recomputed per step, so an uneven final row (7 or 8 cards
       across 3 columns) needs no special case — the last chunk is simply short. */
    const sequence = () => {
      const cards = Array.from(ul.querySelectorAll<HTMLElement>("[data-flip-card]"));
      const cols = columns();
      const ordered: HTMLElement[] = [];
      for (let start = 0; start < cards.length; start += cols) {
        const row = cards.slice(start, start + cols);
        if ((start / cols) % 2 === 1) row.reverse();
        ordered.push(...row);
      }
      return ordered;
    };

    const step = (slot: number) => {
      const cards = sequence();
      if (cards.length === 0) return;

      /* A filter can shrink the set between steps; wrap rather than skip, so the
         wave never stalls waiting for a slot that no longer exists. */
      const index = slot % cards.length;
      const card = cards[index];
      card?.setAttribute("data-flipping", "");
      timers.push(window.setTimeout(() => card?.removeAttribute("data-flipping"), FLIP_MS));

      /* The last card of a cycle gets the full flip before card one starts
         again — "loops back after the last card finishes" — where every other
         hand-off overlaps. No pause either way: the restart lands exactly as the
         final card settles. */
      const last = index === cards.length - 1;
      timers.push(window.setTimeout(() => step(slot + 1), last ? FLIP_MS : STAGGER_MS));
    };

    const stop = () => {
      running = false;
      timers.forEach(clearTimeout);
      timers = [];
      ul.querySelectorAll("[data-flip-card][data-flipping]").forEach((el) =>
        el.removeAttribute("data-flipping"),
      );
    };

    const start = () => {
      if (running || reduced.matches) return;
      running = true;
      step(0);
    };

    /* Only while on screen. `stop()` clears mid-flight timers, so a card cannot
       be left frozen at scaleX(0) by scrolling away mid-turn. */
    const observer = new IntersectionObserver(
      ([entry]) => (entry?.isIntersecting ? start() : stop()),
      { rootMargin: "100px" },
    );
    observer.observe(ul);

    /* Honoured live, not just at mount: switching the OS setting on stops the
       wave immediately rather than at the next reload. */
    const onPreferenceChange = () => (reduced.matches ? stop() : start());
    reduced.addEventListener("change", onPreferenceChange);

    return () => {
      observer.disconnect();
      reduced.removeEventListener("change", onPreferenceChange);
      stop();
    };
    /* Restarts when the result set changes — a new set is a new wave. */
  }, [dependency]);

  return list;
}

export function WorksGrid({ projects }: { projects: Project[] }) {
  const list = useSerpentineFlip(projects.map((p) => p.slug).join("|"));

  return (
    <>
      {/* The emerald luminance ramp the card artwork is filtered through —
          `<EmeraldFilter />` now renders once, globally, in `PageShell`. */}
      {/*
        1 / 2 / 3 columns on the project's own breakpoints — `tablet` is 810px and
        `desktop` is 1200px, both already in the @theme block, so the widths named
        in the brief land where they should: 3 columns at 1440 and 1280, 2 at
        1024, 1 at 430 and 390. No new breakpoint was invented for this.

        A plain `grid` with one gap, deliberately: the staggered, overlapping
        placement is the HOMEPAGE section's look (`Works.tsx` and its
        `placements[]`, untouched by this file), and repeating it here is what
        made the two pages read as the same thing twice.
      */}
      <ul
        ref={list}
        /* One source of truth for the flip's length: the scheduler's constant
           feeds the CSS animation through this variable, so the attribute can
           never be removed before — or long after — the keyframes finish. */
        style={{ "--flip-duration": `${FLIP_MS}ms` } as React.CSSProperties}
        className="grid grid-cols-1 gap-6 tablet:grid-cols-2 tablet:gap-8 desktop:grid-cols-3"
      >
        {projects.map((project, i) => (
          <ProjectGridCard
            key={project.slug}
            project={project}
            art={project.thumbnail ?? placeholderArt(i)}
            isPlaceholder={!project.thumbnail}
          />
        ))}
      </ul>
    </>
  );
}

/**
 * One card. Two interactive layers, neither nested inside the other:
 *
 *   z-10  the stretched link — the card-level action
 *   z-20  the two buttons — their own controls, siblings of the link
 *
 * Because the buttons are siblings rather than children of the link, a click on
 * one is never in the link's event path: the card's navigation is not merely
 * suppressed, it cannot fire. Same structure the Featured Work card uses.
 *
 * The `<li>` is `display: contents` so the `<article>` is what the grid actually
 * places. Keeping the list semantics costs a wrapper element; letting that
 * wrapper become the grid item instead would put the border, the rounding and
 * the hover pop on a box one level away from the one being sized.
 */
function ProjectGridCard({
  project,
  art,
  isPlaceholder,
}: {
  project: Project;
  art: ImageSource;
  /** True when `art` is the cycled abstract illustration, not a real
   *  `project.thumbnail` — only the placeholder gets the emerald ramp. */
  isPlaceholder: boolean;
}) {
  return (
    <li className="contents">
      <article
        data-flip-card=""
        className={
          "group/card relative flex h-[300px] flex-col overflow-hidden " +
          "rounded-[var(--radius-md)] border border-black/8 bg-surface shadow-card " +
          "tablet:h-[320px] tablet:rounded-[var(--radius-lg)] desktop:h-[360px] " +
          /*
            Only `scale` transitions now. The carousel also animated transform,
            filter and opacity on the 800ms spring because those carried its
            position and falloff; a static card has none of that, so the hover
            pop is the whole animation and it keeps the 400ms button easing it
            always had — at 800ms a pop-out lags the cursor badly enough to feel
            broken.

            Still `scale` rather than `transform`: Tailwind v4 emits the
            standalone `scale` property for `scale-*` utilities, so the
            transition has to name that property to have any effect at all.

            `hover:z-10` lifts the popped card above its neighbours — without it
            the 3.5% overhang slides under whichever card the grid paints next.
          */
          "transition-[scale] duration-[var(--duration-medium)] ease-[var(--ease-brand)] " +
          "hover:z-10 hover:scale-[1.035] " +
          "motion-reduce:transition-none motion-reduce:hover:scale-100 " +
          /*
            The flip, driven entirely by the presence of the attribute the
            scheduler sets. `linear` at the animation level because the keyframes
            carry their own per-half easing.

            `motion-reduce:animate-none` belts what the scheduler already braces:
            the hook refuses to start under `prefers-reduced-motion`, and this
            means that even if an attribute were somehow set, nothing moves.

            Nothing here touches the hover pop, the click layers or focus. The
            animation is on `transform` while hover owns `scale`; the attribute
            is decorative and carries no ARIA, no `pointer-events` change and no
            `tabindex`, so the card stays as clickable and as focusable
            mid-flip as it is at rest.
          */
          "data-flipping:animate-[card-flip_var(--flip-duration)_linear_both] " +
          "motion-reduce:animate-none"
        }
      >
        {/* ---- top 60%: artwork + overlaid actions -------------------------- */}
        <div className="relative h-[60%] shrink-0 overflow-hidden bg-background">
          {/*
            The emerald ramp only belongs on the abstract placeholder — it
            collapses colour to luminance and remaps it onto green, which is
            right for colourless sculpture and wrong for a real screenshot's
            actual colours. A real `project.thumbnail` renders unfiltered.
          */}
          <div style={isPlaceholder ? { filter: "url(#gst-emerald)" } : undefined} className="absolute inset-0">
            <Picture
              source={art}
              /* Decorative either way: the title and category below say what
                 this is. A placeholder describes nothing about the project; a
                 real thumbnail is still supporting art, not information. */
              alt=""
              width={1024}
              height={1024}
              /* Tracks the column count above, so a phone is not handed the
                 three-across crop and a desktop is not handed a full-width one. */
              sizes="(min-width: 1200px) 33vw, (min-width: 810px) 50vw, 100vw"
              className="size-full scale-110 object-cover"
            />
          </div>

          {/* A real video: same `z-20`, always-visible play affordance as
              `ProjectCard`'s — see there for why it isn't hover-only. */}
          {project.media?.type === "video" && (
            <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
              <PlayButton project={project} className="pointer-events-auto" />
            </div>
          )}

          {/* Long and weak rather than short and strong — the placeholder renders
              are near-white, and a tight ramp read as a grey band pasted across
              the image instead of a vignette. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,rgb(20_20_20/0.34),rgb(20_20_20/0.12)_45%,transparent)]"
          />

          {/*
            `pointer-events-none` on the bar, `auto` on the controls.

            The bar is a full-width strip, so without this it swallows every click
            that lands in its padding or in the empty space beside "View details":
            such a click hits this div, which has no handler, and the card simply
            does nothing. Only the two buttons should intercept; everywhere else in
            the strip belongs to the card's own link underneath.
          */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-wrap gap-2 p-3 tablet:p-4 [&>*]:pointer-events-auto">
            <ContactButton size="md">Start this project</ContactButton>
            <Button href={`/works/${project.slug}`} tone="light" size="md">
              View details
            </Button>
          </div>
        </div>

        {/* ---- bottom 40%: the words ---------------------------------------- */}
        <div className="flex h-[40%] flex-col justify-center gap-2 px-4 py-3 tablet:px-5">
          {/*
            `Pill`, not a bare span — the existing tag/eyebrow chip, reused rather
            than inventing a new "labelled text" treatment. `size="eyebrow"` is the
            one already built in this exact type style (font-mono, uppercase, the
            label tracking), so this is only "give it a background" and nothing
            about the type changed; `dot={false}` because the leading dot is an
            eyebrow-specific mark this label never had.
          */}
          <Pill size="eyebrow" dot={false} className="self-start">
            {project.category} · {project.type}
          </Pill>
          <h2 className="font-display text-heading-sm leading-[1.1] tracking-[-0.02em] text-ink opsz-32">
            {project.title}
          </h2>
          <p className="line-clamp-2 text-body-md text-body">{project.description}</p>
        </div>

        {/*
          The glass sweep.

          A soft diagonal band of light that crosses the whole card once per hover
          — the site already leads with a glass sculpture and frosted keyword
          panels, so this is that same material catching the light, not a generic
          UI shine.

          Deliberately across the WHOLE card rather than only the artwork: light
          falls on a pane, not on part of one. It reads strongest over the emerald
          image and nearly disappears over the white detail panel, which is exactly
          how a highlight behaves on glass over a light ground.

          Sits at z-[15] — above the image and the copy, below the z-20 buttons, so
          light passes over the surface without washing out the two controls. The
          card's own `overflow-hidden` clips it to the rounded shape, so no separate
          mask is needed. `pointer-events-none` keeps every click layer intact.
        */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[15] overflow-hidden motion-reduce:hidden"
        >
          <span
            className={
              "absolute inset-y-[-60%] left-0 w-[38%] -translate-x-[180%] rotate-[18deg] blur-[8px] " +
              "bg-[linear-gradient(90deg,transparent_0%,rgb(255_255_255/0.10)_35%,rgb(255_255_255/0.40)_50%,rgb(255_255_255/0.10)_65%,transparent_100%)] " +
              "group-hover/card:animate-[glass-sweep_1100ms_var(--ease-brand)]"
            }
          />
        </span>

        {/* The card-level target, stretched beneath the buttons. It always
            navigates — there is no focused card to bring forward first. */}
        <Link
          href={`/works/${project.slug}`}
          className="absolute inset-0 z-10 rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green tablet:rounded-[var(--radius-lg)]"
        >
          <span className="sr-only">View {project.title}</span>
        </Link>
      </article>
    </li>
  );
}
