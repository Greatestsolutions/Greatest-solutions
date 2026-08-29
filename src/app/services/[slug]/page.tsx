import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { PendingContent } from "@/components/layout/PendingContent";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/layout/Section";
import { services } from "@/data/services";
import { site } from "@/config/site";

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
 * data edit — no new component or route file is required, which is the
 * data-driven structure Task 4.4 asked for.
 */
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = services.find((s) => s.slug === slug);
  if (!service) notFound();

  return (
    <PageShell>
      <PageHeader eyebrow="Service" title={service.title} description={service.description}>
        <ul className="flex flex-wrap gap-2">
          {service.tags.map((tag) => (
            <li key={tag}>
              <Pill>{tag}</Pill>
            </li>
          ))}
        </ul>
      </PageHeader>

      <PendingContent what={`A detailed breakdown of ${service.title}`} />

      <Section spacing="compact">
        <div className="flex flex-wrap gap-3">
          <Button href={`mailto:${site.email}?subject=${encodeURIComponent(service.title)}`} size="lg">
            Enquire about {service.title}
          </Button>
          <Button href="/services" tone="light" size="lg">
            All services
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
