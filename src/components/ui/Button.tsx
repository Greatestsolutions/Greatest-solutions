import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The reference's button. Audited across the whole page: every instance is a
 * fully-round pill with a 10px icon gap and Inter 14/500 label, and only two
 * axes vary.
 *
 *   size  `md` 40px tall · padding 10px 20px   — section CTAs, 4 uses
 *         `lg` 48px tall · padding 14px 20px   — pricing plan actions, 3 uses
 *   tone  `brand` the 140deg green gradient + the 5-layer --shadow-cta
 *         `dark`  #141414 on white surfaces
 *         `light` white on dark surfaces, or as a secondary action
 *
 * Extracted because there are seven consumers across Works, Blog, Pricing and
 * the footer. A Server Component — nothing here is interactive beyond a link.
 *
 * **The navbar CTA deliberately does not consume this.** The navbar is a frozen
 * surface (HANDOFF §7) and its CTA carries measured hover states this component
 * has no other consumer for. Both read the same `--shadow-cta` and gradient
 * tokens, so they cannot drift on colour; consolidate when the navbar is next
 * legitimately touched.
 *
 * Routes that do not exist yet render as non-interactive, matching the navbar's
 * rule: no links to 404s.
 */
export type ButtonSize = "md" | "lg";
export type ButtonTone = "brand" | "dark" | "light";

/**
 * The press scale is size-correlated, and it is measured, not chosen. Task 3.4b
 * hovered every button in the reference:
 *
 *   md (40px)  navbar CTA, footer CTA, Works CTA   scale(0.95)
 *   lg (48px)  pricing plan actions                scale(0.98)
 *
 * A single 0.98 everywhere — which is what the first pass shipped, from the
 * pricing measurement alone — leaves the smaller CTAs barely moving.
 */
const sizes: Record<ButtonSize, string> = {
  md: "h-10 px-5 py-2.5 hover:scale-95",
  lg: "h-12 px-5 py-3.5 hover:scale-[0.98]",
};

const tones: Record<ButtonTone, string> = {
  brand: "bg-[image:var(--gradient-cta)] text-white shadow-cta hover:shadow-cta-hover",
  dark: "bg-ink text-white shadow-pill",
  light: "bg-surface text-ink shadow-pill",
};

export type ButtonProps = {
  children: ReactNode;
  /** Omit for a real <button> — required for form submits, which a link cannot do. */
  href?: string;
  /** Only meaningful without `href`. */
  type?: "button" | "submit";
  /**
   * Only meaningful without `href`. Passing this makes the caller a Client
   * Component; this component itself stays server-renderable for every other use.
   */
  onClick?: () => void;
  size?: ButtonSize;
  tone?: ButtonTone;
  /** Route not built yet: renders non-interactive instead of linking to a 404. */
  pending?: boolean;
  /** Only meaningful without `href` — e.g. a form's submit button mid-send.
   *  Blocks activation and the hover label-swap without hiding the button. */
  disabled?: boolean;
  /** Decorative leading or trailing element. */
  icon?: ReactNode;
  className?: string;
};

export function Button({
  children,
  href,
  type,
  onClick,
  size = "md",
  tone = "dark",
  pending,
  disabled,
  icon,
  className,
}: ButtonProps) {
  const classes = cn(
    "group inline-flex shrink-0 items-center justify-center gap-2.5 overflow-clip",
    "rounded-[var(--radius-pill)] text-body-md font-medium whitespace-nowrap",
    "transition-[box-shadow,filter,scale] duration-[var(--duration-medium)] ease-[var(--ease-brand)]",
    // The press scale lives in `sizes` — it differs by size, measured. See there.
    sizes[size],
    tones[tone],
    // `disabled:` is a real pseudo-class variant, so it reliably overrides the
    // plain `hover:scale-*` in `sizes` regardless of class string order — `cn`
    // here is a plain joiner (see its own doc comment), not tailwind-merge, so
    // a later plain utility class competing on the same property would not be
    // guaranteed to win.
    "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100",
    className,
  );

  const label = (
    /*
      The reference stacks two copies of the label 24px apart inside a clipped
      button and slides them up on hover, so the label appears to roll over.
      Measured: label box 20px tall, gap 24, and on hover both copies move up 44px
      — the second lands exactly where the first was.

      The duration is NOT measured: Framer reports the shorthand `all` with no
      value exposed, so this reuses --duration-medium, which is the reference's
      own button transition duration for box-shadow and filter.
    */
    // h-5 is the measured 20px label box: the clip window shows exactly one copy.
    <span className="block h-5 overflow-clip" aria-hidden="true">
      <span className="flex flex-col gap-6 transition-transform duration-[var(--duration-medium)] ease-[var(--ease-brand)] group-hover:-translate-y-11">
        {/*
          The swap is NOT a slide alone — Task 3.4b measured all three properties
          moving together on the reference's pricing buttons:

            outgoing   translate −44px · opacity 1 → 0 · filter blur(0) → blur(10px)
            incoming   translate −44px · opacity 0 → 1 · filter blur(10px) → blur(0)

          Sliding without the cross-blur reads as a mechanical ticker; the blur is
          what makes one word dissolve into the other. Approximating it with a
          plain opacity fade was explicitly ruled out.
        */}
        <span className="block h-5 opacity-100 blur-none transition-[opacity,filter] duration-[var(--duration-medium)] ease-[var(--ease-brand)] group-hover:opacity-0 group-hover:blur-[10px] motion-reduce:transition-none">
          {children}
        </span>
        <span className="block h-5 opacity-0 blur-[10px] transition-[opacity,filter] duration-[var(--duration-medium)] ease-[var(--ease-brand)] group-hover:opacity-100 group-hover:blur-none motion-reduce:transition-none">
          {children}
        </span>
      </span>
    </span>
  );

  const content = (
    <>
      {icon}
      {label}
      {/* The visible copies are aria-hidden so the label is announced once. */}
      <span className="sr-only">{children}</span>
    </>
  );

  // No href: a real <button>. The contact form needs a submit control, and a
  // link cannot submit a form. Same classes, same label animation.
  if (!href) {
    return (
      <button type={type ?? "button"} onClick={onClick} disabled={disabled} className={classes}>
        {content}
      </button>
    );
  }

  if (pending) {
    return (
      <span aria-disabled="true" title="Coming soon" className={cn(classes, "cursor-default")}>
        {content}
      </span>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
