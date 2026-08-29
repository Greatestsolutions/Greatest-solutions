import { cn } from "@/lib/cn";
import { dial } from "@/data/services";

/**
 * The numbered dial: an 800px hairline ring carrying one marker per service.
 *
 * A Server Component with no scroll awareness. It renders a static ring; the
 * rotation arrives as `--service-progress` (0–4, continuous) written to the
 * section root by {@link ServiceScroller}, and the per-marker highlight arrives
 * as `data-state`. Nothing here re-renders while scrolling.
 *
 * Geometry, measured (SERVICES-SECTION.md §3):
 *
 *     ring      800px across, 1px #00000014, dots sitting ON the line (r = 400)
 *     dot       10px, inside an 18px concentric ring
 *     number    centre at r = 432, 32px Fraunces, rotating WITH the ring
 *     inactive  number goes muted, dot scales to 0.11 and fades out
 *
 * The two arrangements differ only in three numbers, so they are expressed as
 * custom properties rather than as two components:
 *
 *     beside the column   anchor  0deg, step 30deg, direction  1  (tablet and up)
 *     above the column    anchor 90deg, step 20deg, direction -1  (phone)
 *
 * Marker i sits at `anchor + direction × i × step`; the ring counter-rotates by
 * `-direction × progress × step`, so the active marker always lands on `anchor`.
 * Because both formulas are written in terms of the same three properties, one
 * markup tree covers both layouts.
 */
export function ProgressDial({ count }: { count: number }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute size-0",
        // Phone: ring centred horizontally, its bottom edge 140px below the
        // stage top — so the centre sits 260px above it.
        "top-[-260px] left-1/2",
        // Tablet and up: ring right-aligned to this column, vertically centred.
        "tablet:top-1/2 tablet:right-[400px] tablet:left-auto",
        // The three constants the formulas below read.
        "[--dial-anchor:90deg] [--dial-dir:-1] [--dial-step:20deg]",
        "tablet:[--dial-anchor:0deg] tablet:[--dial-dir:1] tablet:[--dial-step:30deg]",
      )}
    >
      {/*
        The ring. Deliberately has no transition: it tracks the scroll position
        directly, so easing it would make it lag the pointer. `will-change` is
        justified here and only here — it is the one element that changes every
        frame.
      */}
      {/*
        Centring is written into the `transform` rather than using
        `-translate-x-1/2`: in Tailwind v4 those utilities set the separate
        `translate` property, which composes with `transform` instead of
        replacing it — the two together moved the ring a full 400px off centre.
      */}
      <div
        className="absolute top-1/2 left-1/2 rounded-full border border-hairline-strong [transform:translate(-50%,-50%)_rotate(calc(var(--dial-dir)*var(--service-progress,0)*var(--dial-step)*-1))] [will-change:transform]"
        style={{ width: dial.size, height: dial.size }}
      >
        {Array.from({ length: count }, (_, i) => (
          <div
            key={i}
            data-dial-marker={i}
            data-state={i === 0 ? "active" : "inactive"}
            style={{ ["--i" as string]: i }}
            className="group absolute top-1/2 left-1/2 size-0 [transform:rotate(calc(var(--dial-anchor)+var(--dial-dir)*var(--i)*var(--dial-step)))]"
          >
            {/* Dot in its concentric ring, centred exactly on the 400px radius. */}
            <span
              data-dial-dot
              className="absolute top-0 grid size-[18px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-brand-emerald/10 transition-[opacity,scale] duration-[var(--duration-spring)] ease-[var(--ease-spring)] group-data-[state=inactive]:scale-[0.111] group-data-[state=inactive]:opacity-0"
              style={{ left: dial.size / 2 }}
            >
              <span className="size-[10px] rounded-full bg-brand-emerald shadow-[0_2px_5px_0_rgb(29_137_68/0.2)]" />
            </span>

            {/*
              Number, 32px outside the ring line.

              It turns with the ring, but the anchor is cancelled so the ACTIVE
              number is always upright and its neighbours tilt away from it by one
              step. Beside the column the anchor is 0deg and this is a no-op;
              above the column it is 90deg, and without the cancellation the
              active number reads sideways. Measured: the reference's phone dial
              reports 0° on the active marker and ±20° on its neighbours.
            */}
            <span
              data-dial-number
              className="absolute top-0 -translate-x-1/2 -translate-y-1/2 font-display text-[2rem] leading-9 tracking-[var(--tracking-display)] text-muted transition-colors duration-[var(--duration-spring)] ease-[var(--ease-spring)] [transform:rotate(calc(-1*var(--dial-anchor)))] group-data-[state=active]:text-ink"
              style={{ left: dial.numberRadius }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
