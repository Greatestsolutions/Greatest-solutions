import { cn } from "@/lib/cn";
import { Picture } from "@/components/ui/Picture";
import type { Testimonial } from "@/data/testimonials";

/**
 * One testimonial card. A Server Component; nothing here is interactive.
 *
 * Measured at 1440 on the unrotated centre card, which is the only one whose
 * `getBoundingClientRect` is its real size — the outer two are rotated, and a
 * rotated element reports its axis-aligned bounding box (484x628 for a 360x557
 * card at −14°, which is how the fan's geometry was decoded):
 *
 * ```
 *   card          360x557                     (354x551 on the compact carousel)
 *     frame       padding 4 · radius 24 · white · --shadow-float-soft
 *       panel     352x549 · padding 40 · radius 20 · #000 · overflow hidden
 *         glow    inset −32 · blur(10px) · opacity 0.4 · the avatar again
 *         avatar  232x232 · fully round · object-cover
 *         content padding-top 24 · gap 20
 *           h3    Fraunces 24 / 28 / −0.04em · white          (the quote)
 *           rule  1px · rgba(255,255,255,0.1)
 *           name  Inter 16 / 500 / 24 · white
 *           role  Inter 14 / 400 / 20 · rgba(255,255,255,0.64)
 * ```
 *
 * The glow is the card's signature: the same avatar, blown up to 416x613, blurred
 * 10px at 40% opacity and clipped by the panel, so the portrait bleeds colour
 * into the black. It is `aria-hidden` — it is the same image twice.
 *
 * The compact variant only changes three numbers (panel padding 36, avatar 234,
 * card 354x551), so it is a prop rather than a second component.
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
        {/* The blurred bleed. -inset-8 is the measured −32px on every side. */}
        <div aria-hidden="true" className="absolute -inset-8 z-0 opacity-40 blur-[10px]">
          <Picture
            source={testimonial.avatar}
            alt=""
            width={testimonial.width}
            height={testimonial.height}
            className="size-full object-cover"
          />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className={cn("overflow-hidden rounded-full", compact ? "size-[234px]" : "size-[232px]")}>
            <Picture
              source={testimonial.avatar}
              alt=""
              width={testimonial.width}
              height={testimonial.height}
              sizes="234px"
              className="size-full object-cover"
            />
          </div>

          <div className="flex flex-col items-center gap-5 pt-6 text-center">
            {/*
              `h3` under the section's `h2`. The reference uses `h6`, which skips
              three levels; the type is reproduced, the heading order is not.
              Quotation marks are part of the copy, as in the reference.
            */}
            <h3 className="text-heading-sm opsz-24 text-white">{testimonial.quote}</h3>

            <div aria-hidden="true" className="h-px w-full bg-white/10" />

            <div className="flex flex-col items-center gap-1">
              <p className="text-body-lg font-medium text-white">{testimonial.name}</p>
              <p className="text-body-md text-white/64">{testimonial.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
