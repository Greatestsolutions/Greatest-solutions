import { cn } from "@/lib/cn";
import { ContactButton } from "@/components/contact/ContactButton";
import { BenefitIcon } from "@/components/pricing/BenefitIcon";
import { PlanIcon } from "@/components/pricing/PlanIcon";
import type { PricingPlan } from "@/data/pricing";

/**
 * One pricing plan. A Server Component — the only interaction is the button's
 * own hover, which is CSS.
 *
 * Measured at 1440 (all three cards identical apart from tone):
 *
 *   card        416 x 604 · padding 40 · radius 24 24 48 48 · --shadow-float
 *               flex column · gap 32
 *     Plan Name   gap 16 → [icon 36 · gap 16 · h3 Fraunces 24/28] + p Inter 14/20
 *     rule        1.5px round dots every 6px
 *     Benefits    gap 16 → rows of [22px mark · gap 12 · p Inter 14/20]
 *     rule
 *     Price       gap 24 → [Fraunces 32/36 + unit Inter 14/20] + button 48 tall
 *
 * Tones, measured: the default card is white with #141414 text and #656565 body;
 * the featured card is #141414 with white text, white/64% body, and its rule
 * switches from black/10% to white/12%.
 *
 * The heading is `h3` because the section heading is the `h2`; the reference
 * uses `h6` here, which is decorative rather than structural.
 */
export function PricingCard({ plan, className }: { plan: PricingPlan; className?: string }) {
  const dark = plan.featured;

  return (
    <li
      className={cn(
        // Phone uses the reference's `Defaut - Small` variant: 36px padding and
        // a 28px stack gap, against 40/32 from tablet up.
        "flex flex-col gap-7 rounded-[var(--radius-plan)] p-9 shadow-float tablet:gap-8 tablet:p-10",
        dark ? "bg-ink" : "bg-surface",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {/* Ink on the light cards; the reference uses its unmapped red on the
              dark one, so brand green stands in — see PlanIcon. */}
          <span className={dark ? "text-brand-emerald" : "text-ink"}>
            <PlanIcon name={plan.icon} />
          </span>
          <h3 className={cn("text-heading-sm", dark && "text-surface")}>{plan.name}</h3>
        </div>
        <p className={cn("text-body-md", dark ? "text-white/64" : "text-body")}>
          {plan.description}
        </p>
      </div>

      <Rule dark={dark} />

      <ul className="flex flex-col gap-4">
        {plan.benefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-3">
            <span className={dark ? "text-surface" : "text-muted"}>
              <BenefitIcon label={benefit} />
            </span>
            <span className={cn("text-body-md", dark ? "text-surface" : "text-ink")}>
              {benefit}
            </span>
          </li>
        ))}
      </ul>

      <Rule dark={dark} />

      {/* mt-auto keeps the price and button flush with the bottom when cards in
          a row have different amounts of copy, as they do at every breakpoint. */}
      <div className="mt-auto flex flex-col gap-6">
        <p className="flex items-end gap-1.5">
          <span className={cn("text-heading-md", dark ? "text-background" : "text-ink")}>
            {plan.price}
          </span>
          {/* The 3px bottom padding is measured: the unit sits above the price's
              baseline rather than on it. */}
          <span className="pb-[3px] text-body-md text-body">{plan.unit}</span>
        </p>
        {/* Every plan's action points at /contact, so all three open the dialog.
            A plan that ever points elsewhere would need the link form back. */}
        <ContactButton size="lg" tone={dark ? "light" : "dark"} className="w-full">
          {plan.cta}
        </ContactButton>
      </div>
    </li>
  );
}

/**
 * The dotted divider. The reference draws it as an SVG stroke with
 * `stroke-dasharray="0.01,6"`, `stroke-width: 1.5` and `stroke-linecap: round`,
 * i.e. a 1.5px round dot every 6.01px — black at 10% on light, white at 12% on
 * dark.
 *
 * Reproduced as a radial-gradient at exactly that pitch rather than as an inline
 * SVG, because the reference's SVG is stretched with `preserveAspectRatio="none"`
 * and its dot spacing therefore distorts with card width. A background pattern
 * holds the measured 6px pitch at every breakpoint.
 */
function Rule({ dark }: { dark?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        // 1px of layout, matching the reference's SVG box; the 1.5px dots paint
        // inside it. Giving the rule its full 1.5px would add 1px per divider to
        // every card's height.
        "h-px w-full bg-[length:6.01px_1.5px] bg-repeat-x",
        dark
          ? "bg-[radial-gradient(circle,rgb(255_255_255/0.12)_0.75px,transparent_0.75px)]"
          : "bg-[radial-gradient(circle,rgb(0_0_0/0.1)_0.75px,transparent_0.75px)]",
      )}
    />
  );
}
