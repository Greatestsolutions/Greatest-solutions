import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { site } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { SolutionCard } from "@/components/services/SolutionCard";
import {
  services,
  solutionsCta,
  solutionsDescription,
  solutionsEyebrow,
  solutionsLabel,
  solutionsTitle,
} from "@/data/services";

/**
 * "Solutions" — the former "Featured Work" homepage section, repurposed to
 * showcase the service catalog instead of Works entries. Same staggered
 * 12-column masonry character as the section it replaces (`ProjectCard`/
 * `placements[]` in the old `sections/Works.tsx`, now deleted along with
 * `ProjectCard` and `WorksParallax` — both were only ever used here), but
 * every card is landscape now instead of portrait, since the real service
 * photos are all 16:9 and a portrait crop would fight the fit work already
 * done for them elsewhere (see `SolutionCard`).
 *
 * Sits in `app/page.tsx` directly before the homepage's OTHER, separate
 * services section (`ServicesShowcase`, the scroll-driven numbered-dial
 * carousel) — the same slot `Works` occupied before this replaced it. That
 * adjacency was flagged and briefly avoided by moving this section lower the
 * page, but the site owner asked for the original position back; see
 * `app/page.tsx`'s own doc comment rather than this one for that history.
 *
 * ## Which 6 of the 10
 *
 * The first 6 services in `services.ts`'s own existing order (AI Voice
 * Agents, Vertical Automation, AI Lead Generation, AI Content & Social, AI
 * Video/UGC, AI Copy & Sales Pages) — no separate hand-curated selection to
 * maintain in parallel, same reasoning the old `featured` flag on Works
 * entries followed. If a different subset is ever wanted, change this slice
 * rather than adding a second selection mechanism.
 *
 * ## The offsets are NOT the old Works section's numbers, scaled
 *
 * Landscape cards are roughly half the height of the portrait ones this
 * layout was built for (a `16:9` window is far shorter than a `416:522`
 * one, and the tag row collapses from a wrapped pill list to one line), so
 * carrying over the old ±72–230px stagger verbatim would overlap far more
 * of each card, proportionally, than the original design intended — enough
 * to cut into a neighbour's title or description rather than just its
 * image margin. The values below were recalculated for the new, shorter
 * card heights and confirmed by rendering the section, not derived from the
 * old numbers by a fixed formula.
 */
const FEATURED_SERVICES = services.slice(0, 6);

export function Solutions({
  showHeader = true,
}: {
  showHeader?: boolean;
} = {}) {
  return (
    <Section
      id="solutions"
      label={solutionsLabel}
      spacing="default"
      className="max-tablet:pt-9 max-tablet:pb-16"
    >
      <div className="flex flex-col gap-14 tablet:gap-16 desktop:gap-0">
        {showHeader && (
          <SectionHeader
            eyebrow={solutionsEyebrow}
            title={solutionsTitle}
            description={solutionsDescription}
            className="[&>h2]:[text-wrap:wrap]"
            actions={
              <Button href={`mailto:${site.email}`} tone="dark">
                {solutionsCta}
              </Button>
            }
          />
        )}

        <ul
          className={
            "grid gap-y-[42px] max-tablet:-mx-3 " +
            "tablet:grid-cols-2 tablet:gap-6 " +
            "desktop:grid-cols-12 desktop:gap-x-3 desktop:gap-y-0"
          }
        >
          {FEATURED_SERVICES.map((service, i) => (
            <SolutionCard
              key={service.slug}
              service={service}
              className={placements[i] ?? fallbackPlacement}
            />
          ))}
        </ul>

        <div className="flex justify-center pt-14 tablet:pt-16 desktop:pt-16">
          <Button href="/services" tone="light">
            Show all services
          </Button>
        </div>
      </div>
    </Section>
  );
}

/**
 * Desktop placement, by slot rather than by service — see the file doc
 * comment for why these pixel values are not the old Works section's own,
 * scaled by formula. Alternating sides and spans of 4/5, monotonic rows,
 * same construction the original weave used.
 */
const placements = [
  "desktop:col-start-9 desktop:col-span-4 desktop:row-start-1 desktop:mt-[-40px]",
  "desktop:col-start-1 desktop:col-span-5 desktop:row-start-2 desktop:mt-[-110px]",
  "desktop:col-start-7 desktop:col-span-4 desktop:row-start-3 desktop:mt-[-70px]",
  "desktop:col-start-2 desktop:col-span-5 desktop:row-start-4 desktop:mt-[90px]",
  "desktop:col-start-9 desktop:col-span-4 desktop:row-start-5 desktop:mt-[-95px]",
  "desktop:col-start-1 desktop:col-span-5 desktop:row-start-6 desktop:mt-[-60px]",
];

/** Slot 7 and beyond — see the equivalent note in the old Works section for
 *  why auto-placement (not a cycled index) is the safe degradation here. */
const fallbackPlacement = "desktop:col-span-4";
