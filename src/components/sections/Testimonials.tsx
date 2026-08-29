import { cn } from "@/lib/cn";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { TestimonialsFan } from "@/components/testimonials/TestimonialsFan";
import { CountUp } from "@/components/testimonials/CountUp";
import { stats, testimonials, testimonialsEyebrow, testimonialsTitle } from "@/data/testimonials";

/**
 * Client voices — three testimonials and a stats strip.
 *
 * **It is not a carousel on desktop, and the carousel it does have is broken.**
 * Both statements are measured; see TESTIMONIALS-SECTION.md §3–§4.
 *
 * ```
 *   ≥1200   three 360x557 cards in a 1100 row, gap 10, fanned −14° / 0° / +10°
 *           and overlapping. The outer two animate in as the block arrives.
 *   <1200   ONE 354x551 card centred, the next peeking past the section edge
 * ```
 *
 * Below 1200 the reference builds a 1062px track behind a 354px window and then
 * ships no way to move it: no arrows, no dots, no autoplay (sampled 14s), no
 * keyboard. A real 600px drag moves the track 132px and it springs straight back
 * — measured with both mouse and touch. Testimonials 2 and 3 are unreachable.
 *
 * That is content the visitor cannot get to, so this build makes the same
 * composition work with a native scroll-snap track: swipe, trackpad, drag on the
 * scrollbar, and arrow keys once focused all advance it, and it costs **zero
 * JavaScript**. The resting layout is unchanged — same card, same size, same
 * position, same peek — so visual parity holds while the section stops hiding
 * two thirds of its content. Recorded as an intentional difference.
 *
 * The stats strip reads "0+ / 0% / 0+" in the reference and never counts up.
 * Reproduced exactly and flagged in `data/testimonials.ts`; those need real
 * numbers before launch.
 */
export function Testimonials() {
  return (
    <Section
      id="testimonials"
      aria-labelledby="testimonials-title"
      // Phone padding is a symmetric 36 here, against the scale's 64 — measured.
      className="overflow-clip max-tablet:py-9"
    >
      <div className="flex flex-col items-center gap-[72px]">
        <SectionHeader
          id="testimonials-title"
          eyebrow={testimonialsEyebrow}
          align="center"
          // The centred header is 580 wide, not the usual 520.
          width="wide"
          className="tablet:w-[580px]"
          title={
            <>
              {testimonialsTitle[0]}
              {/* The reference drops this break at phone and lets it wrap. */}
              <br className="max-tablet:hidden" /> {testimonialsTitle[1]}
            </>
          }
        />

        {/* ── ≥1200: the fan ────────────────────────────────────────────────── */}
        <div className="relative hidden desktop:block">
          <TestimonialsFan>
          {/*
            Hairlines behind the fan. `repeating-linear-gradient` with hard stops
            draws discrete 1px rules, not a gradient wash — it is the standard way
            to get an evenly spaced rule set without shipping an asset or 40 divs.
            Full-bleed via 100vw so the rules run past the container as the
            reference's do, and `-z-10` keeps them strictly behind the cards.

            Fades in with the fan's own entrance state, so it is one trigger for
            the whole composition rather than a second observer.
          */}
          <span
            aria-hidden="true"
            className={
              "pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[300px] w-screen " +
              "-translate-x-1/2 -translate-y-1/2 " +
              "[background-image:repeating-linear-gradient(to_bottom,rgb(214_92_84/0.22)_0px,rgb(214_92_84/0.22)_1px,transparent_1px,transparent_18px)] " +
              "[mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)] [mask-mode:alpha] " +
              "transition-opacity duration-[var(--duration-entrance)] ease-[var(--ease-entrance)] " +
              "group-data-[state=out]/fan:opacity-0"
            }
          />
          <ul className="flex w-[1100px] items-center gap-2.5">
            {testimonials.map((testimonial, i) => (
              <li key={testimonial.name} className={fan[i]}>
                <TestimonialCard testimonial={testimonial} />
              </li>
            ))}
          </ul>
          </TestimonialsFan>
        </div>

        {/* ── <1200: the same cards, on a track that actually moves ─────────── */}
        <div
          // Full-bleed so the neighbouring card peeks past the container exactly
          // as the reference's does; the section's own `overflow-clip` trims it
          // at the page edge.
          className="-mx-6 w-screen max-w-[100vw] desktop:hidden max-tablet:-mx-4"
        >
          <ul
            data-testimonial-track
            tabIndex={0}
            role="group"
            aria-label="Client testimonials"
            className={
              "flex snap-x snap-mandatory overflow-x-auto " +
              // Centres the first card in the viewport and leaves the rest of the
              // track reachable. calc keeps it centred at every width.
              "px-[calc((100vw-354px)/2)] " +
              // The peeking card is the affordance here, and a horizontal bar
              // under a card is not something the reference has. Scoped to this
              // one element rather than the page.
              "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            }
          >
            {testimonials.map((testimonial) => (
              <li key={testimonial.name} className="snap-center">
                <TestimonialCard testimonial={testimonial} compact />
              </li>
            ))}
          </ul>
        </div>

        {/* ── the stats strip ───────────────────────────────────────────────── */}
        <ul className="flex w-full flex-wrap items-center justify-center gap-3 tablet:pt-6 max-tablet:w-auto max-tablet:-mx-3 max-tablet:gap-y-6 desktop:px-20">
          {stats.map((stat, i) => (
            <li key={stat.label} className="contents">
              {i > 0 && (
                <span aria-hidden="true" className="h-[50px] w-px bg-black/8 max-tablet:hidden" />
              )}
              <span data-stat className={cn(
                  "flex w-[calc(50%-6px)] flex-col items-center gap-1.5 max-desktop:tablet:flex-1 tablet:w-[217px] tablet:gap-1 desktop:w-[217px]",
                  // The reference stretches the wrapped third cell to the full
                  // row on phone rather than centring it at 177.
                  i === stats.length - 1 && "max-tablet:w-full",
                )}>
                <span className="flex items-end gap-1">
                  <span className="font-display tracking-[var(--tracking-display)] text-heading-lg opsz-48 text-ink tablet:text-display-sm">
                    <CountUp to={stat.value} />
                  </span>
                  <span className="pb-[3px] font-display tracking-[var(--tracking-display)] text-heading-md opsz-32 text-ink">{stat.suffix}</span>
                </span>
                <span className="text-body-lg text-body">{stat.label}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

/**
 * The desktop fan, per slot.
 *
 * Rotation is about a point near each outer card's INNER edge — measured
 * transform-origins of 338.4px and 25.2px on a 360px card, i.e. 94% and 7%, both
 * at 45% of the height. That is what makes them splay outward from the centre
 * card rather than pinwheel about their own middles.
 *
 * The `group-data-[state=out]` values are the measured start of the entrance:
 * −9° at (32, 32) and +5° at (−32, 32). Written as literal class strings because
 * Tailwind reads them at build time.
 */
const fan = [
  "origin-[94%_45%] rotate-[-14deg] transition-transform duration-[var(--duration-entrance)] ease-[var(--ease-entrance)] " +
    "group-data-[state=out]/fan:rotate-[-9deg] group-data-[state=out]/fan:translate-x-8 group-data-[state=out]/fan:translate-y-8 " +
    "motion-reduce:transition-none",
  "",
  "origin-[7%_45%] rotate-[10deg] transition-transform duration-[var(--duration-entrance)] ease-[var(--ease-entrance)] " +
    "group-data-[state=out]/fan:rotate-[5deg] group-data-[state=out]/fan:-translate-x-8 group-data-[state=out]/fan:translate-y-8 " +
    "motion-reduce:transition-none",
];
