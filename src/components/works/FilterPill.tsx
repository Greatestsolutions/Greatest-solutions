"use client";

import { cn } from "@/lib/cn";

/**
 * An interactive keyword chip.
 *
 * Deliberately NOT a variant of {@link Pill}. That component's contract is that
 * it has no interactive state at all — its doc comment records that none of its
 * 38 usages carries a hover transition, verified against the reference — and
 * adding hover/pressed styling there would change every one of them. This is a
 * separate control that borrows the same visual tokens, so the two read as one
 * family without sharing a contract they disagree about.
 *
 * Matching `Pill size="tag" tone="surface"` exactly: 32px tall, Inter 14, fully
 * round, white on `--shadow-pill`, 12px horizontal padding.
 *
 * `aria-pressed` is what makes the selected state real rather than merely
 * visible: a screen reader announces the chip as pressed, so the filter that is
 * currently applied is discoverable without seeing the fill.
 */
export function FilterPill({
  children,
  pressed,
  onClick,
}: {
  children: React.ReactNode;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      className={cn(
        // Pill's own geometry and type.
        "inline-flex h-8 shrink-0 cursor-pointer items-center rounded-[var(--radius-pill)] px-3 py-1.5 text-body-md",
        "transition-[background-color,color,box-shadow] duration-[var(--duration-quick)] ease-[var(--ease-brand)]",
        "focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none",
        pressed
          ? // Selected: the brand ink fill the primary Button uses, so "on" reads
            // the same way it does everywhere else on the site.
            "bg-ink text-surface shadow-pill"
          : "bg-surface text-ink shadow-pill hover:bg-scrim-06",
      )}
    >
      {children}
    </button>
  );
}
