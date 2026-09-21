"use client";

import { useState } from "react";
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
                  data-service-item
                  data-state={i === 0 ? "active" : "inactive"}
                  className={[
                    "flex min-h-svh tablet:items-center tablet:py-[90px]",
                    "max-tablet:items-start max-tablet:pt-[230px]",
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
                    screenshot at 390 caught it. Attaching the button to the
                    last visible card's own content sidesteps that: it is
                    shown or hidden by exactly the same rule as the card it
                    belongs to, no extra slot and no extra index required.

                    Centred between the card and whatever comes after this
                    section (not just nudged down with a margin) — explicitly
                    requested, and a fixed margin can't do it correctly since
                    card height varies per service. `self-stretch` makes this
                    wrapper fill the item box's full cross-axis extent (its
                    `min-h-svh`, minus the outer box's own padding) — `h-full`
                    was tried first and doesn't reliably do the same thing: a
                    flex item's percentage height needs the container's own
                    used height resolved first, which a `min-height`-only
                    parent doesn't reliably give it, whereas `self-stretch`
                    sizes the item to the container's cross-axis directly,
                    with no percentage involved. Two `flex-1` regions then
                    split that real height evenly: the card centres in the
                    top half, the button in the bottom half, correct for any
                    card height without measuring anything in JS. Phone falls
                    back to the original simple stack — the split has no
                    phone equivalent, since that layout pins one card at a
                    fixed offset rather than centring within a tall box.
                  */}
                  {isLastWithMore ? (
                    <div className="flex w-full flex-col items-center self-stretch max-tablet:gap-6 max-tablet:self-auto">
                      <div className="flex w-full flex-1 items-center justify-center max-tablet:flex-none">
                        <ServiceCard service={service} />
                      </div>
                      <div className="flex w-full flex-1 items-center justify-center max-tablet:flex-none">
                        <Button
                          onClick={() => setRevealed((count) => count + hidden)}
                          tone="light"
                        >
                          Show more services
                          <span className="sr-only"> — {hidden} more</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <ServiceCard service={service} />
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
