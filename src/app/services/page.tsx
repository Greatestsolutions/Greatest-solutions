import type { Metadata } from "next";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { PageShell } from "@/components/layout/PageShell";
import { ServiceArt } from "@/components/services/ServiceArt";
import { Pill } from "@/components/ui/Pill";
import { ProcessSequence } from "@/components/services/ProcessSequence";
import { ServicesCarousel } from "@/components/services/ServicesCarousel";
import { services } from "@/data/services";
import type { ImageSource } from "@/types/media";

export const metadata: Metadata = {
  title: "Services",
  description: "Software development and technology services from Greatest Solutions.",
  alternates: { canonical: "/services" },
};

/*
 * The intro's decorative accent — one of the same abstract sculptural renders
 * the service cards paint through the emerald filter, not a new asset or a
 * different visual family. "Brand identity" specifically, so the very first
 * thing a visitor sees isn't the exact same render "Web Development" (the
 * first service card, right below) is about to repeat a screen-height later.
 */
const introArt: ImageSource = {
  avif: "/services/brand-identity.avif",
  webp: "/services/brand-identity.webp",
  fallback: "/services/brand-identity.png",
};

export default function ServicesPage() {
  return (
    <PageShell>
      {/*
        The client's intro block leads the page — reordered ahead of the
        "What we build" header on request, so the descriptive copy sets up the
        list rather than following a second heading first. Copy is unchanged
        from before, wording and the arrow chain still theirs verbatim.

        This is now the FIRST thing on the page, so it carries the
        navbar-clearing top padding `PageHeader` used to own
        (`pt-[136px] desktop:pt-[184px]`, copied from there) — a sub-page with
        no full-height hero needs that or its first line lands behind the fixed
        bar. `PageHeader` itself isn't used here for exactly that reason: it
        always applies that padding, which only belongs on whichever block is
        actually first.

        `spacing="none"` rather than "compact": both edges are now stated
        explicitly, because the bottom edge is the deliberately SHORT half of
        the gap to "What we build" below — see the note on that Section for
        the other half. Falling back to the named `compact` bottom (48–64px)
        here would have put the reduction back in, defeating the point.
      */}
      <Section
        spacing="none"
        className="pt-[136px] pb-6 tablet:pb-8 desktop:pt-[184px] desktop:pb-10"
      >
        {/*
          The accent sits BESIDE the text, never behind it — legibility is then
          a non-issue by construction rather than something to check contrast
          for. `desktop:` only: at 810–1199px the 640px text column already
          leaves under 320px of container width, too tight for a considered
          graphic plus the gap it needs; the Services section's own desktop
          illustration column makes the identical call for the identical
          reason. Below `desktop` this is a single-column, text-only block,
          same as before this task.
        */}
        <div className="flex flex-col gap-10 desktop:flex-row desktop:items-center desktop:gap-24">
          <div className="flex flex-col gap-6 tablet:max-w-[640px]">
            {/* The eyebrow follows the block it now introduces — it moved here
                from "What we build" below, which reads fine without one now
                that it isn't the first thing on the page.

                `self-start`: this column is `flex flex-col` with no
                `items-start`, so its default `align-items: stretch` was
                stretching the pill (an inline-flex span, but still a flex
                ITEM here) to the column's full width. Overriding on the pill
                alone, not by adding `items-start` to the column — the
                heading and paragraphs below rely on that same stretch to
                take the column's width and wrap correctly; switching the
                whole column to `items-start` would shrink THEM to their own
                content width too. */}
            <Pill size="eyebrow" className="self-start">
              Services
            </Pill>
            <h2 className="text-heading-lg text-ink">AI solutions built around your business</h2>
            <p className="text-body-lg text-body">
              We use AI to make businesses smarter, faster, and more efficient — without losing the
              human thinking behind every decision.
            </p>
            <p className="text-body-lg text-body">
              From strategy and planning to development and optimization, our specialists work
              alongside AI to build solutions that fit your business, your processes, and your goals.
              Every system is thoughtfully planned, built, tested, and refined by people who
              understand the problem it is meant to solve.
            </p>
            {/* The one line in the block that isn't a paragraph — set apart in
                weight and colour, matching how the site already distinguishes a
                single emphasised line from surrounding body copy elsewhere.
                `ProcessSequence` reads as a 4-step sequence, so it gets a
                staggered scroll-reveal and a per-phase hover instead of being
                static text — see that component for the motion detail. */}
            <ProcessSequence />
            <p className="text-body-lg text-body">
              That’s the approach behind every service we provide. Explore the services below to see
              how we turn ideas into practical solutions that deliver real value.
            </p>
          </div>

          {/*
            The accent — redone as a genuine visual anchor, not a small icon in
            a big empty column. First pass sized it at 260px with a flat hover;
            against a column this wide that read as an afterthought. This is
            sized to actually fill the space, layered for depth the way
            `TestimonialCard`'s glow already establishes as this site's own
            technique (the same image, blown up and blurred, behind the sharp
            one) rather than a generic drop shadow or gradient blob, and kept
            visibly moving before anyone touches it.

            `clamp(420px, 36vw, 560px)`: fluid with the viewport rather than one
            frozen size, and at 1440 (36vw ≈ 518px) it is comparable to the text
            column's own rendered height — "one of the two main things on
            screen," not a bullet point beside the real content.

            No card, border or background panel — the same floating treatment
            the hero sculpture and the Services section's own illustration
            column use.

            `filter: url(#gst-emerald)` WITHOUT rendering `<EmeraldFilter />`
            here: that SVG lives once per document by id, and
            `<ServicesCarousel />` below already renders it on this exact
            page (replacing the arc-scroller `<Services />`, which used to be
            the one that provided it). SVG filter references resolve by id
            regardless of where in the DOM they sit, so this works — but it
            is a real dependency on that element existing somewhere on the
            page, not an accident. Rendering a second copy here would
            collide on the same `id="gst-emerald"` instead.

            Centred in an OUTER `flex-1 justify-center` wrapper, not centred
            by construction of the row itself. The row is `text (auto width) +
            gap-24 + graphic`, so without this the graphic sits flush against
            the gap — its own left edge, not its middle — and reads as pushed
            toward the text with the leftover container width stranded on the
            right. Giving it a wrapper that actually CLAIMS the remaining row
            width, then centers the fixed-size graphic inside that, holds true
            at any container width rather than a value tuned for one.
          */}
          <div className="hidden shrink-0 desktop:flex desktop:flex-1 desktop:items-center desktop:justify-center">
            {/*
              This treatment — the drifting, glowing, hover-reactive sculpture —
              was designed here and is now shared as `ServiceArt`, which the
              service detail mastheads use too. It was extracted rather than
              copied: its layers are balanced against each other, so two
              divergent copies would be two different effects wearing the same
              name.

              `ServiceArt` deliberately does NOT render `<EmeraldFilter />`. That
              SVG lives once per document by id, and `<ServicesCarousel />` below
              already renders it on this page; a second copy would collide on
              `id="gst-emerald"`.
            */}
            <ServiceArt
              source={introArt}
              className="desktop:size-[clamp(420px,36vw,560px)]"
              sizes="(min-width: 1200px) 36vw, 560px"
            />
          </div>
        </div>
      </Section>

      {/*
        "What we build" now sits directly above the service cards, reading as
        the list's own section label rather than the page's masthead — this is
        `SectionHeader` directly, not `PageHeader`, precisely because it no
        longer needs (and must not carry) the navbar-clearing padding above;
        that ordinary `Section spacing="compact"` gives it the same bottom
        rhythm any other mid-page section header gets before the content
        that follows it.

        No `eyebrow` here any more — that pill now sits above the intro block
        instead, which is the first thing on the page; a second "Services"
        label immediately below it read as redundant once the two blocks sit
        this close together.

        `pt-[0px]` removes this Section's own top padding entirely, so the
        whole gap to the intro block above is owned by ONE side — that
        block's own reduced bottom padding (`pb-6/8/10`, see its Section).
        Two Sections each contributing half would total the same distance but
        split it across two places to edit instead of one.

        `pt-[0px]` repeated at all THREE breakpoints, not one unprefixed
        override — measured, not assumed. `spacing="compact"` sets three
        different values (`py-12 tablet:py-14 desktop:py-16`), and a single
        unprefixed override (tried as both `pt-0` and `pt-[0px]`) only landed
        at the base tier: computed top padding stayed 56px at tablet widths
        and 64px at desktop, confirmed with `getComputedStyle` from 900px
        through 1440px before and after this fix. Repeating the override at
        each breakpoint `compact` itself writes is what actually zeroes it
        everywhere — verified the same way, `0px` at every width in that
        same sweep.

        The page's H1 landing here rather than at the top is the explicit,
        confirmed intent of the earlier reorder, not an oversight.
      */}
      <Section
        spacing="compact"
        className="pt-[0px] tablet:pt-[0px] desktop:pt-[0px]"
      >
        <SectionHeader
          title="What we build"
          description="Each service below has its own page with a fuller description."
        />
      </Section>

      {/*
        The Works-style carousel, replacing the numbered-arc scroller on this
        page only — `Services.tsx` itself is untouched and still renders on
        `/`. Full-bleed (no `Container`/`Section` wrapper): the peeking cards
        run to the viewport edges. (`/works` used to carry the same carousel; it
        is a static grid now, so this is the only one left.)
        It renders no heading of its own — the SectionHeader above is the
        only page-level heading for this list.
      */}
      <ServicesCarousel services={services} />
    </PageShell>
  );
}
