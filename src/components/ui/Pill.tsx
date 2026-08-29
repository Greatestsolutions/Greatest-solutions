import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The reference's pill chip — 38 instances across the page, all `6px 12px` on a
 * fully-round corner. Two things vary and nothing else does:
 *
 *   size   `eyebrow` 28px tall · Geist Mono 12 / +0.03em   — section labels, 7 uses
 *          `tag`     32px tall · Inter 14                  — capability tags, 28 uses
 *   tone   `surface` white + the 4-layer --shadow-pill                 — 35 uses
 *          `muted`   rgb(0 0 0 / .06), no shadow                       — 3 uses
 *
 * A Server Component. There is no hover state on any instance in the reference —
 * verified across all 38, none carries a transition that changes on hover — so
 * none is invented here.
 *
 * Already in use by the service tags, which this replaces; the remaining homepage
 * sections all consume it for their eyebrow.
 */
export type PillSize = "eyebrow" | "tag";
export type PillTone = "surface" | "muted";

const sizes: Record<PillSize, string> = {
  // Geist Mono at 12px with the +0.03em label tracking, measured at 28px tall.
  // `uppercase` is measured, not styling: all 7 eyebrows in the reference carry
  // it, and the data keeps its natural casing so it reads correctly in the DOM.
  // Geist Mono is monospace, so this changes appearance without changing width.
  eyebrow: "h-7 gap-2 font-mono text-body-sm tracking-[var(--tracking-label)] uppercase",
  // Inter at 14px, measured at 32px tall.
  tag: "h-8 text-body-md",
};

/**
 * Every eyebrow pill in the reference leads with an 8px round dot, and no tag
 * pill has one — which is why the two variants measure `gap: 8px` and `gap: 0`.
 * It is what makes the eyebrow 123px wide rather than 107 (12 + 8 + 8 + 83 + 12).
 *
 * The reference paints it `rgb(255,0,0)`, present in the pre-rebrand backup too,
 * so it is Orionix template residue the GST rebrand never mapped — the same call
 * already made for the services dial dot. Rendered in brand green for the same
 * reason, and reversible with one token.
 */
function Dot() {
  return <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-brand-emerald" />;
}

const tones: Record<PillTone, string> = {
  surface: "bg-surface shadow-pill",
  muted: "bg-scrim-06",
};

export type PillProps = {
  children: ReactNode;
  size?: PillSize;
  tone?: PillTone;
  /** Rendered before the label, in place of the eyebrow's default dot. */
  icon?: ReactNode;
  /** Eyebrow pills carry a leading dot by default; set false to drop it. */
  dot?: boolean;
  /** `li` inside a list, `span` inline. Defaults to `span`. */
  as?: ElementType;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"span">, "children" | "className">;

export function Pill({
  children,
  size = "tag",
  tone = "surface",
  icon,
  dot,
  as: Component = "span",
  className,
  ...rest
}: PillProps) {
  const leading = icon ?? ((dot ?? size === "eyebrow") ? <Dot /> : null);

  return (
    <Component
      className={cn(
        "inline-flex shrink-0 items-center rounded-[var(--radius-pill)] px-3 py-1.5 text-ink",
        sizes[size],
        tones[tone],
        className,
      )}
      {...rest}
    >
      {leading}
      {children}
    </Component>
  );
}
