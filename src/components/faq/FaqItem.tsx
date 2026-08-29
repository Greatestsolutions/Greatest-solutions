import type { FaqEntry } from "@/data/faq";

/**
 * One FAQ row: a question that toggles its answer open.
 *
 * **Built on `<details>`/`<summary>`, so it ships zero client JavaScript.**
 * The measured behaviour is a plain independent toggle — multiple items stay
 * open at once, verified by opening a second while the first was open — which is
 * exactly what `<details>` does natively. Native elements also bring the
 * keyboard contract (Enter and Space), the expanded/collapsed announcement, and
 * the button role without a single line of ARIA. A React implementation would
 * hydrate six components to re-implement all of that.
 *
 * Measured, all at 1440 unless noted:
 *
 *   row closed   36 (question) + 0 (answer) + 24 bottom = 60
 *   row open     36 + 88 + 24 = 148
 *   question     Inter 16/24/-0.02em/500 · #141414
 *   order        Fraunces 32/36/-0.04em opsz 32 · muted · **opacity 0.3**
 *   answer       Inter 16/24/-0.02em · #656565 · padding 16px 36px 0
 *   arrow        36px circle · white · --shadow-flat · 24px chevron, muted
 *   open         chevron rotates **180°** — measured, not the 45° a plus-icon
 *                would use
 *
 * The reference collapses its answer to 1px rather than 0 and pads the row 23px
 * instead of 24; both are Framer artifacts that cancel out. 0 + 24 gives the same
 * 60px closed and 148px open row.
 *
 * The open animation is the project's existing spring: height and rotation were
 * sampled at frame rate and overshoot by 1.48% at ~468ms, settling by ~800ms —
 * the same curve `--ease-spring` already encodes from Task 2.
 *
 * Height is animated with a `0fr → 1fr` grid row rather than `height: auto`,
 * which is not interpolable. `interpolate-size` would be cleaner but is not yet
 * broadly available.
 */
export function FaqItem({ entry, index }: { entry: FaqEntry; index: number }) {
  return (
    <details className="group pb-6">
      <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
        {/* Decorative: the visible order is already conveyed by the list itself. */}
        <span
          aria-hidden="true"
          className="w-6 shrink-0 font-display text-heading-md opsz-32 text-muted opacity-30"
        >
          {index + 1}
        </span>

        <h3 className="flex-1 pr-6 text-body-lg font-medium text-ink">{entry.question}</h3>

        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface shadow-flat">
          <svg
            viewBox="0 0 24 24"
            className="size-6 text-muted transition-transform duration-[var(--duration-spring)] ease-[var(--ease-spring)] group-open:rotate-180"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M 8 10 L 11.293 13.293 C 11.683 13.683 12.317 13.683 12.707 13.293 L 16 10"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>

      {/* 0fr → 1fr is what makes the height interpolable; the inner element must
          carry the clip or the answer shows through while collapsed. */}
      <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-[var(--duration-spring)] ease-[var(--ease-spring)] group-open:grid-rows-[1fr]">
        <div className="overflow-hidden">
          <p className="px-9 pt-4 text-body-lg text-body">{entry.answer}</p>
        </div>
      </div>
    </details>
  );
}
