import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { AiHumanWorkflow } from "@/components/services/AiHumanWorkflow";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/layout/Container";
import { ContactButton } from "@/components/contact/ContactButton";
import { DeliverablesList } from "@/components/services/DeliverablesList";
import { EmeraldFilter } from "@/components/services/EmeraldFilter";
import { OutcomeChart } from "@/components/services/OutcomeChart";
import { PageShell } from "@/components/layout/PageShell";
import { Picture } from "@/components/ui/Picture";
import { RoadmapTimeline } from "@/components/services/RoadmapTimeline";
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
      {/* The emerald ramp the masthead and CTA artwork are painted through. */}
      <EmeraldFilter />

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
      <section className="relative overflow-hidden bg-brand-forest pt-[136px] pb-14 desktop:pt-[184px] desktop:pb-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-32 hidden size-[560px] opacity-25 tablet:block"
          style={{ filter: "url(#gst-emerald)" }}
        >
          <Picture
            source={service.illustration}
            alt=""
            width={1360}
            height={1360}
            sizes="560px"
            className="size-full object-contain"
          />
        </div>

        <Container>
          <div className="relative flex max-w-[640px] flex-col items-start gap-5">
            {/*
              The eyebrow geometry of `Pill size="eyebrow"` — 28px tall, mono 12,
              label tracking, leading dot — restated for a dark ground rather
              than passing a className to the component. `cn` is a plain joiner
              with no conflict resolution, so a `bg-*` override would race the
              component's own tone in the stylesheet and win or lose by rule
              order. This is the one on-dark instance on the site; if a second
              appears, `Pill` should gain a real `onDark` tone instead.
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
        </Container>
      </section>

      {/* ---- problem + what we build ------------------------------------- */}
      <Band>
        <div className="grid gap-6 desktop:grid-cols-2 desktop:gap-10">
          <div className={BLOCK}>
            <SectionLabel>The problem</SectionLabel>
            {/*
              The lead paragraph is set in the display serif at heading size —
              the site's own editorial voice, and the one place on the page where
              body copy is promoted to a heading treatment. It is the argument
              the rest of the page answers, so it earns the weight.
            */}
            <p className="max-w-[34ch] text-heading-sm text-ink opsz-32">{service.problem}</p>
          </div>

          <div className="relative flex flex-col gap-6 overflow-hidden rounded-[var(--radius-lg)] bg-surface p-6 shadow-card tablet:p-8">
            <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-brand-emerald" />
            <SectionLabel>What we build</SectionLabel>
            <p className="max-w-[52ch] text-body-lg text-body">{service.build}</p>
          </div>
        </div>
      </Band>

      {/* ---- execution roadmap ------------------------------------------- */}
      <Band tone="panel">
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
      <Band tone="wash">
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
        */}
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-ink p-8 shadow-card tablet:p-12">
          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <p className="font-mono text-body-sm tracking-[var(--tracking-label)] text-brand-leaf uppercase">
                Ongoing support
              </p>
              <p className="max-w-[62ch] text-body-lg text-white/70">{service.support}</p>
            </div>

            <div className="flex flex-col gap-6">
              <p className="max-w-[18ch] text-heading-lg text-white opsz-56">Ready when you are.</p>
              <div className="flex flex-wrap gap-3">
                {/* The same dialog every other CTA on the site opens — not a
                    second contact mechanism. `/contact` still works directly. */}
                {/* Brand gradient as the primary against ink — `dark` would be
                    ink on ink. `light` is the secondary, as everywhere else. */}
                <ContactButton size="lg" tone="brand">
                  Start with {service.title}
                </ContactButton>
                <Button href="/services" tone="light" size="lg">
                  All services
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Band>
    </PageShell>
  );
}
