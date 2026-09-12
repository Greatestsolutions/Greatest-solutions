import { PricingCard } from "@/components/pricing/PricingCard";
import type { PricingPlan } from "@/data/pricing";

/**
 * Three pricing tiers for one service, on its own `/services/[slug]` page.
 *
 * Reuses `PricingCard` directly — the same card the standalone `/pricing`
 * page renders, dark middle card and all — rather than a new component. The
 * grid is the identical shape too: `tablet:grid-cols-2 desktop:grid-cols-3`
 * with the featured card spanning both tablet columns, copied from
 * `sections/Pricing.tsx`. Two pricing surfaces on the same site should not
 * independently invent two different card grids.
 *
 * `items-start` rather than a stretched grid, for the same reason the
 * homepage section uses it: tiers rarely carry the same amount of copy (a
 * two-benefit support tier beside a four-benefit build tier), and stretching
 * them to match would blur that difference instead of just letting the
 * shorter card be shorter.
 */
export function ServicePricingTiers({ plans }: { plans: PricingPlan[] }) {
  return (
    <ul className="grid items-start gap-6 tablet:grid-cols-2 desktop:grid-cols-3">
      {plans.map((plan) => (
        <PricingCard
          key={plan.name}
          plan={plan}
          className={plan.featured ? "tablet:col-span-2 desktop:col-span-1" : undefined}
        />
      ))}
    </ul>
  );
}
