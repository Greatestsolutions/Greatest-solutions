import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface MarqueeProps {
  children: ReactNode;
  /**
   * One full traversal, in seconds. Larger = slower.
   *
   * Omit it to leave `--marquee-duration` to CSS — which is the only way to vary
   * the speed by breakpoint, since an inline style cannot carry a media query.
   * `LogoStrip` needs that: its cells narrow from 315px to 262px on phone, so a
   * single duration would mean two different speeds. The variable falls back to
   * 40s in `globals.css`, so omitting both still animates.
   */
  duration?: number;
  /** Scroll right instead of left. */
  reverse?: boolean;
  /** Accessible name for the region; omit for purely decorative strips. */
  label?: string;
  className?: string;
  /**
   * Applied to the wrapper. Custom properties set here reach the animated track
   * by inheritance, which is how a caller feeds `--marquee-duration` values that
   * a media query then chooses between.
   */
  style?: CSSProperties;
  /** Applied to the track, e.g. to set the gap between items. */
  trackClassName?: string;
}

/**
 * Infinite horizontal marquee.
 *
 * A Server Component — the animation is pure CSS, so no JavaScript ships for
 * this at all. The track is rendered twice and translated -50%, which lands
 * exactly on the duplicate and loops seamlessly.
 *
 * ## The one rule callers must respect
 *
 * **`children` must be at least as wide as the widest viewport you support.**
 *
 * The loop translates by exactly one copy's width. At the end of the cycle the
 * first copy has left the screen entirely, so everything visible is the second
 * copy — and if one copy is narrower than the container, the remainder is blank.
 * Three 315px logos (945px) looked fine at phase 0 and emptied out ~500px of a
 * 1440px row by phase 1. Repeat the content until a single copy overflows;
 * `LogoStrip` does this arithmetically rather than by eye.
 *
 * Accessibility:
 * - The duplicate copy is `aria-hidden`, so assistive tech reads the content
 *   once rather than twice.
 * - Motion is paused entirely under `prefers-reduced-motion` (WCAG 2.2 AA,
 *   2.2.2 Pause, Stop, Hide — this is auto-moving content that lasts more than
 *   five seconds).
 * - `overflow-hidden` clips rather than scrolls, so it never becomes a
 *   keyboard-focusable scroll container with no visible focus target.
 */
export function Marquee({
  children,
  duration,
  reverse = false,
  label,
  className,
  style,
  trackClassName,
}: MarqueeProps) {
  const track = (
    <div className={cn("flex shrink-0 items-center", trackClassName)}>{children}</div>
  );

  return (
    <div
      className={cn("group relative w-full overflow-hidden", className)}
      style={style}
      role={label ? "group" : undefined}
      aria-label={label}
    >
      <div
        className={cn(
          "flex w-max animate-marquee motion-reduce:animate-none",
          reverse && "[animation-direction:reverse]",
        )}
        /*
          `animation-duration` is set as a REAL property here, not left to the
          `--marquee-duration` inside `--animate-marquee`.

          That indirection silently did not work. A custom property's value has
          its own `var()`s substituted at computed-value time **on the element
          that declares it** — and `--animate-marquee` is declared in `@theme`,
          i.e. on `:root`, where `--marquee-duration` is not set. So the 40s
          fallback baked in at the root and every marquee on the page ran at 40s
          no matter what a caller passed. Measured: the Clients rows should drift
          at 35 px/s and ran at 47.3, which is exactly 1890px / 40s.

          Declaring the real property on the animated element resolves the var
          against THIS element, which inherits whatever the caller set — an
          inline number below, or a responsive class on the wrapper.
        */
        style={
          {
            animationDuration: "var(--marquee-duration, 40s)",
            ...(duration === undefined ? {} : { "--marquee-duration": `${duration}s` }),
          } as CSSProperties
        }
      >
        {track}
        {/* Duplicate purely to make the loop seamless — hidden from AT. */}
        <div aria-hidden="true" className="contents">
          {track}
        </div>
      </div>
    </div>
  );
}
