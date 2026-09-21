"use client";

import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { ProgressDial } from "@/components/services/ProgressDial";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceScroller } from "@/components/services/ServiceScroller";
import type { Service } from "@/data/services";

/** How many services show before "Show more". One press reveals the rest —
 *  unlike `/works`'s batched reveal, there's nothing to page through twice. */
const INITIAL_COUNT = 5;

/**
 * The scroll-tracked dial/track/illustration, plus how many services are
 * revealed. Split out of `Services.tsx` (which stays a Server Component for
 * its header) because the reveal count is real state — a slice of `services`
 * computed at render time — and that has to live somewhere that re-renders,
 * unlike the rest of this section's choreography, which is pure CSS driven
 * by `ServiceScroller`'s own effect.
 *
 * `ServiceScroller` already re-measures whenever its `count` prop changes
 * (see its own effect's dependency array) — it was already built to handle
 * the item set changing size, so passing `visible.length` instead of a fixed
 * `services.length` is the entire integration; nothing there needed touching.
 */
export function ServicesShowcase({ services }: { services: Service[] }) {
  const [revealed, setRevealed] = useState(Math.min(INITIAL_COUNT, services.length));
  const visible = services.slice(0, revealed);
  const hidden = services.length - visible.length;

  /*
   * "Show more" has to sit at the true vertical midpoint between the last
   * visible card's own bottom edge and the item box's bottom edge — not a
   * fixed margin (a card's height varies with its own description length and
   * tag count, so no single margin is right for all ten services), and not
   * an even CSS split either: a first attempt gave the card and the button
   * equal-height halves of the box, which is a different line than "the
   * card's REAL bottom edge" and also shifted the card's own centred
   * position away from every other card's, which nothing asked for.
   *
   * So this measures instead, the same way `ServiceScroller` and
   * `WorksParallax` already do for their own choreography: `itemRef` and
   * `cardRef` bound the two real edges, and the button's `top` is computed
   * from them directly. `ResizeObserver` on both (not just a mount-time
   * measurement) covers a font swap or a viewport resize changing either
   * one's height after paint.
   */
  const itemRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [buttonTop, setButtonTop] = useState<number | null>(null);

  useEffect(() => {
    if (hidden === 0) return;
    const itemEl = itemRef.current;
    const cardEl = cardRef.current;
    if (!itemEl || !cardEl) return;

    const measure = () => {
      const itemRect = itemEl.getBoundingClientRect();
      const cardRect = cardEl.getBoundingClientRect();
      const cardBottom = cardRect.bottom - itemRect.top;

      /*
       * The far boundary is the *next section's* real top edge, not this
       * box's own bottom — there is genuine spacing between them (this
       * section's own bottom padding, the next one's own top padding) that
       * the box's height alone doesn't account for, and undercounting it is
       * exactly what put the button too high the first time this was tried.
       * `Section` renders an actual `<section>`, so this is a real boundary
       * to measure, not a guess.
       */
      const nextSection = itemEl.closest("section")?.nextElementSibling;
      const boundaryBottom = nextSection
        ? nextSection.getBoundingClientRect().top - itemRect.top
        : itemRect.height;

      setButtonTop((cardBottom + boundaryBottom) / 2);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(itemEl);
    observer.observe(cardEl);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [hidden, revealed]);

  return (
    <ServiceScroller count={visible.length}>
      <Container>
        <div className="grid grid-cols-1 gap-3 tablet:grid-cols-8 desktop:grid-cols-12">
          <div
            data-service-stage
            className="pointer-events-none sticky top-0 z-10 col-start-1 row-start-1 h-svh self-start tablet:col-span-2"
          >
            <ProgressDial count={visible.length} />
          </div>

          <div
            data-service-track
            className="col-start-1 row-start-1 max-tablet:pb-9 tablet:col-span-5 tablet:col-start-4 desktop:col-span-6 desktop:col-start-5 desktop:max-w-[540px]"
          >
            {visible.map((service, i) => {
              const isLastWithMore = hidden > 0 && i === visible.length - 1;
              return (
                <div
                  key={service.slug}
                  ref={isLastWithMore ? itemRef : undefined}
                  data-service-item
                  data-state={i === 0 ? "active" : "inactive"}
                  className={[
                    "relative flex min-h-svh tablet:items-center tablet:py-[90px]",
                    /* `flex-col` only matters for the special item, which is
                       the only one with two direct children (card, button) —
                       without it they render side by side in the default row
                       direction on phone, where the button stays in normal
                       flow instead of becoming `absolute` (that only kicks in
                       from `tablet:`). Harmless for every other item, which
                       only ever has the one child ServiceCard. */
                    "max-tablet:flex-col max-tablet:items-start max-tablet:pt-[230px]",
                    "max-tablet:sticky max-tablet:top-0 max-tablet:h-svh",
                    "transition-[opacity,filter] duration-[var(--duration-spring)] ease-[var(--ease-spring)]",
                    "tablet:data-[state=inactive]:opacity-50 tablet:data-[state=inactive]:blur-[4px]",
                    "max-tablet:data-[state=inactive]:not-focus-within:pointer-events-none",
                    "max-tablet:data-[state=inactive]:not-focus-within:opacity-0",
                  ].join(" ")}
                >
                  {/*
                    A dedicated `min-h-svh` slot for "Show more" — the first
                    attempt — doesn't work: the active-index math never counts
                    past `visible.length - 1`, so on phone (where every item is
                    `sticky top-0 h-svh` and only the active one is opaque) the
                    last card never receives `data-state="inactive"` and never
                    releases, permanently covering a separate slot beneath it.
                    Measured, not assumed — a real overlapping-content
                    screenshot at 390 caught it.

                    The card itself renders exactly like every other item's —
                    `ref={cardRef}` on the wrapper is the only addition, purely
                    for the button's measurement above. Its own position is
                    untouched, matching every other card's.
                  */}
                  {isLastWithMore ? (
                    <div ref={cardRef}>
                      <ServiceCard service={service} />
                    </div>
                  ) : (
                    <ServiceCard service={service} />
                  )}

                  {isLastWithMore && (
                    /*
                      `top` is the measured midpoint; unset (server-rendered
                      and for the one frame before the effect above runs) it
                      falls back to sitting right after the card — the same
                      "renders sensibly before JS runs" fallback
                      `WorksParallax`'s own `--parallax: 0.5` default follows.
                      `tablet:absolute` is what makes `top` apply at all —
                      phone stays a plain margin-top below the card, the
                      layout that was already confirmed working there and has
                      no equivalent "space before the next section" to centre
                      within (the box is exactly one phone viewport, pinned).
                    */
                    <div
                      className="mt-10 flex w-full justify-center tablet:absolute tablet:inset-x-0 tablet:mt-0 tablet:-translate-y-1/2"
                      style={buttonTop !== null ? { top: `${buttonTop}px` } : undefined}
                    >
                      <Button onClick={() => setRevealed((count) => count + hidden)} tone="light">
                        Show more services
                        <span className="sr-only"> — {hidden} more</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none relative row-start-1 hidden h-svh self-start desktop:sticky desktop:top-0 desktop:col-span-2 desktop:col-start-11 desktop:block"
          >
            {visible.map((service, i) => (
              <div
                key={service.slug}
                data-service-illustration
                data-state={i === 0 ? "active" : i > 0 ? "upcoming" : "passed"}
                style={{ filter: "url(#gst-emerald)" }}
                className={[
                  "absolute top-1/2 right-0 size-[600px] opacity-0",
                  "transition-[transform,opacity] duration-[var(--duration-spring)] ease-[var(--ease-spring)]",
                  "[transform:translate(50%,-50%)_translateY(64px)_scale(0.8)]",
                  "data-[state=active]:opacity-100 data-[state=active]:[transform:translate(50%,-50%)_scale(1)]",
                  "data-[state=passed]:[transform:translate(50%,-50%)_translateY(-64px)_scale(0.8)]",
                ].join(" ")}
              >
                <Picture
                  source={service.illustration}
                  alt=""
                  width={1024}
                  height={1024}
                  sizes="600px"
                  loading={i === 0 ? "eager" : "lazy"}
                  className="size-full"
                />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </ServiceScroller>
  );
}
