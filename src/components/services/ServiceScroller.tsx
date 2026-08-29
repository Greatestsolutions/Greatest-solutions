"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Drives the services choreography from one number: how far the track has
 * scrolled through its own sticky span.
 *
 * The whole section reduces to that number (SERVICES-SECTION.md §4):
 *
 *     progress = clamp((trackTop_above_viewport) / (trackHeight - stageHeight), 0, 1)
 *     dial rotation = progress × (count - 1) × step      (continuous)
 *     active index  = round(progress × (count - 1))      (discrete)
 *
 * Why this shape rather than the obvious alternatives (Task 2.4):
 *
 * - **No React state.** The continuous value is written straight to a CSS custom
 *   property, and the discrete one to `data-state` attributes. A `useState` here
 *   would reconcile the whole subtree on every frame of every scroll; this
 *   reconciles nothing, ever. The state is purely presentational, so React does
 *   not need to know it.
 * - **No Motion runtime.** `motion` is still type-only in this project. The
 *   measured transition is a fixed 800ms spring, which `--ease-spring` encodes
 *   exactly as CSS, so the state changes need no JavaScript at all — only the
 *   attribute flip, which happens four times across 4,500px of scrolling.
 * - **IntersectionObserver as the gate, not the mechanism.** It cannot produce a
 *   continuous rotation, but it is the right tool for "is this worth measuring at
 *   all", so the rAF loop only exists while the section is on screen and the rest
 *   of the page pays nothing.
 * - **Read-then-write inside one rAF callback.** Both `getBoundingClientRect`
 *   calls happen before any style write, so a frame can never force a second
 *   layout. Nothing here reads a value it has just written.
 */
export function ServiceScroller({ count, children }: { count: number; children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || count < 2) return;

    const track = el.querySelector<HTMLElement>("[data-service-track]");
    const stage = el.querySelector<HTMLElement>("[data-service-stage]");
    if (!track || !stage) return;

    const items = el.querySelectorAll<HTMLElement>("[data-service-item]");
    const markers = el.querySelectorAll<HTMLElement>("[data-dial-marker]");
    const art = el.querySelectorAll<HTMLElement>("[data-service-illustration]");
    const last = count - 1;

    let frame = 0;
    let running = false;
    let active = -1;

    const apply = (nodes: NodeListOf<HTMLElement>, next: number, threeState: boolean) => {
      nodes.forEach((node, i) => {
        node.dataset.state = threeState
          ? i === next
            ? "active"
            : i < next
              ? "passed"
              : "upcoming"
          : i === next
            ? "active"
            : "inactive";
      });
    };

    const measure = () => {
      frame = 0;

      // --- reads -------------------------------------------------------------
      const rect = track.getBoundingClientRect();
      const span = rect.height - stage.getBoundingClientRect().height;

      // --- writes ------------------------------------------------------------
      const progress = span > 0 ? Math.min(Math.max(-rect.top / span, 0), 1) : 0;
      const value = progress * last;
      el.style.setProperty("--service-progress", value.toFixed(4));

      const next = Math.round(value);
      if (next !== active) {
        active = next;
        apply(items, next, false);
        apply(markers, next, false);
        apply(art, next, true);
      }
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    // Only listen while the section is anywhere near the viewport. `rootMargin`
    // starts it one viewport early so the first frame after entry is already
    // correct rather than snapping into place.
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
      { rootMargin: "100% 0px" },
    );
    gate.observe(el);

    return () => {
      gate.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [count]);

  return (
    <div ref={root} className="relative">
      {children}
    </div>
  );
}
