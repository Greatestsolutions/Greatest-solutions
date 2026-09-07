"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ContactButton } from "@/components/contact/ContactButton";
import { EmeraldFilter } from "@/components/services/EmeraldFilter";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";
import type { ImageSource } from "@/types/media";
import type { Project } from "@/data/works";

/**
 * The works carousel: a horizontal row of landscape cards, the middle one
 * focused, its neighbours peeking in from both sides, advancing on a timer.
 *
 * ## Timer-driven, and why that replaced the scroll track
 *
 * The previous version mirrored `ServiceScroller`: a tall track with a sticky
 * stage, where the focused card was a pure function of scroll position. That is
 * why it could not loop — a real scroll track has ends, and wrapping would mean
 * teleporting the document mid-gesture.
 *
 * Autoplay is the opposite model. Two things cannot both own "which card is
 * active": a timer that advances every two seconds and a scroll position that
 * pins the index would overwrite each other on every frame. So the track is gone
 * entirely. This component is an ordinary fixed-height block with `activeIndex`
 * in React state, moved by a timer and by clicks — nothing here reads
 * `window.scrollY`, and there is no oversized track for the page to scroll
 * through. Scrolling past this section is now simply scrolling past a section.
 *
 * ## Looping
 *
 * Offsets are computed on the shorter way round the ring, so the card "before"
 * the first is the last one. Advancing from the end wraps without any card
 * visibly flying across the viewport: the one that wraps is at |offset| ≈ half
 * the count, where opacity is already 0.
 *
 * ## Drag / swipe
 *
 * One Pointer Events pipeline drives mouse drag and touch swipe alike: a small
 * `DRAG_SLOP_PX` of movement decides tap vs. drag AND, for touch, horizontal
 * vs. vertical, before anything visual happens or any native behaviour is
 * touched. Below that threshold nothing here fires at all — the click
 * underneath a short tap or a real click reaches its target exactly as if none
 * of this existed. At or past it: for a horizontal gesture, the whole row
 * starts following the pointer 1:1 (`dragOffset`, transition zeroed so it
 * cannot lag); for a vertical one on touch, tracking is abandoned and the
 * browser's own scroll — already running, because `touch-pan-y` told it to
 * start without waiting on us — continues untouched. Release resolves to
 * whichever of go(1) / go(-1) / snap-back the distance earns, through the same
 * `active` state and the same spring transition autoplay and the arrows use,
 * and a following capture-phase handler swallows the click that would
 * otherwise land on whatever the pointer released over.
 */

/*
 * Placeholder artwork — unchanged reasoning from the stack version.
 *
 * None of the six projects has a screenshot. These are the abstract service
 * renders, cycled, already in `public/services` and already through
 * `npm run assets:images`.
 *
 * Deliberately NOT `public/works/*.png`: those are the Orionix template's own
 * project screenshots (axn, fluxa, nova, river, rivermark, season), and showing a
 * template's dashboard under the title "PriceWatch" would read as a screenshot of
 * our work — the same invention as a fake client. Abstract sculpture cannot be
 * mistaken for a product screenshot.
 *
 * A "Placeholder image" badge used to say so on the card as well; it was
 * removed on request as visual clutter. Nothing about the swap plan changed —
 * `placeholderArt` below is still exactly what a real `project.thumbnail`
 * replaces once one exists — only the on-card label is gone.
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

/** How long a card holds focus before the carousel advances. */
const AUTOPLAY_MS = 4000;

/*
 * Falloff, carried over from the stack and applied horizontally. Same values,
 * same reason: every one is smaller than the reference demo's, which scales 0.85
 * and blurs 10px. There is no rotation and no light sweep.
 */
const SCALE_STEP = 0.09;
const BLUR_STEP = 1.6; // px per card of separation
const BLUR_MAX = 5;
/**
 * Opacity by distance from the focused card, indexed 0/1/2. A lookup rather
 * than `1 - distance * step`, because a single linear step ties the ±1 and ±2
 * values together — nudging ±1 up always nudged ±2 up by the same amount, and
 * the two needed different-sized bumps (±1 "moderate", ±2 "slight") while
 * keeping ±2 clearly the fainter of the two. Independent entries make that a
 * direct edit instead of solving for a slope.
 *
 * Was `[1, 0.58, 0.16]`. ±1 moved up 0.14 (a moderate lift — the previous value
 * read as too faint to comfortably read); ±2 moved up only 0.10, a slighter
 * lift that still leaves it well under half of ±1's opacity, so the focused >
 * ±1 > ±2 hierarchy stays as legible as it was.
 */
const OPACITY_STEPS = [1, 0.72, 0.26] as const;
/** Neighbour spacing, as a fraction of card width — under 1, so cards overlap. */
const STEP_RATIO = 0.72;
/** Cards further than this from the focus are not drawn at all. */
const VISIBLE_SPAN = 2;

/*
 * Drag / swipe.
 *
 * One threshold serves two jobs, deliberately: below it, a gesture reads as a
 * tap — no visual follow, no direction lock, the click underneath fires as if
 * none of this existed. At or past it, the gesture is a drag — the row starts
 * following the pointer 1:1, and whatever click would otherwise land at
 * release is suppressed. A single number keeps those two judgments consistent
 * with each other; two separate thresholds could disagree about a gesture at
 * the boundary between them.
 */
const DRAG_SLOP_PX = 8;
/** How far a drag has to travel, past `DRAG_SLOP_PX`, before release advances
 *  the carousel instead of snapping back — the larger of a flat floor and a
 *  fraction of the measured card spacing, so it scales with card size but
 *  never gets so small that a card sitting close to another is one accidental
 *  pixel from moving. */
const ADVANCE_RATIO = 0.2;
const MIN_ADVANCE_PX = 60;

export function WorksCarousel({ projects }: { projects: Project[] }) {
  const count = projects.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement | null>(null);

  /*
   * Drag state. `dragOffset` is applied to every card's transform on top of
   * its resting `d * step`, which is what makes the whole row follow the
   * pointer together rather than one card moving in isolation. `dragging`
   * additionally strips the transition duration while true, so the follow is
   * instant 1:1 tracking rather than lagging the pointer through an eased
   * curve — the spring transition returns the moment the gesture ends, which
   * is what turns the release into a snap.
   *
   * `gesture` is a ref, not state: it is read and written inside the same
   * pointer-event handlers every frame of a drag, and routing that through
   * `setState` would re-render on every pixel of movement for data nothing
   * ever renders from directly (only the derived `dragOffset` needs to).
   */
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef({
    id: null as number | null,
    startX: 0,
    startY: 0,
    /** null = not yet decided, true = horizontal drag, false = abandoned (vertical). */
    horizontal: null as boolean | null,
    /** Crossed DRAG_SLOP_PX as a horizontal gesture — the tap/drag line. */
    dragging: false,
  });
  /** Set on a real drag's release so the click that follows it is swallowed. */
  const suppressClick = useRef(false);

  /*
   * Neighbour spacing is measured rather than hard-coded, so one component works
   * at every card size without a breakpoint table duplicated in JS.
   *
   * A ResizeObserver rather than a resize listener plus a synchronous first
   * measure: it reports the initial size in its own first callback, so the width
   * arrives the same way every later change does — no setState during the effect
   * body, and no cascading render on mount.
   */
  useEffect(() => {
    const el = card.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.borderBoxSize?.[0]?.inlineSize ?? entry?.contentRect.width ?? 0;
      setStep(width * STEP_RATIO);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /*
   * Autoplay.
   *
   * A `setTimeout` re-armed on every change of `active`, not a free-running
   * `setInterval`: clicking a side card changes `active`, which tears this effect
   * down and starts a fresh two seconds. With an interval, a click landing 1.9s
   * into a tick would be overridden 100ms later.
   *
   * Disabled outright under `prefers-reduced-motion` — continuous unrequested
   * movement is precisely what that preference asks us not to do. Clicking a card
   * still works, so nothing becomes unreachable.
   */
  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, count]);

  /** Shortest signed distance from the focused card, going either way round. */
  const offsetOf = useCallback(
    (i: number) => {
      let d = i - active;
      if (d > count / 2) d -= count;
      if (d < -count / 2) d += count;
      return d;
    },
    [active, count],
  );

  /*
   * Arrow navigation. `(active + count + delta) % count` rather than plain
   * `(active + delta) % count`, because JavaScript's `%` can return a negative
   * result for a negative left-hand side — `-1 % 6` is `-1`, not `5` — and that
   * would index the array with a negative number going left from the first card
   * instead of wrapping to the last one.
   *
   * Resetting the autoplay timer needs no separate code: it is keyed to
   * `active` in the effect above, so calling `setActive` here tears down
   * whatever timeout was pending and starts a fresh one — identical to what a
   * card click already does.
   */
  const go = useCallback((delta: 1 | -1) => setActive((i) => (i + delta + count) % count), [count]);

  /*
   * Pointer Events, not separate mouse/touch listeners — one code path covers
   * mouse drag and touch swipe identically, which is what "works with both"
   * means here rather than two parallel implementations that could drift.
   *
   * `touch-pan-y` in the className below is what actually keeps vertical
   * scroll working, and it is doing real work, not decoration: it tells the
   * browser up front that this element's OWN gesture handling only cares
   * about the horizontal axis, so the browser starts a native vertical scroll
   * immediately on a vertical touch rather than waiting to see whether our
   * JavaScript calls `preventDefault()`. Relying on `preventDefault()` alone,
   * decided after the fact inside `onPointerMove`, is exactly the race that
   * makes touch scrolling feel broken on the first swipe of a session.
   */
  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    gesture.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, horizontal: null, dragging: false };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (g.id !== event.pointerId) return;
    const dx = event.clientX - g.startX;
    const dy = event.clientY - g.startY;

    if (g.horizontal === null) {
      if (Math.abs(dx) < DRAG_SLOP_PX && Math.abs(dy) < DRAG_SLOP_PX) return; // not enough movement to judge yet
      g.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!g.horizontal) {
        // Vertical gesture: this is a touch scroll, not ours. Stop tracking
        // this pointer and never call preventDefault, so the browser's own
        // (already-running, thanks to touch-pan-y) scroll continues untouched.
        g.id = null;
        return;
      }
      g.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }

    if (!g.dragging) return;
    // Only reached once a horizontal drag is confirmed, so this never fights
    // a vertical scroll — the branch above already excluded that case.
    event.preventDefault();
    setDragOffset(dx);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (g.id !== event.pointerId) return;
    if (g.dragging) {
      const dx = event.clientX - g.startX;
      const threshold = Math.max(MIN_ADVANCE_PX, step * ADVANCE_RATIO);
      // Left = next, right = previous — the same reading direction a physical
      // stack of cards would use: dragging the current one out of the way to
      // the left reveals what comes next.
      if (dx <= -threshold) go(1);
      else if (dx >= threshold) go(-1);
      // Short of the threshold: `active` is untouched, and resetting
      // `dragOffset` below is itself the snap back to the resting position.
      suppressClick.current = true;
    }
    gesture.current = { id: null, startX: 0, startY: 0, horizontal: null, dragging: false };
    setDragging(false);
    setDragOffset(0);
  };

  return (
    <div
      ref={viewport}
      /*
        Hover does NOT pause — requested explicitly. The carousel advances on its
        timer wherever the pointer is, with the known consequence that a card can
        slide out from under a stationary cursor and cut its own hover effect
        short.

        Keyboard focus still pauses, and that is deliberate rather than an
        oversight: a visitor who has tabbed into a card is mid-interaction with a
        control they cannot see move away from, and content that auto-advances out
        from under the keyboard has no equivalent of "move the mouse elsewhere" to
        recover. `onFocusCapture`/`onBlurCapture` rather than the bubbling pair,
        because focus events do not bubble.

        Gated on `:focus-visible`, not on focus alone — that distinction is what
        the arrow buttons added in this task exposed. Chromium focuses a <button>
        on pointer click as well as on Tab, so an unconditional `onFocusCapture`
        paused on every arrow click and never resumed, because nothing then blurs
        it: no timer means no tick to notice the pointer had moved on. Reading
        `:focus-visible` keeps the pause for the keyboard case this exists for —
        Tab reliably sets it — while a mouse click on the arrow does not match it,
        so autoplay keeps running exactly as a click-driven advance should.
      */
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) setPaused(true);
      }}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      // Chromium/Firefox start native image/link drag-and-drop on mousedown+
      // move over an <img> or <a>, which would hijack the gesture our pointer
      // handlers are already tracking. Cancelled at the root so it can never
      // start, on every card, rather than disabling it per element.
      onDragStart={(event) => event.preventDefault()}
      /*
        Swallows the click a real drag leaves behind.

        A drag calls `preventDefault()` on its pointermove events, which stops
        the browser's OWN gesture (scroll, native drag) — it does not stop the
        ordinary click event pointerup still dispatches afterward on whatever
        element is under the pointer. Left alone, releasing a drag over "View
        roadmap" would both move the carousel AND follow that link. Capture
        phase, so this runs before the click reaches the link or either
        button, whichever the pointer happened to be over.
      */
      onClickCapture={(event) => {
        if (!suppressClick.current) return;
        suppressClick.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      /*
        `touch-pan-y`: this element handles its own horizontal gesture, so the
        browser should keep native vertical panning rather than waiting on our
        JavaScript to decide — see the note above `onPointerMove`.
        `select-none`: a drag is a click-and-hold-and-move by construction, and
        without this a mouse drag highlights the card's text along the way.
      */
      className={cn(
        "relative w-full touch-pan-y overflow-hidden py-12 select-none",
        // Grab affordance for mouse; harmless (and unseen) on touch.
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      {/* The emerald ramp the placeholder art is painted through. Defined here
          because this page has no Services section to provide it. */}
      <EmeraldFilter />

      {/* Fixed height: the tallest card plus room for its shadow. No track. */}
      <div className="relative h-[300px] tablet:h-[320px] desktop:h-[360px]">
        {projects.map((project, i) => {
          const d = offsetOf(i);
          const distance = Math.abs(d);
          const hidden = distance > VISIBLE_SPAN;
          return (
            <CarouselCard
              key={project.slug}
              ref={i === 0 ? card : undefined}
              project={project}
              art={placeholderArt(i)}
              index={i}
              focused={d === 0}
              hidden={hidden}
              style={{
                transform: `translate(calc(-50% + ${(d * step + dragOffset).toFixed(1)}px), -50%) scale(${(
                  1 - Math.min(distance, VISIBLE_SPAN) * SCALE_STEP
                ).toFixed(4)})`,
                filter: distance === 0 ? "none" : `blur(${Math.min(distance * BLUR_STEP, BLUR_MAX).toFixed(2)}px)`,
                opacity: hidden ? 0 : OPACITY_STEPS[Math.min(distance, VISIBLE_SPAN)],
                zIndex: 100 - Math.round(distance * 10),
                // Zeroed while actively dragging, so the row follows the pointer
                // 1:1 instead of lagging behind through the spring easing — the
                // transition returns the instant the gesture ends, on the same
                // property change that snaps or advances the row.
                transitionDuration: dragging ? "0s" : undefined,
              }}
              onFocusRequest={() => setActive(i)}
            />
          );
        })}
      </div>

      {/*
        Arrow navigation. Its own row BELOW the card stage, not layered onto it —
        the stage is a fixed-height block and this sits after it in flow, so it
        can never sit behind the glass sweep (z-[15]) or the button bar (z-20)
        that live inside a card; there is no shared stacking context to collide
        in. Centred under the row, matching where a carousel's own controls
        conventionally sit.
      */}
      {count > 1 && (
        <div className="relative z-0 mt-6 flex items-center justify-center gap-3">
          <ArrowButton direction="prev" onClick={() => go(-1)} />
          <ArrowButton direction="next" onClick={() => go(1)} />
        </div>
      )}
    </div>
  );
}

/**
 * Previous/next control.
 *
 * Not a new button style: same circular hairline-and-glass recipe the contact
 * dialog's close button already uses (`size-9`, `rounded-full`,
 * `border-hairline-strong`, `bg-surface`, the same hover and focus-visible
 * treatment) — one more instance of an existing pattern rather than a bespoke
 * carousel control. The chevron is the same stroke path the navbar's dropdown
 * and heading-size chevrons already draw, rotated to point left or right.
 */
function ArrowButton({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous project" : "Next project"}
      className={
        "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full " +
        "border border-hairline-strong bg-surface text-body " +
        "transition-colors duration-[var(--duration-quick)] ease-[var(--ease-brand)] " +
        "hover:bg-scrim-06 hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
      }
    >
      <svg
        viewBox="0 0 12 12"
        className={direction === "prev" ? "size-3 rotate-90" : "size-3 -rotate-90"}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/**
 * One card. Three interactive layers, none nested inside another:
 *
 *   z-10  the stretched link — the card-level action
 *   z-20  the two buttons — their own controls, siblings of the link
 *
 * Because the buttons are siblings rather than children of the link, a click on
 * one is never in the link's event path: the card's navigation is not merely
 * suppressed, it cannot fire. Same structure the Featured Work card uses.
 */
function CarouselCard({
  ref,
  project,
  art,
  index,
  focused,
  hidden,
  style,
  onFocusRequest,
}: {
  ref?: React.Ref<HTMLElement>;
  project: Project;
  art: ImageSource;
  index: number;
  focused: boolean;
  hidden: boolean;
  style: React.CSSProperties;
  onFocusRequest: () => void;
}) {
  return (
    <article
      ref={ref}
      data-carousel-card={index}
      data-state={focused ? "focused" : "adjacent"}
      style={style}
      className={
        "group/card absolute top-1/2 left-1/2 flex h-full w-[min(88vw,400px)] flex-col overflow-hidden " +
        "rounded-[var(--radius-md)] border border-black/8 bg-surface shadow-card " +
        "tablet:w-[480px] tablet:rounded-[var(--radius-lg)] desktop:w-[560px] " +
        /*
          Two timings, not one, which is why this is written out rather than using
          `transition-[…] duration-…`.

          The carousel's own movement — transform, filter, opacity — rides the
          800ms spring the services choreography uses. The hover pop is a
          different gesture and wants the 400ms button easing; at 800ms a pop-out
          lags the cursor badly enough to feel broken.

          The pop is on `scale`, a separate CSS property from `transform`, which is
          what lets it multiply cleanly onto the inline transform the carousel
          writes for position and falloff instead of overwriting it.
        */
        "[transition:transform_var(--duration-spring)_var(--ease-spring),filter_var(--duration-spring)_var(--ease-spring),opacity_var(--duration-spring)_var(--ease-spring),scale_var(--duration-medium)_var(--ease-brand)] " +
        "hover:scale-[1.035] " +
        "will-change-transform motion-reduce:[transition:none] motion-reduce:hover:scale-100 " +
        // A card faded out of the ring must not intercept clicks meant for what
        // is behind it, and must not be a tab stop.
        (hidden ? "pointer-events-none invisible" : "pointer-events-auto")
      }
      aria-hidden={hidden || undefined}
    >
      {/* ---- top 60%: artwork + overlaid actions -------------------------- */}
      <div className="relative h-[60%] shrink-0 overflow-hidden bg-background">
        <div style={{ filter: "url(#gst-emerald)" }} className="absolute inset-0">
          <Picture
            source={art}
            /* Decorative: the title and category below say what this is, and the
               image is a placeholder that describes nothing about the project. */
            alt=""
            width={1024}
            height={1024}
            sizes="560px"
            className="size-full scale-110 object-cover"
          />
        </div>

        {/* Long and weak rather than short and strong — the placeholder renders
            are near-white, and a tight ramp read as a grey band pasted across the
            image instead of a vignette. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,rgb(20_20_20/0.34),rgb(20_20_20/0.12)_45%,transparent)]"
        />

        {/*
          `pointer-events-none` on the bar, `auto` on the controls.

          The bar is a full-width strip, so without this it swallowed every click
          that landed in its padding or in the empty space beside "View roadmap" —
          measured: a click there hit this div, which has no handler, and the card
          simply did nothing. Only the two buttons should intercept; everywhere
          else in the strip belongs to the card's own link underneath.
        */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-wrap gap-2 p-3 tablet:p-4 [&>*]:pointer-events-auto">
          <ContactButton size="md">Start this project</ContactButton>
          <Button href={`/works/${project.slug}`} tone="light" size="md">
            View roadmap
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

        A soft diagonal band of light that crosses the whole card once per hover —
        the site already leads with a glass sculpture and frosted keyword panels,
        so this is that same material catching the light, not a generic UI shine.

        Deliberately across the WHOLE card rather than only the artwork: light
        falls on a pane, not on part of one. It reads strongest over the emerald
        image and nearly disappears over the white detail panel, which is exactly
        how a highlight behaves on glass over a light ground.

        Sits at z-[15] — above the image and the copy, below the z-20 buttons, so
        light passes over the surface without washing out the two controls. The
        card's own `overflow-hidden` clips it to the rounded shape, so no separate
        mask is needed. `pointer-events-none` keeps every click layer intact.

        Toned well down from the reference's version: 0.4 alpha at the peak,
        blurred 8px, and gated on hover rather than looping on its own.
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

      {/*
        The card-level target. Stretched across the card beneath the buttons.
        On the focused card it navigates; on a peeking one it brings that card
        into focus instead — and resets the autoplay timer by changing `active`.
      */}
      <Link
        href={`/works/${project.slug}`}
        tabIndex={hidden ? -1 : undefined}
        onClick={(event) => {
          if (!focused) {
            event.preventDefault();
            onFocusRequest();
          }
        }}
        className="absolute inset-0 z-10 rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green tablet:rounded-[var(--radius-lg)]"
      >
        <span className="sr-only">
          {focused ? `View ${project.title}` : `Bring ${project.title} into focus`}
        </span>
      </Link>
    </article>
  );
}
