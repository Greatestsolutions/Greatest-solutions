"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The desktop fan's entrance trigger — the section's only client code, and it owns
 * no markup: it flips one attribute when the block reaches the viewport.
 *
 * Measured (TESTIMONIALS-SECTION.md §3): the outer two cards start closer to the
 * centre and less turned, then spread outward. Sampled every 120ms as the section
 * came into view:
 *
 *   card 1   −9° at (32, 32)   →   −14° at (0, 0)
 *   card 3   +5° at (−32, 32)  →   +10° at (0, 0)
 *   card 2   static
 *
 * The travel decays to zero with **no overshoot** and settles at ~1450ms, which is
 * `spring.entrance` — the reference's own 1.5s bounce-0 preset. It is transcribed
 * as `--ease-entrance` in globals.css, so the animation itself is CSS; this
 * component only decides *when*.
 *
 * Why an observer rather than a plain CSS animation: the section is ~13,000px down
 * the page. An animation that runs on load would be over long before anyone
 * arrives, and the fan-out — the whole point of the composition — would never be
 * seen. `IntersectionObserver` is the right tool for "has this arrived yet", and
 * it disconnects after the first trigger, so nothing runs for the rest of the
 * session.
 *
 * No React state: the flag is a `data-` attribute the CSS reads. Reconciling three
 * server-rendered cards to move a boolean would be pure cost.
 *
 * Under `prefers-reduced-motion` the observer is never created, so the cards
 * render at their settled positions — which is exactly what the markup already
 * says without any script at all.
 */
export function TestimonialsFan({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.state = "in";
      return;
    }

    const gate = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        el.dataset.state = "in";
        gate.disconnect();
      },
      // A little short of the full block: the fan should be underway by the time
      // it is properly on screen, not starting as it leaves.
      { rootMargin: "0px 0px -15% 0px" },
    );
    gate.observe(el);
    return () => gate.disconnect();
  }, []);

  return (
    <div ref={root} data-state="out" className="group/fan">
      {children}
    </div>
  );
}
