import { cn } from "@/lib/cn";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { TestimonialCard } from "@/components/testimonials/TestimonialCard";
import { TestimonialsFan } from "@/components/testimonials/TestimonialsFan";
import { CountUp } from "@/components/testimonials/CountUp";
import {
  stats,
  testimonials,
  testimonialsEyebrow,
  testimonialsSupportingLine,
  testimonialsTitle,
} from "@/data/testimonials";

/**
 * Client voices — two real testimonials and a stats strip.
 *
 * ## Two cards, not three
 *
 * The reference (and every earlier pass of this rebuild) held three slots —
 * first three fabricated endorsements, then three literal placeholders once
 * those were removed. Real testimonials replace the placeholders now, and
 * there are exactly two of them: padding to three with an invented third
 * quote would have been the same fabrication this whole rewrite exists to
 * remove, just one card later. See `data/testimonials.ts` for the source of
 * both and the reasoning behind each excerpt and attribution.
 *
 * **It is not a carousel on desktop, and the carousel it does have is broken —
 * that part of the original build's diagnosis carries over unchanged.**
 *
 * ```
 *   ≥1200   two 360x557 cards, side by side, tilted a matching −6°/+6° away
 *           from centre and straightening on hover — both animate in as the
 *           block arrives, reusing TestimonialsFan's entrance unchanged.
 *   <1200   ONE 354x551 card centred, the next peeking past the section edge
 * ```
 *
 * The tilt is deliberately gentler than the reference's three-card fan
 * (−14°/+10°, asymmetric because a static centre card anchored the
 * composition). Two cards have no centre card to anchor against, and at the
 * original angles a symmetric pair without one read as leaning rather than
 * fanned — the reduced, matched angle keeps the "a considered pair" reading
 * the brief asked for without a third card propping the composition up.
 *
 * Below 1200 the reference builds a track behind a narrow window and ships no
 * way to move it: no arrows, no dots, no autoplay, no keyboard. This build
 * makes the same composition work with a native scroll-snap track instead:
 * swipe, trackpad, drag on the scrollbar, and arrow keys once focused all
 * advance it, and it costs **zero JavaScript**. Unchanged by the count drop
 * to two — the track already maps over `testimonials` generically rather than
 * assuming three.
 *
 * The stats strip below the cards is unrelated content, out of scope for this
 * pass, and untouched; see the note in `data/testimonials.ts`.
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
          description={testimonialsSupportingLine}
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
          {/*
            No fixed 1100px row: that width existed to host three overlapping,
            rotated cards in exactly the reference's measured space. Two cards
            with real gap between them (rather than overlap — see the fan[]
            note below) have no equivalent reference to match, so this sizes
            to its content instead of a number tuned for a different count.
          */}
          <ul className="flex items-center gap-8">
            {testimonials.map((testimonial, i) => (
              <li key={testimonial.attribution} className={fan[i]}>
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
              <li key={testimonial.attribution} className="snap-center">
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
 * The desktop pair, per slot.
 *
 * Two cards, tilted a matching −6°/+6° away from a shared centre point between
 * them, rather than the reference's three-card fan (−14°/+10°, asymmetric,
 * splayed around a static, unrotated middle card). With no middle card to
 * anchor against, the original angles read as the pair leaning rather than
 * fanning; halving them roughly and making them symmetric keeps the "outward"
 * reading without a static third card holding the composition together.
 *
 * Rotation is still about each card's INNER edge (94% / 7%, both at 45% of the
 * height) — the same transform-origins the reference's outer cards used, kept
 * because it is still exactly the right pivot: the point nearest the OTHER
 * card, so the pair still splays apart from between them rather than each
 * card spinning about its own middle.
 *
 * The entrance keeps the same shape as before — start closer to flat and
 * closer together, spread out to the resting tilt as the block arrives —
 * scaled to the smaller resting angle rather than reusing the original's
 * absolute offsets, which were tuned for a −14°/+10° rest position.
 */
const fan = [
  "origin-[94%_45%] rotate-[-6deg] transition-transform duration-[var(--duration-entrance)] ease-[var(--ease-entrance)] " +
    "group-data-[state=out]/fan:rotate-[-3deg] group-data-[state=out]/fan:translate-x-6 group-data-[state=out]/fan:translate-y-6 " +
    "motion-reduce:transition-none",
  "origin-[7%_45%] rotate-[6deg] transition-transform duration-[var(--duration-entrance)] ease-[var(--ease-entrance)] " +
    "group-data-[state=out]/fan:rotate-[3deg] group-data-[state=out]/fan:-translate-x-6 group-data-[state=out]/fan:translate-y-6 " +
    "motion-reduce:transition-none",
];
