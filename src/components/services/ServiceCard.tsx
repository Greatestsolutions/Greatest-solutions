import { ContactButton } from "@/components/contact/ContactButton";
import { Button } from "@/components/ui/Button";
import { Picture } from "@/components/ui/Picture";
import { Pill } from "@/components/ui/Pill";
import type { Service } from "@/data/services";

/**
 * One service: title, description, capability pills, and — below desktop — its
 * illustration.
 *
 * A Server Component. Nothing here reads the scroll; the active/inactive
 * treatment arrives as a `data-state` attribute written by {@link ServiceScroller},
 * so this markup is identical at every scroll position and ships no JavaScript.
 *
 * Measured internals, identical at all three breakpoints
 * (SERVICES-SECTION.md §3):
 *
 *     card          flex column, gap 32
 *       name        flex column, gap 16   (title, description)
 *       tags        flex row,    gap 8, wrapping
 *
 * The illustration is `order`ed rather than duplicated: the reference puts it
 * above the text on tablet and below the tags on phone, which is one element in
 * two places, not two elements.
 *
 * The reference wraps the whole card in a link to /services/<slug>. Those routes
 * arrive in Task 4; until then the card is not a link, following the same rule as
 * the navbar — no links to 404s. `slug` is already in the data for that step.
 */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <div className="flex flex-col gap-8 text-center tablet:text-center desktop:text-left">
      {/*
        Inline illustration. Desktop has its own sticky copy in the right column,
        so this one is hidden there rather than rendered twice.

        The negative top margin cancels the flex gap on phone only: the reference
        has 32px between every text block but 0 between the tags and the artwork.
      */}
      <div
        // The emerald material. See EmeraldFilter for why this is a luminance ramp
        // rather than a tint layer.
        style={{ filter: "url(#gst-emerald)" }}
        className="relative order-1 -mt-8 w-full overflow-clip desktop:hidden tablet:-order-1 tablet:mt-0 tablet:h-[350px] max-tablet:aspect-[342/375]"
      >
        <Picture
          source={service.abstractIllustration}
          alt=""
          width={1024}
          height={1024}
          sizes="490px"
          className="absolute top-1/2 left-1/2 h-[490px] w-[490px] max-w-none -translate-x-1/2 -translate-y-1/2"
        />

      </div>

      {/* Measured: 32px between title and description on phone, 16px from tablet up. */}
      <div className="flex flex-col gap-8 tablet:gap-4">
        {/*
          h2 because the section itself has no heading in the reference — each
          service is a top-level item under the page's h1.

          Sizes are the three measured presets (64 / 51 / 44) rather than one
          fluid ramp: the reference steps at 1200, and a ramp would be further
          from it at 1199 than a step is anywhere.

          `text-wrap: wrap` overrides the global `balance` on headings. The
          reference computes `wrap`/`auto` here, and balance is not free: at 390px
          it broke "Social Media & Content Marketing" into three lines where the
          reference takes two, which cascaded into a 48px height difference.
        */}
        <h2 className="text-[2.75rem] leading-[48px] text-wrap opsz-56 tablet:text-[3.1875rem] tablet:leading-[1.1] tablet:opsz-64 desktop:text-[4rem] desktop:leading-[68px]">
          {service.title}
        </h2>
        <p className="text-body-lg text-body">{service.description}</p>
      </div>

      <ul className="flex flex-wrap justify-center gap-2 desktop:justify-start">
        {service.tags.map((tag) => (
          <Pill key={tag} as="li">
            {tag}
          </Pill>
        ))}
      </ul>

      {/*
        The two actions, following the pair already used at the foot of
        `/services/[slug]`: the default ink `Button` as the primary and `light`
        as the secondary. No new button style, and the same alignment rule the
        tags above use — centred until desktop, then left.

        `size="md"` rather than the `lg` that page uses: these sit inside a card
        whose item is `min-h-svh`, and the smaller control keeps the content box
        clear of that height at every width, so the scroll-progress-to-active-index
        maths is untouched. `-mt-2` trims the card's 32px gap to 24px here, which
        groups the buttons with the tags rather than floating them as a third
        block.
      */}
      <div className="-mt-2 flex flex-wrap justify-center gap-3 desktop:justify-start">
        <ContactButton>Start this service</ContactButton>
        {/* Each service's OWN slug — the `-2` placeholders link to their own
            pages, not back to the entry they duplicate. */}
        <Button href={`/services/${service.slug}`} tone="light">
          View roadmap
        </Button>
      </div>
    </div>
  );
}
