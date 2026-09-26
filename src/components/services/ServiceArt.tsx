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
 *
 * ## `filtered`, `fit` and `objectPosition`
 *
 * All three default to the original abstract-illustration behaviour (emerald
 * ramp, `object-contain`, no explicit position), which the `/services` intro
 * accent still uses verbatim. The service detail masthead and CTA pass a real
 * client photo through `source` instead, and a real photo must render
 * unfiltered per the site's own rule that the emerald duotone is for
 * placeholder illustrations only — so those two call sites pass
 * `filtered={false}`.
 *
 * They also pass `fit="cover"`: `contain` was tried first and showed the
 * whole photo letterboxed, but left visible blank margins around it, which
 * reads as a bug rather than a deliberate frame. `cover` fills the box with
 * no blank space, cropping instead — the box itself moved from square to 4:3
 * at those two call sites (still not a full 16:9 match, since this box's
 * shape is also what the −3° rotation and dual glow were tuned against) to
 * cut the amount `cover` needs to crop, and `objectPosition` (usually
 * `service.focalPoint`) keeps that remaining crop off the photo's subject
 * rather than trimming blindly from both edges.
 *
 * `rounded` also defaults to off, matching the intro accent: that art is an
 * abstract sculpture on a transparent background, so it has no rectangular
 * edge for a radius to apply to in the first place. The two real-photo call
 * sites pass `rounded`, which rounds the sharp copy to `--radius-card` — the
 * site's own token for "a real photo nested inside a larger card/panel"
 * (Works cards, testimonial photos, blog thumbnails all use it the same way,
 * nested inside those components' own larger `--radius-lg`/`--radius-xl`
 * panels, exactly as this photo sits inside the masthead/CTA panel). A
 * border-radius on an `<img>` clips its own content directly — no separate
 * `overflow-hidden` wrapper needed.
 *
 * `rounded` also fixes the glow's inset for exactly these two call sites: the
 * glow margin was originally one `-inset-[16%]`, which is fine on the intro
 * accent's square box (16% of the width equals 16% of the height there), but
 * on the real photo's 4:3 box the same 16% is 16% of a SHORTER height,
 * pulling the vertical margin in tighter than the horizontal one and making
 * the halo read as more diffuse top and bottom than side to side — a values
 * tuned for a square, not this rectangle. `-inset-y-[21.33%]` (16% ÷ 0.75,
 * the 4:3 ratio) restores the same margin the square version had, expressed
 * relative to height instead of width, so both axes bleed by a visually
 * equal amount again. The rotation (−3°) and hover scale (1.1) needed no
 * equivalent fix — checked against the new shape, neither overhangs or
 * clips oddly, so both are unchanged.
 */
export function ServiceArt({
  source,
  className,
  sizes,
  filtered = true,
  fit = "contain",
  objectPosition,
  rounded = false,
  alt = "",
}: {
  source: ImageSource;
  /** The size box. The art fills it; the caller decides how big it is. */
  className?: string;
  sizes?: string;
  /** False for a real photo — see the doc comment above. */
  filtered?: boolean;
  fit?: "contain" | "cover";
  /** CSS `object-position`, meaningful only with `fit="cover"`. */
  objectPosition?: string;
  /** True for a real photo, which has a rectangular edge to round — see the
   *  doc comment above. */
  rounded?: boolean;
  /** Empty for decorative abstract art (the default). A real photo's caller
   *  passes a real description — only on the sharp copy; the blurred glow
   *  duplicate underneath stays `alt=""` so a screen reader doesn't announce
   *  the same description twice for what is visually one graphic. */
  alt?: string;
}) {
  const fitClass = fit === "cover" ? "object-cover" : "object-contain";
  const roundedClass = rounded ? "rounded-[var(--radius-card)]" : undefined;
  return (
    <div className={cn("group relative", className)}>
      <div className="size-full motion-safe:animate-[gst-drift_9s_ease-in-out_infinite] motion-reduce:animate-none">
        {/*
          The glow. `-inset-[16%]` keeps the blur's falloff short of the adjacent
          text column even at its hover-intensified widest.
        */}
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute blur-[64px]",
            rounded ? "-inset-x-[16%] -inset-y-[21.33%]" : "-inset-[16%]",
            "opacity-[0.32] transition-opacity duration-[var(--duration-medium)] ease-[var(--ease-brand)]",
            "motion-safe:animate-[gst-glow-pulse_12s_ease-in-out_infinite] motion-reduce:animate-none",
            "group-hover:opacity-[0.58]",
            filtered && "[filter:url(#gst-emerald)]",
          )}
        >
          <Picture
            source={source}
            alt=""
            width={1024}
            height={1024}
            objectPosition={objectPosition}
            className={cn("size-full", fitClass, roundedClass)}
          />
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
          className={cn(
            "absolute inset-0 rotate-[-3deg] transition-[scale,rotate,filter] duration-[var(--duration-medium)] ease-[var(--ease-brand)]",
            filtered
              ? "[filter:url(#gst-emerald)_saturate(1.05)_drop-shadow(0_28px_44px_rgba(12,75,36,0.32))]"
              : "[filter:drop-shadow(0_28px_44px_rgba(12,75,36,0.32))]",
            "group-hover:scale-110 group-hover:rotate-0",
            filtered
              ? "group-hover:[filter:url(#gst-emerald)_saturate(1.4)_brightness(1.15)_drop-shadow(0_36px_64px_rgba(12,75,36,0.48))]"
              : "group-hover:[filter:brightness(1.05)_drop-shadow(0_36px_64px_rgba(12,75,36,0.48))]",
            "motion-reduce:transition-none",
          )}
        >
          <Picture
            source={source}
            /* Decorative abstract art by default (see the doc comment above);
               a real service photo gets its caller-supplied description
               instead of a claim-free empty alt. */
            alt={alt}
            width={1024}
            height={1024}
            sizes={sizes}
            objectPosition={objectPosition}
            className={cn("size-full", fitClass, roundedClass)}
          />
        </div>
      </div>
    </div>
  );
}
