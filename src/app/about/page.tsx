import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Section } from "@/components/layout/Section";

export const metadata: Metadata = {
  title: "About",
  description: "About Greatest Solutions, a software development and technology services agency.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="About"
        title="A software and technology team"
        description="Greatest Solutions builds web platforms, products and digital systems for teams that need them to work."
      />
      {/*
        Positioning, approach and capabilities only. No founding year, founders,
        team size, locations, client counts or years of experience appear here,
        because none of that is established — and a plausible-sounding history is
        still a fabricated one.
      */}
      <Section spacing="compact">
        <div className="grid gap-10 tablet:grid-cols-2 tablet:gap-14">
          {[
            {
              heading: "What we do",
              body: "We build web platforms, custom software, and web applications — from a first release through to the ongoing work of keeping it running. Design and engineering sit in the same team rather than being handed between them.",
            },
            {
              heading: "How we work",
              body: "We scope before we build, work in reviewable increments, and hand over with documentation. You see progress throughout, and you own what we deliver.",
            },
            {
              heading: "What we care about",
              body: "Software that stays maintainable after launch: accessible interfaces, sensible architecture, and performance treated as a requirement rather than a later optimisation.",
            },
            {
              heading: "Working together",
              body: "Engagements run as a scoped project, an ongoing partnership, or a support arrangement for something already in production. Which one fits depends on the problem.",
            },
          ].map((block) => (
            <div key={block.heading} className="flex flex-col gap-4">
              <h2 className="text-heading-sm text-ink">{block.heading}</h2>
              <p className="max-w-[52ch] text-body-lg text-body">{block.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}
