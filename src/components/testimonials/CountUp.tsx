"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Counts a stat up from 0 when it first reaches the viewport.
 *
 * Same trigger discipline as {@link TestimonialsFan}: one `IntersectionObserver`
 * that disconnects after the first hit, so scrolling past again does not restart
 * the count and nothing runs for the rest of the session.
 *
 * The number renders as `0` on the server and for the first paint, which is both
 * the correct starting frame and what the section looks like before it is
 * reached — so there is no hydration mismatch and no flash of the final value.
 *
 * Under `prefers-reduced-motion` the final value is set immediately: the
 * information is the number, not the animation.
 */
export function CountUp({ to, durationMs = 1400 }: { to: number; durationMs?: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Deferred by a frame rather than set inline: a synchronous setState inside
      // an effect triggers a cascading render.
      raf = requestAnimationFrame(() => setN(to));
      return () => cancelAnimationFrame(raf);
    }

    const gate = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        gate.disconnect();
        const start = performance.now();
        const step = (now: number) => {
          const t = Math.min((now - start) / durationMs, 1);
          // Ease-out cubic: quick off the mark, settles rather than stopping dead.
          setN(Math.round(to * (1 - Math.pow(1 - t, 3))));
          if (t < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    gate.observe(el);
    return () => {
      gate.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, durationMs]);

  return (
    <span ref={ref} suppressHydrationWarning>
      {n}
    </span>
  );
}
