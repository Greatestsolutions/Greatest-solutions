import { Pill } from "@/components/ui/Pill";

/**
 * The eyebrow every section on a service detail page opens with.
 *
 * It is the site's existing eyebrow — `Pill size="eyebrow"`, the same component
 * and variant behind the "SERVICE" pill at the top of this page and the
 * "SERVICES" eyebrow on the intro page. An earlier pass invented a separate
 * treatment for these (bare mono text with a short rule beside it), which meant
 * two eyebrow styles on one page and a third convention on the site. Reusing the
 * component makes them consistent by construction rather than by matching
 * utilities by hand.
 *
 * Wrapped in a real `h2` so each section is announced as a heading. The Pill
 * renders a `span`, so nothing about its box changes; only the semantics do.
 * Base styles paint every heading in the display serif, which is wrong for an
 * eyebrow, so the mono family the Pill carries is restated here to win over it.
 */
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-mono [font-variation-settings:normal] [letter-spacing:normal]">
      <Pill size="eyebrow">{children}</Pill>
    </h2>
  );
}
