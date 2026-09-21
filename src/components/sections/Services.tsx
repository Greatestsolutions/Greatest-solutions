import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { ServicesShowcase } from "@/components/services/ServicesShowcase";
import { services, servicesEyebrow, servicesLabel, servicesTitle } from "@/data/services";

/**
 * Services — a rotating numbered dial and a per-service illustration, five
 * items revealed by scroll and the rest behind a "Show more".
 *
 * A Server Component for the header; the dial/track/illustration and the
 * reveal state live in {@link ServicesShowcase}, the section's one client
 * boundary — see its own doc comment for why the reveal count specifically
 * needs to be there rather than here.
 *
 * Layout, measured (SERVICES-SECTION.md §2). The reference ships three variants;
 * these are the same nodes with different grid placement:
 *
 *     desktop ≥1200   12 cols · dial 1–2 · text 5–10 (max 540) · art 11–12
 *     tablet 810–1199  8 cols · dial 1–2 · text 4–8
 *     phone  <810      1 col  · dial overlaid on the card, arc across the top
 *
 * `Container` already produces the reference's grid width at both breakpoints —
 * 1296px at 1440 and 746px at 810 — so no width is restated here.
 *
 * Both sticky columns sit in the same grid row as the text column, so their grid
 * area is the full track and `sticky` can travel its whole length. That is the
 * reference's own construction, and it is why the dial does not need JavaScript
 * to stay put.
 */
export function Services() {
  return (
    <Section
      id="services"
      label={servicesLabel}
      spacing="default"
      container={false}
      // The desktop illustration deliberately runs past the right edge; clipping
      // here is what turns that into a bleed rather than a horizontal scrollbar.
      className="overflow-clip"
    >
      {/* Every other homepage section opens with this header — Services was
          the one exception, with only the `Section`'s own `label` (an
          accessible name, never rendered) standing in for it. Sits above the
          scroll-tracked grid in normal document flow, so it costs the
          choreography below nothing: `ServiceScroller` measures its track and
          stage elements directly, not their position on the page. */}
      <Container className="pb-12 tablet:pb-16">
        <SectionHeader eyebrow={servicesEyebrow} title={servicesTitle} />
      </Container>

      {/* The emerald ramp the dial and illustration are painted through —
          `<EmeraldFilter />` now renders once, globally, in `PageShell`. */}
      <ServicesShowcase services={services} />
    </Section>
  );
}
