import { Picture } from "@/components/ui/Picture";
import { cn } from "@/lib/cn";
import type { ImageSource } from "@/types/media";

/**
 * The floating emerald sculpture: a glowing, drifting, hover-reactive rendition
 * of one of the site's abstract illustration assets.
 *
 * Extracted verbatim from the `/services` intro, which is where this treatment
 * was designed and tuned. It is now used there and on every service detail
 * masthead, so the two cannot drift apart — the alternative was a second copy of
 * a layered effect whose whole point is that its layers are balanced against
 * each other.
 *
 * ## The layering
 *
 * The same asset twice: a blurred, bled-out copy behind a sharp one. That is
 * `TestimonialCard`'s own device rather than a generic drop shadow or a gradient
 * blob — the glow is made of the artwork, so it always matches its silhouette.
 *
 * ## Why the animations sit on three different elements
 *
 * Idle motion is on the outer wrapper (`translate`/`rotate` via `gst-drift`),
 * the glow idles on `scale` and hovers on `opacity`, and the sharp copy has no
 * idle animation at all and hovers on `scale`/`rotate`/`filter`. A running
 * `@keyframes` and a hover transition fighting over the SAME property on the
 * SAME element is what makes an idle animation silently cancel a hover: measured
 * while this was built, with the glow pulsing on `opacity`, hovering moved it
 * 0.34 → 0.37 against an intended 0.32 → 0.58, because the animation overrode
 * the hover class every frame. Splitting the properties is the fix.
 *
 * ## Dependency worth knowing
 *
 * `filter: url(#gst-emerald)` resolves by id from anywhere in the document, so
 * this does NOT render `<EmeraldFilter />` itself — a second copy would collide
 * on that id. The page using it must render exactly one.
 */
export function ServiceArt({
  source,
  className,
  sizes,
}: {
  source: ImageSource;
  /** The size box. The art fills it; the caller decides how big it is. */
  className?: string;
  sizes?: string;
}) {
  return (
    <div className={cn("group relative", className)}>
      <div className="size-full motion-safe:animate-[gst-drift_9s_ease-in-out_infinite] motion-reduce:animate-none">
        {/*
          The glow. `-inset-[16%]` keeps the blur's falloff short of the adjacent
          text column even at its hover-intensified widest.
        */}
        <div
          aria-hidden="true"
          className={
            "pointer-events-none absolute -inset-[16%] blur-[64px] " +
            "opacity-[0.32] transition-opacity duration-[var(--duration-medium)] ease-[var(--ease-brand)] " +
            "motion-safe:animate-[gst-glow-pulse_12s_ease-in-out_infinite] motion-reduce:animate-none " +
            "group-hover:opacity-[0.58] " +
            "[filter:url(#gst-emerald)]"
          }
        >
          <Picture source={source} alt="" width={1024} height={1024} className="size-full object-contain" />
        </div>

        {/*
          The sharp copy. A static −3° tilt that straightens on hover, with a
          grounding drop-shadow chained after the SVG filter — depth cues rather
          than a flat drop-in. The hover is deliberately unmistakable: scale to
          1.1, the tilt resolving level, and the filter pushed far enough
          (saturate 1.4, brightness 1.15, deeper shadow) that the material reads
          as genuinely brightening.
        */}
        <div
          className={
            "absolute inset-0 rotate-[-3deg] transition-[scale,rotate,filter] duration-[var(--duration-medium)] ease-[var(--ease-brand)] " +
            "[filter:url(#gst-emerald)_saturate(1.05)_drop-shadow(0_28px_44px_rgba(12,75,36,0.32))] " +
            "group-hover:scale-110 group-hover:rotate-0 " +
            "group-hover:[filter:url(#gst-emerald)_saturate(1.4)_brightness(1.15)_drop-shadow(0_36px_64px_rgba(12,75,36,0.48))] " +
            "motion-reduce:transition-none"
          }
        >
          <Picture
            source={source}
            /* Purely decorative brand art, the same category as the hero
               sculpture — not a claim about a specific service or project, so
               nothing here needs a caption or a name. */
            alt=""
            width={1024}
            height={1024}
            sizes={sizes}
            className="size-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
