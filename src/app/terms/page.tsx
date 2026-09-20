import type { Metadata } from "next";
import Link from "next/link";
import { LegalPlaceholder } from "@/components/legal/LegalPlaceholder";
import { LegalSection } from "@/components/legal/LegalSection";
import { TableOfContents } from "@/components/legal/TableOfContents";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Section } from "@/components/layout/Section";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Greatest Solutions: how this website and our services may be used.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "September 20, 2026";

const sections = [
  { id: "agreement-to-terms", label: "Agreement to Terms" },
  { id: "our-services", label: "Our Services" },
  { id: "use-of-this-website", label: "Use of This Website" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "client-engagements", label: "Client Engagements" },
  { id: "payment", label: "Payment" },
  { id: "no-guaranteed-results", label: "No Guaranteed Results" },
  { id: "disclaimer-of-warranties", label: "Disclaimer of Warranties" },
  { id: "limitation-of-liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "third-party-links-and-services", label: "Third-Party Links and Services" },
  { id: "termination", label: "Termination" },
  { id: "governing-law-and-disputes", label: "Governing Law and Disputes" },
  { id: "changes-to-these-terms", label: "Changes to These Terms" },
  { id: "contact-us", label: "Contact Us" },
];

/**
 * Terms of Service.
 *
 * A starting draft written for this specific business, not a generic
 * template — grounded in what's actually established about this site
 * (`services.ts`'s real ten services, the enquiry-form-only contact flow, no
 * e-commerce/checkout, no user accounts), following the same non-fabrication
 * discipline the rest of this project uses: no invented business
 * registration details, no invented jurisdiction, no invented compliance
 * claims. **This is not legal advice and has not been reviewed by a
 * lawyer.** One section below carries a visible `LegalPlaceholder` rather
 * than a guessed value — governing law/jurisdiction — see the task report
 * for why it's unresolved and what the site owner needs to decide.
 *
 * Unlike `/privacy`, this document is mostly general contractual boilerplate
 * rather than something Step 1's codebase investigation could confirm or
 * correct line by line — Section 5 ("Client Engagements") is the one place
 * that does reflect a confirmed fact: reaching out via the enquiry form or
 * "Book a call" (which opens the same contact dialog — there is no separate
 * external scheduling tool) does not itself create a binding agreement,
 * because neither actually transmits anything to Greatest Solutions without
 * the visitor separately sending the resulting email themselves.
 */
export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        description={`Last updated: ${LAST_UPDATED}`}
      />

      <Section spacing="compact">
        <div className="flex flex-col gap-12">
          <div className="rounded-[var(--radius-lg)] border border-dashed border-amber-400 bg-amber-50 p-6 text-body-md text-amber-900 tablet:p-8">
            This page is a starting draft, written for this business but{" "}
            <strong className="font-medium">not legal advice and not yet reviewed by a lawyer</strong>. It
            should be reviewed, especially the section marked{" "}
            <LegalPlaceholder>[to be confirmed]</LegalPlaceholder> below, before being relied on, particularly
            given this business may serve clients in more than one country.
          </div>

          <TableOfContents items={sections} />

          <div className="flex flex-col gap-10 tablet:gap-12">
            <LegalSection id="agreement-to-terms" number={1} title="Agreement to Terms">
              <p>
                These Terms of Service (&ldquo;Terms&rdquo;) govern your use of this website and any services
                provided by Greatest Solutions (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By
                accessing this website or engaging our services, you agree to these Terms. If you do not agree,
                please do not use this website or our services.
              </p>
            </LegalSection>

            <LegalSection id="our-services" number={2} title="Our Services">
              <p>
                Greatest Solutions provides AI-powered agency services, including but not limited to: AI voice
                agents, vertical automation, AI lead generation, AI content and social media production, AI
                video/UGC content, AI copywriting and sales pages, AI SEO content, web development, AI email and
                brand assets, and pitch decks. Specific service scope, deliverables, timelines, and pricing for
                any project are agreed separately with each client and are not established by this website alone.
                The service descriptions on this site are informational, not a binding offer for a specific
                project.
              </p>
            </LegalSection>

            <LegalSection id="use-of-this-website" number={3} title="Use of This Website">
              <p>You may use this website for lawful purposes only. You agree not to:</p>
              <BulletList
                items={[
                  "Use this website in any way that violates applicable laws or regulations",
                  "Attempt to gain unauthorized access to any part of this website or its underlying systems",
                  "Copy, scrape, or reproduce the content of this website for commercial purposes without our permission",
                  "Interfere with or disrupt the operation of this website",
                ]}
              />
            </LegalSection>

            <LegalSection id="intellectual-property" number={4} title="Intellectual Property">
              <p>
                All content on this website (including text, graphics, logos, illustrations, and design) is
                owned by Greatest Solutions or used with permission, and is protected by applicable intellectual
                property laws, unless otherwise noted. Portfolio/work examples shown on this website remain
                subject to any rights held by the original client or project owner, where applicable.
              </p>
              <p>
                You may not reproduce, distribute, or create derivative works from this website&apos;s content
                without our prior written consent.
              </p>
            </LegalSection>

            <LegalSection id="client-engagements" number={5} title="Client Engagements">
              <p>
                Reaching out through our enquiry form, booking a call, or otherwise inquiring about our services
                does not, on its own, create a binding service agreement. A project engagement begins only once
                both parties agree on scope, deliverables, timeline, and pricing, typically documented in a
                separate proposal, agreement, or invoice specific to that project. These Terms apply to your
                general use of this website; the specific terms of any project you engage us for are governed by
                that project&apos;s own agreement.
              </p>
            </LegalSection>

            <LegalSection id="payment" number={6} title="Payment">
              <p>
                Payment terms (amounts, schedule, and method) are agreed on a per-project basis and outlined in
                the relevant project proposal, agreement, or invoice, not by this website. Any pricing shown on
                this website is indicative only, unless explicitly stated otherwise in a specific written
                agreement with you.
              </p>
            </LegalSection>

            <LegalSection id="no-guaranteed-results" number={7} title="No Guaranteed Results">
              <p>
                While we bring genuine expertise and care to every project, we do not guarantee specific business
                outcomes (such as sales, lead volume, rankings, or engagement figures) from any service, as these
                depend on factors outside our control. Any performance expectations for a specific project should
                be discussed and documented as part of that project&apos;s own agreement.
              </p>
            </LegalSection>

            <LegalSection id="disclaimer-of-warranties" number={8} title="Disclaimer of Warranties">
              <p>
                This website and its content are provided &ldquo;as is&rdquo; without warranties of any kind,
                either express or implied, including but not limited to warranties of merchantability, fitness
                for a particular purpose, or non-infringement. We do not warrant that this website will be
                error-free, uninterrupted, or free of harmful components.
              </p>
            </LegalSection>

            <LegalSection id="limitation-of-liability" number={9} title="Limitation of Liability">
              <p>
                To the maximum extent permitted by law, Greatest Solutions shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages arising from your use of this website or
                our services. Our total liability for any claim arising from a specific project is limited to the
                amount you paid us for that project, as further defined in that project&apos;s own agreement.
                This website&apos;s Terms do not set project-specific liability caps beyond this general
                limitation.
              </p>
            </LegalSection>

            <LegalSection id="indemnification" number={10} title="Indemnification">
              <p>
                You agree to indemnify and hold Greatest Solutions harmless from any claims, damages, or expenses
                arising from your misuse of this website or violation of these Terms.
              </p>
            </LegalSection>

            <LegalSection id="third-party-links-and-services" number={11} title="Third-Party Links and Services">
              <p>
                This website may link to third-party websites or services (including our social media accounts).
                We are not responsible for the content, accuracy, or practices of any third-party site, and
                linking to it does not imply endorsement.
              </p>
            </LegalSection>

            <LegalSection id="termination" number={12} title="Termination">
              <p>
                We reserve the right to restrict or terminate your access to this website at our discretion, for
                any conduct that we believe violates these Terms or is otherwise harmful to us or other users.
              </p>
            </LegalSection>

            <LegalSection id="governing-law-and-disputes" number={13} title="Governing Law and Disputes">
              <p>
                These Terms are governed by the laws of{" "}
                <LegalPlaceholder>[Governing Law / Jurisdiction: to be confirmed by the business owner]</LegalPlaceholder>.
                Any disputes arising from these Terms or your use of this website will first be addressed through
                good-faith direct communication between the parties before any formal proceedings.
              </p>
            </LegalSection>

            <LegalSection id="changes-to-these-terms" number={14} title="Changes to These Terms">
              <p>
                We may revise these Terms from time to time. Changes will be posted on this page with an updated
                &ldquo;Last updated&rdquo; date. Continued use of this website after changes are posted
                constitutes acceptance of the revised Terms.
              </p>
            </LegalSection>

            <LegalSection id="contact-us" number={15} title="Contact Us">
              <p>Questions about these Terms can be sent to:</p>
              <p>
                Email:{" "}
                <a href={`mailto:${site.email}`} className="text-ink underline-offset-4 hover:underline">
                  {site.email}
                </a>
              </p>
              <p>
                See also our{" "}
                <Link href="/privacy" className="text-ink underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </LegalSection>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true" className="mt-2.5 size-1 shrink-0 rounded-full bg-brand-emerald/50" />
          {item}
        </li>
      ))}
    </ul>
  );
}
