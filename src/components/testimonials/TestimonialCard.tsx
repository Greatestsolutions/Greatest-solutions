import { cn } from "@/lib/cn";
import { Picture } from "@/components/ui/Picture";
import type { Testimonial } from "@/data/testimonials";

/**
 * One testimonial card. A Server Component; nothing here is interactive.
 *
 * ## No photo
 *
 * The card used to lead with a circular portrait plus the same image blown up
 * and blurred behind it as a colour bleed. Neither client supplied a
 * photograph, and reusing the template's stock portraits for real client
 * quotes would be exactly the fabrication this rewrite exists to remove — a
 * real quote sitting under a photo of someone who never said it.
 *
 * ## Layout — back to a clean stack, illustration in its own slot
 *
 * ```
 *   card          360x557                     (354x551 compact)
 *     frame       padding 4 · radius 24 · white · --shadow-float-soft
 *       panel     352x549 · padding 40 · radius 20 · #000 · overflow hidden
 *         stars       5 marks, filled per `rating`
 *         illustration  size-40 (160px), its own space, no overlap
 *         content     padding-top 24 · gap 20
 *           h3        Fraunces 24 / 28 / −0.04em · white       (the quote)
 *           rule      1px · rgba(255,255,255,0.1)
 *           attribution  Inter 16 / 500 / 24 · white
 * ```
 *
 * This went through three shapes before landing here, worth recording because
 * the middle one looked fine in isolation and was still wrong:
 *
 *   1. rating only, no illustration at all — legible but bare.
 *   2. a large, heavily blurred illustration BEHIND everything, standing in for
 *      the old avatar's "visual anchor" role. This read fine as a single card,
 *      but a background wash sitting under the quote text was never actually
 *      what a "photo slot" means — the photo occupied its OWN region of the
 *      card, above the quote, not a tint behind it.
 *   3. this — the illustration back in its own normal-flow slot between the
 *      stars and the quote, sized to have real presence (160px, not shrunk to
 *      an icon) but never touching the quote's own box. Nothing renders behind
 *      the quote any more, which is also why the `isolate`/`-z-10` stacking
 *      machinery the background version needed is gone: there is nothing left
 *      for it to stack against.
 *
 * `object-contain` inside a plain square rather than a circular mask — these
 * illustrations are off-centre sculpts on their own square canvas (confirmed
 * by rendering one full-size while building the background version), and a
 * circular crop would cut an asymmetric shape at an arbitrary, ugly edge. The
 * site's own other uses of this art (hero, service cards) never mask it to a
 * circle either; a square box is the established convention, not a shortcut.
 *
 * Full opacity, no blur: in its own bounded slot with clean air on every side,
 * this doesn't need to hide the way the background version did — it can just
 * be shown, the same clarity `EmeraldFilter`'s other consumers already use.
 *
 * The compact variant only changes panel padding (36 vs 40), card size and the
 * illustration box (144px vs 160px), so it stays a prop rather than a second
 * component — unchanged from before.
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
          "flex h-full flex-col items-center overflow-hidden rounded-[var(--radius-card)] bg-black",
          compact ? "p-9" : "p-10",
        )}
      >
        <StarRating rating={testimonial.rating} />

        {/*
          The illustration's own slot — a fixed box in normal flow, not
          positioned or layered against anything. `mt-6`/`mb-2` give it real
          air above and below so it reads as a distinct region rather than
          crowding the stars or the quote that follows it.
        */}
        <div
          aria-hidden="true"
          className={cn("mt-6 mb-2 shrink-0", compact ? "size-36" : "size-40")}
          style={{ filter: "url(#gst-emerald)" }}
        >
          <Picture
            source={testimonial.illustration}
            alt=""
            width={1360}
            height={1360}
            sizes="160px"
            className="size-full object-contain"
          />
        </div>

        <div className="flex flex-col items-center gap-5 text-center">
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
