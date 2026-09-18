import { cn } from "@/lib/cn";
import type { Testimonial } from "@/data/testimonials";

/**
 * One testimonial card. A Server Component; nothing here is interactive.
 *
 * ## No photo
 *
 * The card used to lead with a circular portrait plus the same image blown up
 * and blurred behind it as a colour bleed — measured at 232x232 for the
 * avatar, blurred at 416x613 behind it. Neither client supplied a photograph,
 * and reusing the template's stock portraits for real client quotes would be
 * exactly the fabrication this rewrite exists to remove — a real quote sitting
 * under a photo of someone who never said it.
 *
 * The rating replaces the photo as the card's visual anchor instead: real
 * data every review actually carries, drawn large enough to hold the same
 * visual weight the portrait used to. Removing the avatar also freed the
 * height budget the blurred bleed and the 232px circle used to spend, which
 * is what makes room for these quotes — real testimonials, not the one-line
 * placeholder the fixed-height card was tuned around.
 *
 * ## Layout
 *
 * ```
 *   card          360x557                     (354x551 compact)
 *     frame       padding 4 · radius 24 · white · --shadow-float-soft
 *       panel     352x549 · padding 40 · radius 20 · #000 · overflow hidden
 *         stars   5 marks, filled per `rating`
 *         content padding-top 24 · gap 20
 *           h3    Fraunces 24 / 28 / −0.04em · white          (the quote)
 *           rule  1px · rgba(255,255,255,0.1)
 *           attribution  Inter 16 / 500 / 24 · white
 * ```
 *
 * The compact variant only changes panel padding (36 vs 40) and card size, so
 * it stays a prop rather than a second component — unchanged from before.
 */
export function TestimonialCard({
  testimonial,
  compact,
  className,
}: {
  testimonial: Testimonial;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-surface p-1 shadow-float-soft",
        compact ? "h-[551px] w-[354px]" : "h-[557px] w-[360px]",
        className,
      )}
    >
      <div
        className={cn(
          "relative flex h-full flex-col items-center overflow-hidden rounded-[var(--radius-card)] bg-black",
          compact ? "p-9" : "p-10",
        )}
      >
        <StarRating rating={testimonial.rating} />

        <div className="flex flex-col items-center gap-5 pt-6 text-center">
          {/*
            `h3` under the section's `h2`. The reference uses `h6`, which skips
            three levels; the type is reproduced, the heading order is not.
            Quotation marks are part of the copy, as in the reference.
          */}
          <h3 className="text-heading-sm opsz-24 text-white">{testimonial.quote}</h3>

          <div aria-hidden="true" className="h-px w-full bg-white/10" />

          <p className="text-body-lg font-medium text-white">{testimonial.attribution}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Five marks, filled up to `rating` (rounded to the nearest half-star). The
 * numeral rides beside them rather than under them — "5.0" alone, with no
 * stars, reads as a version number; the stars alone, with no numeral, ask the
 * reader to count them. Together they read as a rating the way this exact
 * pairing already reads everywhere ratings are shown.
 *
 * Emerald, not a conventional gold/yellow star: gold has no other role on this
 * site, and emerald is already the one accent colour that means "this is the
 * good outcome" everywhere else it appears (the roadmap's progress line, the
 * deliverables checklist ticks, the outcome charts' "after" bars). A rating
 * is exactly that kind of positive marker, so it draws on the same colour
 * rather than introducing a second one that would only ever appear here.
 */
function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating + 0.25);
  return (
    <div className="flex items-center gap-2" role="img" aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <div aria-hidden="true" className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <StarMark key={i} filled={i < full} />
        ))}
      </div>
      <span aria-hidden="true" className="font-display text-heading-sm text-white opsz-24">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function StarMark({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true" focusable="false">
      <path
        d="M10 1.5l2.472 5.009 5.528.803-4 3.899.944 5.505L10 14.25l-4.944 2.466.944-5.505-4-3.899 5.528-.803Z"
        fill={filled ? "var(--color-brand-emerald)" : "none"}
        stroke="var(--color-brand-emerald)"
        strokeWidth={filled ? 0 : 1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}
