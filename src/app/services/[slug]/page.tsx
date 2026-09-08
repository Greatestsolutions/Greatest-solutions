import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AiHumanWorkflow } from "@/components/services/AiHumanWorkflow";
import { Button } from "@/components/ui/Button";
import { ContactButton } from "@/components/contact/ContactButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/layout/Section";
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
 * page with a dropdown that swaps sections via JavaScript; adopting that would
 * have collapsed ten indexable URLs into one and thrown away routing that
 * already works, for no gain.
 *
 * The content is the reference's; none of its presentation is. That document is
 * dark ink with gold accents in Space Grotesk, and this page is built from the
 * same tokens as the rest of the site — the editorial serif for the display
 * heading, `bg-surface` cards on the warm ground, hairline borders, emerald for
 * the one accent that carries meaning.
 *
 * This is a content and structure pass. Imagery, motion and iconography are a
 * separate concern and deliberately absent.
 */
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <PageShell>
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
          <p className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
            {service.timeline}
          </p>
        </div>
      </PageHeader>

      {/* ---- problem + what we build ------------------------------------- */}
      <Section spacing="compact">
        <div className="grid gap-6 desktop:grid-cols-2 desktop:gap-8">
          {/*
            The two halves of the pitch, side by side on desktop so the second
            reads as the answer to the first. The problem sits on the plain
            ground and the solution on a surface card — the visual weight follows
            the meaning rather than being split evenly.
          */}
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
              The problem
            </h2>
            <p className="max-w-[60ch] text-body-lg text-body">{service.problem}</p>
          </div>

          <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-6 tablet:p-8">
            <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
              What we build
            </h2>
            <p className="max-w-[60ch] text-body-lg text-ink">{service.build}</p>
          </div>
        </div>
      </Section>

      {/* ---- execution roadmap ------------------------------------------- */}
      <Section spacing="compact">
        <div className="flex flex-col gap-6">
          <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
            Execution roadmap
          </h2>
          {/*
            An ordered list: these are phases in sequence. The number comes from
            position, so a service with four or six phases needs no other change
            — nothing here assumes five.
          */}
          <ol className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
            {service.roadmap.map((phase, i) => (
              <li
                key={phase.name}
                className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-5"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="font-mono text-body-sm text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-mono text-body-sm text-brand-green">{phase.days}</span>
                </div>
                <h3 className="text-body-lg font-medium text-ink">{phase.name}</h3>
                <ul className="flex flex-col gap-1.5">
                  {phase.items.map((item) => (
                    <li key={item} className="flex gap-2 text-body-md text-body">
                      <span aria-hidden="true" className="text-brand-emerald">
                        &middot;
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* ---- your team --------------------------------------------------- */}
      <Section spacing="compact">
        <div className="flex flex-col gap-6">
          <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
            Your team
          </h2>
          <ul className="grid gap-3 tablet:grid-cols-2 desktop:grid-cols-3">
            {service.team.map((member) => (
              <li
                key={member.role}
                className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-5"
              >
                {/* A monogram, not a photograph — these are roles on an
                    engagement, not named individuals, and a stock headshot
                    would imply a specific person who does not exist. */}
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-emerald/12 font-mono text-body-sm text-brand-green"
                >
                  {member.initials}
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-body-lg font-medium text-ink">{member.role}</h3>
                  <p className="text-body-md text-body">{member.focus}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---- technology stack -------------------------------------------- */}
      <Section spacing="compact">
        <div className="flex flex-col gap-6">
          <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
            Technology stack
          </h2>
          <dl className="grid gap-6 tablet:grid-cols-2 desktop:grid-cols-4">
            {service.stack.map((group) => (
              <div key={group.category} className="flex flex-col gap-3">
                <dt className="text-body-md font-medium text-ink">{group.category}</dt>
                <dd>
                  <ul className="flex flex-wrap gap-2">
                    {group.tools.map((tool) => (
                      <li key={tool}>
                        <Pill>{tool}</Pill>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Section>

      {/* ---- the shared method ------------------------------------------- */}
      <AiHumanWorkflow />

      {/* ---- what you receive -------------------------------------------- */}
      <Section spacing="compact">
        <div className="flex flex-col gap-6">
          <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
            What you receive
          </h2>
          <ul className="grid gap-x-8 gap-y-3 tablet:grid-cols-2">
            {service.deliverables.map((item) => (
              <li key={item} className="flex items-start gap-3 text-body-lg text-body">
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* ---- expected outcomes ------------------------------------------- */}
      {service.outcomes && service.outcomes.length > 0 && (
        <Section spacing="compact">
          <div className="flex flex-col gap-6">
            <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
              Expected outcomes
            </h2>
            <ul className="grid gap-4 tablet:grid-cols-2">
              {service.outcomes.map((outcome) => (
                <li
                  key={outcome.label}
                  className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-6"
                >
                  <h3 className="text-body-lg font-medium text-ink">{outcome.label}</h3>
                  {/*
                    Both figures are shown as bars on the same scale, and neither
                    is labelled "better". Direction is not universal here —
                    "missed calls" falling is an improvement and "after-hours
                    response" rising is too — so the page states the two numbers
                    and lets the label carry the meaning, rather than drawing an
                    arrow that would be wrong half the time.
                  */}
                  <OutcomeBar label="Before" value={outcome.before} tone="muted" />
                  <OutcomeBar label="After" value={outcome.after} tone="brand" />
                </li>
              ))}
            </ul>
          </div>
        </Section>
      )}

      {/* ---- ongoing support + CTA --------------------------------------- */}
      <Section spacing="compact">
        <div className="flex flex-col gap-8 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-6 tablet:p-10">
          <div className="flex flex-col gap-4">
            <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
              Ongoing support
            </h2>
            <p className="max-w-[70ch] text-body-lg text-body">{service.support}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {/* The same dialog every other CTA on the site opens — not a second
                contact mechanism. `/contact` still works on a direct visit. */}
            <ContactButton size="lg">Start with {service.title}</ContactButton>
            <Button href="/services" tone="light" size="lg">
              All services
            </Button>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}

/**
 * One half of a before/after pair.
 *
 * The value is a percentage, so it maps to the bar width directly. `aria-hidden`
 * on the bar and the number in real text beside it: the graphic restates what the
 * text already says, so exposing both would read the figure twice.
 */
function OutcomeBar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "muted" | "brand";
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
          {label}
        </span>
        <span className="text-body-md font-medium text-ink">{value}%</span>
      </div>
      <div aria-hidden="true" className="h-2 w-full overflow-hidden rounded-full bg-scrim-06">
        <div
          style={{ width: `${value}%` }}
          className={
            tone === "brand"
              ? "h-full rounded-full bg-brand-emerald"
              : "h-full rounded-full bg-black/20"
          }
        />
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className="mt-1.5 size-3.5 shrink-0 text-brand-emerald"
    >
      <path
        d="M3 8.5l3 3 7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
