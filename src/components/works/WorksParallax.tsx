"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The Works thumbnails' scroll parallax — the section's only client code.
 *
 * The reference's behaviour was sampled at 41 scroll positions across the whole
 * block at 1440 and 24 at 390 (`tools/measure-works-scroll.js`). It is a plain
 * linear function of the thumbnail's own progress through the viewport:
 *
 *     progress   = (viewportH − windowTop) / (viewportH + windowH)    clamped 0…1
 *     translateY = (2 · progress − 1) × 0.15 × windowH
 *
 * Fitted against every sample, that model's mean error is **0.02px** and its worst
 * 0.88px — so this is the relationship, not an approximation of one. Specifically
 * measured and ruled out:
 *
 * - **No easing.** The residual of the linear fit is at the noise floor; any curve
 *   would show up as a systematic bow in the middle of the transit.
 * - **No spring, no smoothing, no velocity term.** Sampling the same scroll
 *   position 120ms and 700ms after a jump returns byte-identical values, so
 *   nothing is still settling after the scroll stops.
 * - **Same curve for all six cards, and the same on phone.** Only the amplitude
 *   changes, and only because it is a fixed 15% of a thumbnail that scales.
 *
 * ## Why this shape
 *
 * The DOM writes are one custom property per visible card. Everything else — the
 * 130%-tall layer, the ±11.5385% travel, the clip — is static CSS on
 * server-rendered markup, so a card that never receives an update still renders
 * correctly at the centre of its travel.
 *
 * - **No React state.** A `useState` here would reconcile six cards on every
 *   scroll frame to move a number the DOM already holds. Same call as
 *   `ServiceScroller`, for the same reason: this value is purely presentational.
 * - **No Motion runtime.** `motion` is type-only in this project and its scroll
 *   helpers cost ~30 KB gzip to reproduce one multiplication.
 * - **`animation-timeline: view()` is the right shape and is deliberately not
 *   used yet.** Its `cover 0% → 100%` range is exactly the progress above, with
 *   zero JavaScript and compositor-driven updates — but Firefox shipped it in 144
 *   and Safari in 26, so it still needs this fallback beside it. Two
 *   implementations of one effect is worse than one that works everywhere;
 *   revisit with the services choreography at Task 6.
 * - **IntersectionObserver gates, it does not drive.** It cannot produce a
 *   continuous value, but it answers "is any of this worth measuring" — so the
 *   listeners only exist while the block is near the viewport and the rest of the
 *   page pays nothing for this section.
 *
 * Reads and writes are separated inside one rAF callback: every rect is taken
 * before any style is set, so a frame cannot force a second layout.
 *
 * Under `prefers-reduced-motion: reduce` nothing is wired at all and every layer
 * stays at its centred default. The reference does **not** do this — its parallax
 * runs identically under the emulated preference, verified — but silently moving
 * content on scroll is exactly what that preference asks us not to do, and it is
 * the call already made for the hero and the marquees.
 */
export function WorksParallax({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const windows = Array.from(el.querySelectorAll<HTMLElement>("[data-parallax]"));
    if (windows.length === 0) return;

    let frame = 0;
    let running = false;
    // Last value written per card, so an unchanged frame invalidates no styles.
    const last = new Array<number>(windows.length).fill(-1);

    const measure = () => {
      frame = 0;
      const vh = window.innerHeight;

      // --- reads -------------------------------------------------------------
      const rects = windows.map((node) => node.getBoundingClientRect());

      // --- writes ------------------------------------------------------------
      windows.forEach((node, i) => {
        const rect = rects[i];
        if (!rect) return;
        const span = vh + rect.height;
        if (span <= 0) return;
        const progress = Math.min(Math.max((vh - rect.top) / span, 0), 1);
        // Four decimals is ~0.02px of travel on the largest thumbnail measured;
        // rounding here is what makes the "unchanged" check worth having.
        const value = Math.round(progress * 1e4) / 1e4;
        if (value === last[i]) return;
        last[i] = value;
        node.style.setProperty("--parallax", String(value));
      });
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    const gate = new IntersectionObserver(
      (entries) => {
        const visible = entries[entries.length - 1]?.isIntersecting ?? false;
        if (visible === running) return;
        running = visible;
        if (running) {
          window.addEventListener("scroll", schedule, { passive: true });
          window.addEventListener("resize", schedule, { passive: true });
          schedule();
        } else {
          window.removeEventListener("scroll", schedule);
          window.removeEventListener("resize", schedule);
        }
      },
      // One viewport of lead-in, so the first frame after entry is already at the
      // right offset instead of snapping there.
      { rootMargin: "100% 0px" },
    );
    gate.observe(el);

    return () => {
      gate.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={root}>{children}</div>;
}
