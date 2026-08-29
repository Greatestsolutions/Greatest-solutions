import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { PricingCard } from "@/components/pricing/PricingCard";
import { pricingEyebrow, pricingPlans, pricingTitle } from "@/data/pricing";

/**
 * Pricing — three plans, the last one featured on ink.
 *
 * A Server Component; no client JavaScript. The only interaction is the button
 * hover, which lives in `Button` as CSS.
 *
 * Measured layout (HOMEPAGE-SECTIONS.md and the 3.2b measurement pass):
 *
 *   desktop  three columns, 416 wide, gap 24
 *   tablet   two columns, 361 wide, gap 24 — the featured card spans both
 *   phone    one column, gap 24, container padding 36/0
 *
 * The tablet arrangement is why this is a grid rather than a flex row: the third
 * card has to span the full width on its own line, which `flex-wrap` cannot
 * express without a hard width on every card.
 *
 * Header→content gap is 72 on desktop but 64 at tablet and 56 on phone — three
 * measured values, unlike Process which holds 72 at both upper breakpoints.
 */
export function Pricing({ showHeader = true }: { showHeader?: boolean } = {}) {
  return (
    <Section
      id="pricing"
      label={pricingEyebrow}
      spacing="default"
      // Phone padding here is 36 top and bottom, not the shared 64 — measured.
      className="max-tablet:py-9"
    >
      <div className="flex flex-col gap-14 tablet:gap-16 desktop:gap-[72px]">
        {showHeader && (
        <SectionHeader
          eyebrow={pricingEyebrow}
          align="start"
          className="max-tablet:mx-auto max-tablet:items-center max-tablet:text-center"
          title={
            <>
              {pricingTitle[0]}
              <br className="max-tablet:hidden" /> {pricingTitle[1]}
            </>
          }
        />
        )}

        {/*
          On phone the reference runs the cards wider than the text column —
          366px against the header's 342, i.e. a 12px page inset rather than the
          shared 24. Only the card row does this, so it is a negative margin here
          rather than a change to Container's gutter.
        */}
        {/*
          `items-start` so each card is content-height, as the reference's
          `align-items: flex-start` row is — the Growth plan has a shorter
          description and measures 584 against the other two at 604. A stretched
          grid would equalise them and lose that.
        */}
        <ul className="grid items-start gap-6 max-tablet:-mx-3 tablet:grid-cols-2 desktop:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              // Featured spans both tablet columns and returns to one on desktop.
              className={plan.featured ? "tablet:col-span-2 desktop:col-span-1" : undefined}
            />
          ))}
        </ul>
      </div>
    </Section>
  );
}
