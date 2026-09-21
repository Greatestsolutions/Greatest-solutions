"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ContactButton } from "@/components/contact/ContactButton";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Pill } from "@/components/ui/Pill";
import { cn } from "@/lib/cn";
import type { Service } from "@/data/services";

/**
 * The `/services` carousel: a horizontal row of landscape cards, the middle one
 * focused, its neighbours peeking in from both sides, advancing on a timer.
 *
 * This began as a copy of the `/works` carousel, which has since been replaced
 * by a static grid — so the rationale that file carried now lives here, as the
 * only carousel left on the site.
 *
 * ## Timer-driven, and why that replaced the scroll track
 *
 * The earlier version mirrored `ServiceScroller`: a tall track with a sticky
 * stage, where the focused card was a pure function of scroll position. That is
 * why it could not loop — a real scroll track has ends, and wrapping would mean
 * teleporting the document mid-gesture.
 *
 * Autoplay is the opposite model. Two things cannot both own "which card is
 * active": a timer that advances every few seconds and a scroll position that
 * pins the index would overwrite each other on every frame. So the track is gone
 * entirely. This is an ordinary fixed-height block with `active` in React state,
 * moved by a timer and by clicks — nothing here reads `window.scrollY`, and
 * there is no oversized track for the page to scroll through.
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
 * touched. Below that threshold nothing here fires at all — the click underneath
 * a short tap reaches its target exactly as if none of this existed. At or past
 * it: for a horizontal gesture the whole row follows the pointer 1:1
 * (`dragOffset`, transition zeroed so it cannot lag); for a vertical one on
 * touch, tracking is abandoned and the browser's own scroll — already running,
 * because `touch-pan-y` told it to start without waiting on us — continues
 * untouched. Release resolves to whichever of go(1) / go(-1) / snap-back the
 * distance earns, and a following capture-phase handler swallows the click that
 * would otherwise land on whatever the pointer released over.
 *
 * ## Why this was never made generic over the works cards
 *
 * The two data shapes diverge (services have no `category`/`type`, works have no
 * `tags`) and the two pages had to stay free to drift independently — which is
 * exactly what happened: `/works` is a grid now and this is not. Sharing one
 * component would have made that divergence a refactor instead of a deletion.
 *
 * What is specific to services here:
 *   - Art is each service's OWN `illustration` — real per-item artwork, not a
 *     cycled placeholder (services never needed a placeholder in the first
 *     place; the arc-scroller version already used the real asset per item).
 *   - The eyebrow pill reads `tags.join(" · ")` in place of `category · type`
 *     — services have no category/type pair, but three short capability tags
 *     already exist per item and read the same way in that slot.
 *   - Both actions route through `/services/[slug]`, matching the buttons the
 *     arc-scroller's `ServiceCard` already used before this replaced it.
 */

/** How long a card holds focus before the carousel advances. */
const AUTOPLAY_MS = 4000;

const SCALE_STEP = 0.09;
const BLUR_STEP = 1.6;
const BLUR_MAX = 5;
const OPACITY_STEPS = [1, 0.72, 0.26] as const;
const STEP_RATIO = 0.72;
const VISIBLE_SPAN = 2;

const DRAG_SLOP_PX = 8;
const ADVANCE_RATIO = 0.2;
const MIN_ADVANCE_PX = 60;

export function ServicesCarousel({ services }: { services: Service[] }) {
  const count = services.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const viewport = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLElement | null>(null);

  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef({
    id: null as number | null,
    startX: 0,
    startY: 0,
    horizontal: null as boolean | null,
    dragging: false,
  });
  const suppressClick = useRef(false);

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

  useEffect(() => {
    if (count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, count]);

  const offsetOf = useCallback(
    (i: number) => {
      let d = i - active;
      if (d > count / 2) d -= count;
      if (d < -count / 2) d += count;
      return d;
    },
    [active, count],
  );

  const go = useCallback((delta: 1 | -1) => setActive((i) => (i + delta + count) % count), [count]);

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
      if (Math.abs(dx) < DRAG_SLOP_PX && Math.abs(dy) < DRAG_SLOP_PX) return;
      g.horizontal = Math.abs(dx) > Math.abs(dy);
      if (!g.horizontal) {
        g.id = null;
        return;
      }
      g.dragging = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }

    if (!g.dragging) return;
    event.preventDefault();
    setDragOffset(dx);
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (g.id !== event.pointerId) return;
    if (g.dragging) {
      const dx = event.clientX - g.startX;
      const threshold = Math.max(MIN_ADVANCE_PX, step * ADVANCE_RATIO);
      if (dx <= -threshold) go(1);
      else if (dx >= threshold) go(-1);
      suppressClick.current = true;
    }
    gesture.current = { id: null, startX: 0, startY: 0, horizontal: null, dragging: false };
    setDragging(false);
    setDragOffset(0);
  };

  return (
    <div
      ref={viewport}
      onFocusCapture={(event) => {
        if (event.target.matches(":focus-visible")) setPaused(true);
      }}
      onBlurCapture={() => setPaused(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDragStart={(event) => event.preventDefault()}
      onClickCapture={(event) => {
        if (!suppressClick.current) return;
        suppressClick.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      className={cn(
        "relative w-full touch-pan-y overflow-hidden py-12 select-none",
        dragging ? "cursor-grabbing" : "cursor-grab",
      )}
    >
      {/* The emerald ramp the illustrations are painted through —
          `<EmeraldFilter />` now renders once, globally, in `PageShell`. */}
      <div className="relative h-[300px] tablet:h-[320px] desktop:h-[360px]">
        {services.map((service, i) => {
          const d = offsetOf(i);
          const distance = Math.abs(d);
          const hidden = distance > VISIBLE_SPAN;
          return (
            <CarouselCard
              key={service.slug}
              ref={i === 0 ? card : undefined}
              service={service}
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
                transitionDuration: dragging ? "0s" : undefined,
              }}
              onFocusRequest={() => setActive(i)}
            />
          );
        })}
      </div>

      {count > 1 && (
        <div className="relative z-0 mt-6 flex items-center justify-center gap-3">
          <ArrowButton direction="prev" onClick={() => go(-1)} />
          <ArrowButton direction="next" onClick={() => go(1)} />
        </div>
      )}
    </div>
  );
}

function ArrowButton({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous service" : "Next service"}
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

function CarouselCard({
  ref,
  service,
  index,
  focused,
  hidden,
  style,
  onFocusRequest,
}: {
  ref?: React.Ref<HTMLElement>;
  service: Service;
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
        "[transition:transform_var(--duration-spring)_var(--ease-spring),filter_var(--duration-spring)_var(--ease-spring),opacity_var(--duration-spring)_var(--ease-spring),scale_var(--duration-medium)_var(--ease-brand)] " +
        "hover:scale-[1.035] " +
        "will-change-transform motion-reduce:[transition:none] motion-reduce:hover:scale-100 " +
        (hidden ? "pointer-events-none invisible" : "pointer-events-auto")
      }
      aria-hidden={hidden || undefined}
    >
      {/* ---- top 60%: artwork + overlaid actions -------------------------- */}
      <div className="relative h-[60%] shrink-0 overflow-hidden bg-background">
        <div style={{ filter: "url(#gst-emerald)" }} className="absolute inset-0">
          <Picture
            source={service.illustration}
            alt=""
            width={1024}
            height={1024}
            sizes="560px"
            className="size-full scale-110 object-cover"
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(to_top,rgb(20_20_20/0.34),rgb(20_20_20/0.12)_45%,transparent)]"
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-wrap gap-2 p-3 tablet:p-4 [&>*]:pointer-events-auto">
          <ContactButton size="md">Start this service</ContactButton>
          <Button href={`/services/${service.slug}`} tone="light" size="md">
            View roadmap
          </Button>
        </div>
      </div>

      {/* ---- bottom 40%: the words ---------------------------------------- */}
      <div className="flex h-[40%] flex-col justify-center gap-2 px-4 py-3 tablet:px-5">
        {/* Services have no category/type pair — the three capability tags
            already on each service read the same way in this slot. */}
        <Pill size="eyebrow" dot={false} className="self-start">
          {service.tags.join(" · ")}
        </Pill>
        <h2 className="font-display text-heading-sm leading-[1.1] tracking-[-0.02em] text-ink opsz-32">
          {service.title}
        </h2>
        <p className="line-clamp-2 text-body-md text-body">{service.description}</p>
      </div>

      {/* The glass sweep — same treatment `WorksGrid`'s cards carry; see the
          full rationale there. */}
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

      <Link
        href={`/services/${service.slug}`}
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
          {focused ? `View ${service.title}` : `Bring ${service.title} into focus`}
        </span>
      </Link>
    </article>
  );
}
