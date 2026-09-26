import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AiHumanWorkflow } from "@/components/services/AiHumanWorkflow";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/Button";
import { ConnectorArrowhead } from "@/components/ui/ConnectorArrowhead";
import { ContactButton } from "@/components/contact/ContactButton";
import { DeliverablesList } from "@/components/services/DeliverablesList";
import { OutcomeChart } from "@/components/services/OutcomeChart";
import { PageShell } from "@/components/layout/PageShell";
import { ServiceArt } from "@/components/services/ServiceArt";
import { RoadmapTimeline } from "@/components/services/RoadmapTimeline";
import { Reveal } from "@/components/ui/Reveal";
import { SectionLabel } from "@/components/services/SectionLabel";
import { StackGroups } from "@/components/services/StackGroups";
import { TeamRoles } from "@/components/services/TeamRoles";
import { cn } from "@/lib/cn";
import { services } from "@/data/services";

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.description,
    alternates: { canonical: `/services/${service.slug}` },
  };
}

/**
 * ONE vertical rhythm for the whole page.
 *
 * Every band below uses this and nothing else, so the gap between any two
 * sections is identical by construction rather than by each section choosing a
 * `Section` spacing token and the sum of two different choices landing wherever
 * it lands. That is what made the earlier pass read as uneven: adjacent
 * `compact` sections stacked 64px + 64px of their own padding at desktop, and a
 * section that happened to sit next to the header got a different total again.
 *
 * Tighter than `compact` on purpose. These pages are dense reference content,
 * and they should read at the density of the rest of the site rather than as a
 * more spacious template that happens to share its colours.
 */
const BAND_Y = "py-10 tablet:py-12 desktop:py-14";

/**
 * A full-bleed horizontal band.
 *
 * Colour is doing structural work here rather than decorating: the page
 * alternates warm ground, white panel and a soft emerald wash, so a reader
 * scrolling it sees where one idea ends and the next begins without needing a
 * rule or a border to tell them. The tints are the site's own — `--color-surface`
 * and the brand emerald at low alpha over `--color-background` — not new values.
 */
function Band({
  tone = "ground",
  children,
}: {
  tone?: "ground" | "panel" | "wash";
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative",
        BAND_Y,
        tone === "panel" && "bg-surface",
        tone === "wash" && "bg-brand-emerald/[0.05]",
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

/** The gap between a section's eyebrow and its content. One value, everywhere. */
const BLOCK = "flex flex-col gap-6 tablet:gap-8";

/**
 * Service detail, driven entirely by `data/services.ts`. Adding a service is a
 * data edit — no new component or route file is required.
 *
 * Each service stays its own statically generated route, in the sitemap and
 * separately shareable.
 *
 * ## Where the client boundary sits
 *
 * This page is a Server Component and stays one. The sections that animate on
 * scroll are their own client components taking plain data, so what ships to the
 * browser is those and nothing else — not the copy, not the layout, not the CTA.
 * Every hover state here is a CSS transition rather than a motion value, which
 * is why they survive `prefers-reduced-motion`: a response to a deliberate
 * action is not the kind of motion that setting is asking to remove.
 */
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <PageShell>
      {/* The emerald ramp the masthead and CTA artwork are painted through —
          `<EmeraldFilter />` now renders once, globally, in `PageShell`. */}

      {/*
        Scroll reveals are `whileInView`, which means motion renders their hidden
        frame server-side: several sections ship as `opacity: 0.001` and are
        raised by JS once they scroll in. The copy is in the HTML either way, but
        if the bundle fails or is blocked a visitor would see a mostly blank
        page. This restores them, and only ever applies when scripting is off.
        `!important` is required rather than lazy: motion writes the hidden state
        as an inline style, which no ordinary rule can outrank.
      */}
      <noscript>
        <style>{`[style*="opacity:0.001"]{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      {/* ---- masthead ---------------------------------------------------- */}
      {/*
        The header carries the page's most confident colour: a deep forest panel
        with the service's own abstract illustration bleeding off the right under
        the emerald ramp. It gives the top of a long scroll somewhere to land,
        and it is the counterweight to the dark CTA at the bottom — the two ends
        of the page are the two emphatic surfaces, everything between alternates
        quietly.
      */}
      {/*
        An INSET panel, not a full-bleed band.

        Run to the top edge, the forest sits directly under the navbar — and the
        navbar is a transparent surface with ink-coloured links until it gains
        its scroll backdrop, so every nav item and the logo disappeared into the
        dark. The bar is a frozen surface that a service page has no business
        restyling, so the page yields instead: it keeps the warm ground behind
        the navbar and starts the dark panel below it.

        The inset also reads better. A rounded panel floating on the page is the
        treatment the footer CTA and the showreel already use, so the masthead
        now belongs to the same family rather than being the one section that
        bleeds edge to edge.
      */}
      <section className="pt-[136px] desktop:pt-[184px]">
        <Container>
          <div className="relative overflow-hidden rounded-[var(--radius-xl)] bg-brand-forest px-6 py-12 tablet:px-10 tablet:py-14 desktop:px-16 desktop:py-16">
          {/*
            Text and art as two columns rather than art washed behind the words.
            An earlier pass floated the illustration at 25% opacity underneath
            the heading; it read as a texture rather than an object, and putting
            anything behind display type is a legibility bet with no upside. Side
            by side, the art can be full strength and the text sits on flat
            forest with nothing behind it at all.
          */}
          <div className="flex items-center gap-16 desktop:gap-24">
            <div className="relative flex max-w-[640px] flex-col items-start gap-5">
              {/*
                The eyebrow geometry of `Pill size="eyebrow"` — 28px tall, mono
                12, label tracking, leading dot — restated for a dark ground
                rather than passing a className to the component. `cn` is a plain
                joiner with no conflict resolution, so a `bg-*` override would
                race the component's own tone in the stylesheet and win or lose
                by rule order. This is the one on-dark instance on the site; if a
                second appears, `Pill` should gain a real `onDark` tone instead.
              */}
              <span className="inline-flex h-7 items-center gap-2 rounded-full bg-on-dark-surface px-3 font-mono text-body-sm tracking-[var(--tracking-label)] text-white/70 uppercase">
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-brand-leaf" />
                Service
              </span>

              <h1 className="text-heading-xl text-white opsz-56 tablet:text-display-md">
                {service.title}
              </h1>

              <p className="text-body-lg text-white/70">{service.description}</p>

              <ul className="flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <li
                    key={tag}
                    className="flex h-8 items-center rounded-full bg-on-dark-surface px-3 text-body-md text-white/80"
                  >
                    {tag}
                  </li>
                ))}
              </ul>

              {/* The one number in the header. Stated plainly rather than as a
                  promise — it is the shape of the engagement, not a guarantee. */}
              <p className="flex items-center gap-2 font-mono text-body-sm tracking-[var(--tracking-label)] text-white/75 uppercase">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-leaf" />
                {service.timeline}
              </p>
            </div>

            {/*
              The signature illustration — the `/services` intro treatment,
              now shared as `ServiceArt`. Each service carries its own asset
              from `services.ts`, cycling the five renders, so the ten detail
              mastheads are not the same picture ten times.

              Desktop only: at 1024 and below the text column needs the full
              width, and a shrunken sculpture beside a squeezed heading would
              cost the header more than it gave it.
            */}
            <div className="hidden shrink-0 desktop:flex desktop:flex-1 desktop:items-center desktop:justify-center">
              {/* Real client photo, not the abstract placeholder —
                  unfiltered, `fit="cover"` so it fills the box with no blank
                  margin, and `objectPosition` from the data so the crop
                  lands off the subject. The box itself moved from square to
                  4:3 (still not a full 16:9 match — this is also the canvas
                  the rotation and glow were tuned against) to shrink how
                  much `cover` needs to crop in the first place. */}
              <ServiceArt
                source={service.illustration}
                filtered={false}
                fit="cover"
                objectPosition={service.focalPoint}
                rounded
                alt={`${service.title} service thumbnail`}
                className="desktop:w-[clamp(320px,26vw,420px)] desktop:aspect-4/3"
                sizes="(min-width: 1200px) 26vw, 420px"
              />
            </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ---- problem -> what we build ------------------------------------ */}
      {/*
        A question and its answer, laid out as one movement rather than two
        columns that happen to be adjacent. Three things carry that reading:

          - the problem sits open on the ground with no panel around it, so it
            reads as the unresolved half;
          - the answer is a raised ink card — the page's darkest surface after
            the masthead, and the only one in the body — so the eye lands on the
            resolution, not on the complaint;
          - a connector runs between them, horizontal at desktop and vertical
            below it, ending in an arrowhead at the answer. It is the same
            hairline-plus-emerald device the roadmap uses, so the page has one
            connector language rather than two.

        The connector is positioned against the CARD's own box, not the grid
        row. Both blocks sit in a CSS grid, whose default align-items:stretch
        makes the "answer" card and the "problem" text always the same
        measured height — but the card's own content (label + copy + padding)
        does not reliably fill that stretched box, and the plain text side
        never does (it has no background to show the stretch at all).
        Centring on the stretched ROW put the arrow wherever the taller of the
        two blocks happened to end, which on a short "problem" paragraph
        landed well below the visible text — floating in blank space,
        touching neither element. `self-start` on the card's wrapper opts it
        out of the stretch, so the wrapper's height becomes the card's own
        true content height, and the arrow — positioned against THAT wrapper —
        always centres on the card, regardless of how long the problem text
        runs.
      */}
      <Band>
        <div className="grid gap-10 desktop:grid-cols-2 desktop:gap-24">
          <div className={BLOCK}>
            <SectionLabel>The problem</SectionLabel>
            {/*
              The lead is set in the display serif at heading size — the site's
              editorial voice, and the one place on the page where body copy is
              promoted to a heading treatment. It is the argument the rest of the
              page answers, so it earns the weight.
            */}
            <p className="display-plain max-w-[34ch] text-heading-sm text-ink">{service.problem}</p>
          </div>

          {/*
            Below desktop the connector is an ordinary grid child sitting between
            the two blocks, not an absolutely-positioned one. Absolute placement
            was measured from the grid's own height, and because the two blocks
            are different heights, "halfway down the grid" landed in the middle
            of the problem paragraph rather than in the gap between them. In
            flow, it is between them by definition at any height.
          */}
          <span aria-hidden="true" className="ml-5 flex h-10 desktop:hidden">
            <span className="relative block w-0.5 rounded-full bg-brand-emerald">
              <ConnectorArrowhead direction="down" className="absolute -bottom-1 -left-[3px]" />
            </span>
          </span>

          {/* `self-start`: see the note above the grid — this keeps the
              wrapper's height, and so the connector's centring, tied to the
              card's own content rather than to the grid's stretched row. */}
          <div className="relative self-start">
            {/* Desktop: horizontal, spanning the full 96px column gap edge to
                edge, anchored to and vertically centred on the card. */}
            <span
              aria-hidden="true"
              className="absolute top-1/2 right-full hidden h-0.5 w-24 -translate-y-1/2 rounded-full bg-hairline-strong desktop:block"
            >
              <span className="block size-full origin-right rounded-full bg-brand-emerald" />
              <ConnectorArrowhead
                direction="right"
                className="absolute top-1/2 -right-1 -translate-y-1/2"
              />
            </span>

            <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-ink p-6 shadow-card tablet:p-8">
              <div className="flex flex-col gap-6">
                <p className="flex items-center gap-2 font-mono text-body-sm tracking-[var(--tracking-label)] text-brand-leaf uppercase">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-emerald" />
                  What we build
                </p>
                <p className="max-w-[52ch] text-body-lg text-white/80">{service.build}</p>
              </div>
            </div>
          </div>
        </div>
      </Band>

      {/* ---- execution roadmap ------------------------------------------- */}
      {/* Cards need a ground to sit on: the roadmap, team, workflow and outcome
          cards are all `bg-surface`, so their bands are warm or emerald-washed
          and never white. The two sections WITHOUT cards — the stack chips and
          the deliverables list — are the ones that take the white panel. */}
      <Band tone="wash">
        <div className={BLOCK}>
          <SectionLabel>Execution roadmap</SectionLabel>
          <RoadmapTimeline phases={service.roadmap} />
        </div>
      </Band>

      {/* ---- your team --------------------------------------------------- */}
      <Band>
        <div className={BLOCK}>
          <SectionLabel>Your team</SectionLabel>
          <TeamRoles team={service.team} />
        </div>
      </Band>

      {/* ---- technology stack -------------------------------------------- */}
      <Band tone="panel">
        <div className={BLOCK}>
          <SectionLabel>Technology stack</SectionLabel>
          <StackGroups stack={service.stack} />
        </div>
      </Band>

      {/* ---- the shared method ------------------------------------------- */}
      <Band>
        <div className={BLOCK}>
          <SectionLabel>AI + human workflow</SectionLabel>
          <AiHumanWorkflow />
        </div>
      </Band>

      {/* ---- what you receive -------------------------------------------- */}
      <Band tone="panel">
        <div className={BLOCK}>
          <SectionLabel>What you receive</SectionLabel>
          <DeliverablesList items={service.deliverables} />
        </div>
      </Band>

      {/* ---- expected outcomes ------------------------------------------- */}
      {service.outcomes && service.outcomes.length > 0 && (
        <Band>
          <div className={BLOCK}>
            <SectionLabel>Expected outcomes</SectionLabel>
            <OutcomeChart outcomes={service.outcomes} />
          </div>
        </Band>
      )}

      {/* ---- ongoing support + CTA --------------------------------------- */}
      <Band>
        {/*
          The conversion point, and the second of the page's two emphatic
          surfaces. Ink rather than forest so it reads as a close rather than a
          repeat of the masthead.

          It now carries the masthead's illustration at the masthead's scale and
          with the masthead's motion — the same `ServiceArt`, idle drift, glow
          and hover included. It previously held a 420px copy at 18% opacity
          pushed off the corner, which read as a watermark next to a hero that
          had a real object in it; the page's last screen should not be quieter
          than its first.

          `Reveal` gives the whole panel one entrance on scroll. It is the last
          thing a visitor sees before deciding whether to act, so it arrives
          rather than being already there.
        */}
        <Reveal>
          <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-ink p-8 shadow-card tablet:p-12">
            <div className="flex items-center gap-16 desktop:gap-24">
              <div className="relative flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <p className="flex items-center gap-2 font-mono text-body-sm tracking-[var(--tracking-label)] text-brand-leaf uppercase">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-emerald" />
                    Ongoing support
                  </p>
                  <p className="max-w-[62ch] text-body-lg text-white/70">{service.support}</p>
                </div>

                <div className="flex flex-col gap-6">
                  <p className="max-w-[18ch] text-heading-lg text-white opsz-56">
                    Ready when you are.
                  </p>

                  {/*
                    Both actions are buttons. A text-link treatment was tried
                    here and read as a bare arrow with no visible surface — a
                    link, not a second action — beside a solid primary pill.
                    `tone="light"` is the site's own secondary-button pattern
                    (the service cards' "View roadmap", `/services`'s own "All
                    services") and restoring it is what makes this read as two
                    real actions rather than one button and some loose text.
                  */}
                  <div className="flex flex-wrap gap-3">
                    {/* The same dialog every other CTA on the site opens — not a
                        second contact mechanism. `/contact` still works. */}
                    <ContactButton size="lg" tone="brand">
                      Start with {service.title}
                    </ContactButton>
                    <Button href="/services" tone="light" size="lg">
                      All services
                    </Button>
                  </div>
                </div>
              </div>

              {/* Desktop only, matching the masthead: below 1200 the copy needs
                  the full width and a shrunken sculpture would cost more than
                  it gave. */}
              <div className="hidden shrink-0 desktop:flex desktop:flex-1 desktop:items-center desktop:justify-center">
                <ServiceArt
                  source={service.illustration}
                  filtered={false}
                  fit="cover"
                  objectPosition={service.focalPoint}
                  rounded
                  alt={`${service.title} service thumbnail`}
                  className="desktop:w-[clamp(320px,26vw,420px)] desktop:aspect-4/3"
                  sizes="(min-width: 1200px) 26vw, 420px"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </Band>
    </PageShell>
  );
}
