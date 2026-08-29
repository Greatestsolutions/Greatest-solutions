import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Horizontal content column.
 *
 * The reference build repeats the same max-width + responsive gutter on every
 * section, which is why its section padding drifted (80px/64px, 72px/24px,
 * 0/12px, 0/8px all appear). One primitive keeps that consistent and makes a
 * future change to page gutters a single edit.
 */
export type ContainerWidth = "content" | "narrow" | "prose" | "full";

const widths: Record<ContainerWidth, string> = {
  content: "max-w-[var(--container-content)]", // 1560px — the page column
  narrow: "max-w-[var(--container-narrow)]", //   860px — text-led sections
  prose: "max-w-[var(--container-prose)]", //     520px — long-form copy
  full: "max-w-none",
};

/**
 * Extra attributes are forwarded to the rendered element.
 *
 * Without this the primitive silently swallows anything it does not name — a
 * `<Container as="nav" aria-label="Main">` rendered a `<nav>` with no
 * accessible name, and TypeScript did not object because `as` polymorphism
 * loosens the JSX prop check. Anything a caller passes now lands on the element.
 */
export type ContainerProps = {
  children: ReactNode;
  /** Defaults to `content`, the standard page column. */
  width?: ContainerWidth;
  /** Render as a different element when the semantics call for it. */
  as?: ElementType;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "className">;

/**
 * Page gutters, measured from the reference at each of its three variants.
 *
 * These are the gutters *inside* the 8px page inset on `<main>`, which is why
 * they read 16/24/64 rather than the 24/32/72 you measure from the window edge.
 * `tablet` and `desktop` are the reference's own breakpoints (810/1200), not
 * Tailwind's defaults — see the note in globals.css.
 */
const gutters =
  "px-[var(--gutter-phone)] tablet:px-[var(--gutter-tablet)] desktop:px-[var(--gutter-desktop)]";

export function Container({
  children,
  width = "content",
  as: Component = "div",
  className,
  ...rest
}: ContainerProps) {
  return (
    <Component className={cn("mx-auto w-full", gutters, widths[width], className)} {...rest}>
      {children}
    </Component>
  );
}
