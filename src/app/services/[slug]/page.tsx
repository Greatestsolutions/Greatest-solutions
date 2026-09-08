import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AiHumanWorkflow } from "@/components/services/AiHumanWorkflow";
import { Button } from "@/components/ui/Button";
import { ContactButton } from "@/components/contact/ContactButton";
import { DeliverablesList } from "@/components/services/DeliverablesList";
import { EmeraldFilter } from "@/components/services/EmeraldFilter";
import { OutcomeChart } from "@/components/services/OutcomeChart";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Picture } from "@/components/ui/Picture";
import { Pill } from "@/components/ui/Pill";
import { RoadmapTimeline } from "@/components/services/RoadmapTimeline";
import { Section } from "@/components/layout/Section";
import { SectionLabel } from "@/components/services/SectionLabel";
import { StackGroups } from "@/components/services/StackGroups";
import { TeamRoles } from "@/components/services/TeamRoles";
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
 * Service detail, driven entirely by `data/services.ts`. Adding a service is a
 * data edit — no new component or route file is required.
 *
 * Each service stays its own statically generated route, in the sitemap and
 * separately shareable. The reference document presents the same content as one
 * page with a dropdown that swaps sections in JavaScript; adopting that would
 * have collapsed ten indexable URLs into one for no gain.
 *
 * The content is the reference's; none of its presentation is. That document is
 * dark ink with gold accents in Space Grotesk, and this page is built from the
 * same tokens as the rest of the site.
 *
 * ## Where the client boundary sits
 *
 * This page is a Server Component and stays one. The five sections that animate
 * on scroll are their own client components taking plain data, so what ships to
 * the browser is those five and nothing else — not the copy, not the layout, not
 * the CTA block. Every hover state here is a CSS transition rather than a motion
 * value, which is also why they survive `prefers-reduced-motion`: a response to
 * a deliberate action is not the kind of motion that setting is asking to remove.
 */
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <PageShell>
      {/* The emerald ramp the CTA artwork is painted through. Rendered once. */}
      <EmeraldFilter />

      {/*
        Scroll reveals are `whileInView`, which means motion renders their hidden
        frame server-side: five of this page's sections ship as
        `opacity: 0.001` and are raised by JS once they scroll in. The copy is in
        the HTML either way — crawlers and readers get the full document — but if
        the bundle fails or is blocked, a visitor would be looking at a mostly
        blank page.

        This restores them, and only ever applies when scripting is off, so the
        animated path is untouched. `!important` is required and not laziness:
        motion writes the hidden state as an inline style, which no ordinary
        stylesheet rule can outrank.
      */}
      <noscript>
        <style>{`[style*="opacity:0.001"]{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <PageHeader eyebrow="Service" title={service.title} description={service.description}>
        <div className="flex flex-col gap-4">
          <ul className="flex flex-wrap gap-2">
            {service.tags.map((tag) => (
              <li key={tag}>
                <Pill>{tag}</Pill>
              </li>
            ))}
          </ul>
          {/* The one number in the header. Stated plainly rather than as a
              promise — it is the shape of the engagement, not a guarantee. */}
          <p className="flex items-center gap-2 font-mono text-body-sm tracking-[var(--tracking-label)] text-brand-green uppercase">
            <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-emerald" />
            {service.timeline}
          </p>
        </div>
      </PageHeader>

      {/* ---- problem + what we build ------------------------------------- */}
      <Section spacing="compact">
        <div className="grid gap-6 desktop:grid-cols-2 desktop:gap-8">
          {/*
            The two halves of the pitch, side by side so the second reads as the
            answer to the first. The problem sits on the plain ground and the
            solution on a raised card with an emerald edge — the visual weight
            follows the meaning rather than splitting evenly between them.
          */}
          <div className="flex flex-col gap-4">
            <SectionLabel>The problem</SectionLabel>
            <p className="max-w-[60ch] text-body-lg text-body">{service.problem}</p>
          </div>

          <div className="relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-black/8 bg-surface p-6 shadow-float tablet:p-8">
            <span
              aria-hidden="true"
              className="absolute inset-y-0 left-0 w-0.5 bg-brand-emerald"
            />
            <SectionLabel>What we build</SectionLabel>
            <p className="max-w-[60ch] text-body-lg text-ink">{service.build}</p>
          </div>
        </div>
      </Section>

      {/* ---- execution roadmap ------------------------------------------- */}
      <Section spacing="compact">
        <div className="flex flex-col gap-8">
          <SectionLabel>Execution roadmap</SectionLabel>
          <RoadmapTimeline phases={service.roadmap} />
        </div>
      </Section>

      {/* ---- your team --------------------------------------------------- */}
      <Section spacing="compact">
        <div className="flex flex-col gap-6">
          <SectionLabel>Your team</SectionLabel>
          <TeamRoles team={service.team} />
        </div>
      </Section>

      {/* ---- technology stack -------------------------------------------- */}
      <Section spacing="compact">
        <div className="flex flex-col gap-6">
          <SectionLabel>Technology stack</SectionLabel>
          <StackGroups stack={service.stack} />
        </div>
      </Section>

      {/* ---- the shared method ------------------------------------------- */}
      <AiHumanWorkflow />

      {/* ---- what you receive -------------------------------------------- */}
      <Section spacing="compact">
        <div className="flex flex-col gap-6">
          <SectionLabel>What you receive</SectionLabel>
          <DeliverablesList items={service.deliverables} />
        </div>
      </Section>

      {/* ---- expected outcomes ------------------------------------------- */}
      {service.outcomes && service.outcomes.length > 0 && (
        <Section spacing="compact">
          <div className="flex flex-col gap-6">
            <SectionLabel>Expected outcomes</SectionLabel>
            <OutcomeChart outcomes={service.outcomes} />
          </div>
        </Section>
      )}

      {/* ---- ongoing support + CTA --------------------------------------- */}
      <Section spacing="compact">
        {/*
          The page's conversion point, and the only block given real weight: a
          raised card with the service's own illustration bleeding off the right
          edge under the emerald ramp.

          That artwork is the abstract render already used for this service in
          the carousel and the cards — reused rather than newly sourced, and
          abstract precisely so it cannot be mistaken for a screenshot of client
          work. It is decorative, so it is `aria-hidden` with an empty `alt` and
          sits behind the content rather than beside it.
        */}
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-black/8 bg-surface p-6 shadow-float tablet:p-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-24 hidden size-[420px] opacity-[0.18] tablet:block"
            style={{ filter: "url(#gst-emerald)" }}
          >
            <Picture
              source={service.illustration}
              alt=""
              width={1360}
              height={1360}
              sizes="420px"
              className="size-full object-contain"
            />
          </div>

          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <SectionLabel>Ongoing support</SectionLabel>
              <p className="max-w-[62ch] text-body-lg text-body">{service.support}</p>
            </div>

            <div className="flex flex-col gap-5">
              <p className="max-w-[24ch] font-display text-heading-sm leading-[1.1] tracking-[-0.02em] text-ink opsz-32">
                Ready when you are.
              </p>
              <div className="flex flex-wrap gap-3">
                {/* The same dialog every other CTA on the site opens — not a
                    second contact mechanism. `/contact` still works directly. */}
                <ContactButton size="lg">Start with {service.title}</ContactButton>
                <Button href="/services" tone="light" size="lg">
                  All services
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
