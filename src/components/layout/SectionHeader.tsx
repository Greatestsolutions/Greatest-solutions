import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Pill } from "@/components/ui/Pill";

/**
 * The heading block every remaining homepage section opens with.
 *
 * Measured identical across Works, Progress, Pricing, Client and Blog
 * (HOMEPAGE-SECTIONS.md §2):
 *
 *   Header      flex column · gap 16
 *     Pill      eyebrow, 28px tall
 *     h2        Fraunces 56 / 60 / -0.04em · #141414 · 520px wide
 *
 * and the section's `Container` puts 72px between this block and the content
 * below it. That 72px belongs to the section, not the header, so it is not
 * baked in here — a header with no content under it should not carry a gap.
 *
 * Alignment is the only structural variant: left in four sections, centred in
 * Client, where the column also widens 520 → 580.
 *
 * A Server Component. `actions` and `children` are escape hatches for the two
 * sections that put something extra in the header — Works stacks a CTA under it
 * with a 32px gap, Blog floats one to the right of it.
 */
export type SectionHeaderProps = {
  /** Short label in the eyebrow pill. Omit for a header with no eyebrow. */
  eyebrow?: string;
  /** The section heading. Rendered as an `h2` under the page's single `h1`. */
  title: ReactNode;
  /** Optional supporting sentence under the title. */
  description?: ReactNode;
  align?: "start" | "center";
  /** Rendered below the title block, e.g. the Works section's CTA. */
  actions?: ReactNode;
  /** Anything else that belongs inside the header column. */
  children?: ReactNode;
  /** Measured column width: 520 left-aligned, 580 centred. */
  width?: "default" | "wide";
  className?: string;
  /** Set when the heading should not be the section's accessible name source. */
  id?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "start",
  actions,
  children,
  width = "default",
  className,
  id,
}: SectionHeaderProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        centered ? "items-center text-center" : "items-start",
        // The measured column caps. Below tablet the section gutters govern, so
        // the cap only engages once there is room for it to mean anything.
        width === "wide" ? "tablet:max-w-[580px]" : "tablet:max-w-[520px]",
        centered && "mx-auto",
        className,
      )}
    >
      {eyebrow && <Pill size="eyebrow">{eyebrow}</Pill>}

      {/*
        Measured 56/60 from tablet up and 44/48 on phone — the same two-step the
        service titles take. `w-full` so the heading fills the capped column
        rather than shrinking to its text, which is what centring depends on.

        `opsz-56` is load-bearing, not decoration. Every section heading in the
        reference is pinned to optical size 56 at BOTH rendered sizes — verified
        across all seven. Left on `auto` the phone heading resolves to opsz 44,
        whose wider letterforms push "Clarity in 3 Steps" past the 342px column
        and cost a third line.
      */}
      <h2 id={id} className="w-full text-heading-xl opsz-56 tablet:text-display-md">
        {title}
      </h2>

      {description && <p className="text-body-lg text-body">{description}</p>}

      {/* Measured 32px below the title block on the Works CTA; the column's own
          16px gap supplies half of it. */}
      {actions && <div className="mt-4">{actions}</div>}

      {children}
    </div>
  );
}
