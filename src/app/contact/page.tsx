import type { Metadata } from "next";
import { CopyEmail } from "@/components/hero/CopyEmail";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Section } from "@/components/layout/Section";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Start a project with ${site.name}. Email ${site.email}.`,
  alternates: { canonical: "/contact" },
};

/**
 * Contact.
 *
 * Laid out after the project's own `index1.html` Greatest Solutions reference:
 * an intro column stating what to send and what happens next, beside a form card.
 * That reference also listed a phone number and an Instagram handle — both
 * omitted here, because neither exists for Greatest Solutions and a placeholder
 * `+1 (000) 000-0000` on a live contact page is worse than no phone number.
 *
 * Email is the one channel that genuinely works, so it is given directly, with
 * the hero's {@link CopyEmail} reused rather than duplicated.
 */
export default function ContactPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Contact"
        title="Tell us what you are building"
        description="Send us the shape of the problem: timeline, stack, what it has to work with. We'll reply with how we'd approach it."
      />

      <Section spacing="compact">
        <div className="grid gap-10 desktop:grid-cols-[380px_1fr] desktop:gap-16">
          {/* ---- intro column ---------------------------------------------- */}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
                Email
              </h2>
              <a
                href={`mailto:${site.email}`}
                className="text-heading-sm break-all text-ink underline-offset-4 transition-colors duration-[var(--duration-quick)] hover:underline"
              >
                {site.email}
              </a>
              <CopyEmail />
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
                What to expect
              </h2>
              <ul className="flex flex-col gap-2 text-body-lg text-body">
                <li>We read every enquiry ourselves: no intake form routing.</li>
                <li>You get a reply with how we would approach it, not a brochure.</li>
                <li>If we are not the right fit, we will say so.</li>
              </ul>
            </div>
          </div>

          {/* ---- form card -------------------------------------------------- */}
          <EnquiryForm />
        </div>
      </Section>
    </PageShell>
  );
}
