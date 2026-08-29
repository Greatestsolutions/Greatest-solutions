import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/layout/Section";
import { services } from "@/data/services";
import { site } from "@/config/site";
import {
  solutions,
  solutionsDescription,
  solutionsEyebrow,
  solutionsTitle,
} from "@/data/solutions";

export const metadata: Metadata = {
  title: "Solutions",
  description: solutionsDescription,
  alternates: { canonical: "/solutions" },
};

/**
 * Solutions.
 *
 * Data-driven from `data/solutions.ts` — adding or reframing a category is a data
 * edit. Built from the existing design system (`Section`, `PageHeader`, `Pill`,
 * `Button`) rather than new visual language, so it belongs to the site without a
 * redesign.
 *
 * Each card links through to the service that most often covers that problem,
 * which is what keeps Solutions and Services from reading as duplicates.
 */
export default function SolutionsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow={solutionsEyebrow}
        title={solutionsTitle}
        description={solutionsDescription}
      />

      <Section spacing="compact">
        <ul className="grid gap-6 tablet:grid-cols-2">
          {solutions.map((solution) => {
            const service = services.find((s) => s.slug === solution.service);
            return (
              <li
                key={solution.slug}
                className="flex flex-col gap-5 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-8"
              >
                <h2 className="text-heading-sm text-ink">{solution.title}</h2>
                <p className="text-body-lg text-body">{solution.description}</p>

                <ul className="flex flex-wrap gap-2">
                  {solution.examples.map((example) => (
                    <li key={example}>
                      <Pill>{example}</Pill>
                    </li>
                  ))}
                </ul>

                {service && (
                  <Link
                    href={`/services/${service.slug}`}
                    className="mt-auto text-body-md font-medium text-ink underline-offset-4 transition-colors duration-[var(--duration-quick)] hover:underline"
                  >
                    {service.title} &rarr;
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Section>

      <Section spacing="compact">
        <div className="flex flex-wrap gap-3">
          <Button href={`mailto:${site.email}?subject=Project%20enquiry`} size="lg">
            Start a project
          </Button>
          <Button href="/services" tone="light" size="lg">
            See our services
          </Button>
        </div>
      </Section>
    </PageShell>
  );
}
