import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Container, type ContainerWidth } from "./Container";

/**
 * A page section: vertical rhythm, an optional landmark id, and a Container.
 *
 * Vertical spacing is a named scale rather than per-section numbers so the page
 * keeps a consistent rhythm as sections are added. `none` exists for sections
 * that manage their own height, such as the full-viewport hero.
 */
export type SectionSpacing = "none" | "compact" | "default" | "spacious";

/**
 * `default` is the reference's own container rhythm, measured at all three of its
 * breakpoints: 64px phone / 72px tablet / 80px desktop.
 *
 * It previously read `py-20 lg:py-[80px]` — a flat 80px, since `py-20` is already
 * 80px, keyed to a breakpoint (1024) the reference does not use. That is exactly
 * the hazard HANDOFF §7 warns about, so the steps are on `tablet`/`desktop` here.
 */
const spacings: Record<SectionSpacing, string> = {
  none: "",
  compact: "py-12 tablet:py-14 desktop:py-16",
  default: "py-16 tablet:py-[72px] desktop:py-20",
  spacious: "py-20 tablet:py-24 desktop:py-32",
};

/** Extra attributes land on the <section>; see the note in Container. */
export type SectionProps = {
  children: ReactNode;
  /** Anchor target and scroll destination. */
  id?: string;
  spacing?: SectionSpacing;
  /** `false` renders children edge-to-edge, for full-bleed media. */
  container?: ContainerWidth | false;
  /**
   * Accessible name for the section landmark. When set, the element is exposed
   * as a labelled `region`, which lets screen-reader users jump between
   * sections. Without a name a bare <section> is not a landmark at all, so this
   * is preferable to adding empty ones.
   */
  label?: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"section">, "children" | "className" | "id">;

export function Section({
  children,
  id,
  spacing = "default",
  container = "content",
  label,
  className,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      aria-label={label}
      className={cn("relative", spacings[spacing], className)}
      {...rest}
    >
      {container === false ? children : <Container width={container}>{children}</Container>}
    </section>
  );
}
