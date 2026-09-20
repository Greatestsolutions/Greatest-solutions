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
  title: "Privacy Policy",
  description: "Privacy policy for Greatest Solutions: what we collect through this website, how we use it, and your choices.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "September 20, 2026";

const sections = [
  { id: "introduction", label: "Introduction" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "how-we-use-your-information", label: "How We Use Your Information" },
  { id: "how-we-share-your-information", label: "How We Share Your Information" },
  { id: "cookies", label: "Cookies and Similar Technologies" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-rights", label: "Your Rights" },
  { id: "data-security", label: "Data Security" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "third-party-links", label: "Third-Party Links" },
  { id: "international-visitors", label: "International Visitors" },
  { id: "changes-to-this-policy", label: "Changes to This Policy" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact-us", label: "Contact Us" },
];

/**
 * Privacy Policy.
 *
 * A starting draft written for this specific business, not a generic
 * template — see the doc comment on `/terms/page.tsx` for the same note in
 * full; both pages share the same provenance and the same caveat: **not
 * legal advice, not reviewed by a lawyer**. Two sections below carry a
 * visible `LegalPlaceholder` rather than a guessed value — governing
 * law/jurisdiction and the country named in "International Visitors" — see
 * the task report for the full list and why each is unresolved.
 *
 * ## What's real here, and how it was confirmed
 *
 * Investigated directly against this codebase rather than assumed:
 *
 * - **The enquiry form** (`EnquiryForm.tsx`) collects name, email, company
 *   (optional), a selected service and a message — and has no backend at
 *   all. It composes a `mailto:` link and hands off to the visitor's own
 *   email application; nothing is transmitted to any Greatest Solutions or
 *   third-party server by the act of filling in or submitting the form
 *   itself. Section 2 and Section 6 below describe this precisely rather
 *   than the generic "we collect X" language a template would use, because
 *   the honest mechanism is more specific than that and matters for what
 *   visitors should actually expect.
 * - **No analytics, tracking pixel, or cookie-consent mechanism exists**
 *   anywhere in this codebase or its dependencies (`package.json` has no
 *   analytics package; no `gtag`/tracking script in `layout.tsx`). Section 5
 *   states this plainly instead of describing tracking that isn't happening.
 * - **"Book a call" opens the same contact dialog** as every other CTA —
 *   there is no external scheduling tool (no Calendly/cal.com integration)
 *   to name as a data processor.
 * - **No newsletter/email-signup exists** anywhere on the site, so this
 *   policy doesn't carry marketing-email-consent language implying one does.
 * - **Fonts are self-hosted** via `next/font` (no runtime Google Fonts
 *   request); video and images are served from this site's own `/public`
 *   directory, not a third-party CDN or video host.
 */
export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description={`Last updated: ${LAST_UPDATED}`}
      />

      <Section spacing="compact">
        <div className="flex flex-col gap-12">
          <div className="rounded-[var(--radius-lg)] border border-dashed border-amber-400 bg-amber-50 p-6 text-body-md text-amber-900 tablet:p-8">
            This page is a starting draft, written for this business but{" "}
            <strong className="font-medium">not legal advice and not yet reviewed by a lawyer</strong>. It
            should be reviewed, especially the sections marked{" "}
            <LegalPlaceholder>[to be confirmed]</LegalPlaceholder> below, before being relied on, particularly
            given this business may serve clients in more than one country.
          </div>

          <TableOfContents items={sections} />

          <div className="flex flex-col gap-10 tablet:gap-12">
            <LegalSection id="introduction" number={1} title="Introduction">
              <p>
                Greatest Solutions (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) provides AI-powered
                services including AI voice agents, vertical automation, AI lead generation, AI content and
                social media production, AI video/UGC content, AI copywriting and sales pages, AI SEO content,
                web development, AI email and brand assets, and pitch decks. This Privacy Policy explains what
                information we collect through this website, how we use it, and the choices you have.
              </p>
              <p>By using this website, you agree to the collection and use of information as described in this policy.</p>
            </LegalSection>

            <LegalSection id="information-we-collect" number={2} title="Information We Collect">
              <p>
                <strong className="font-medium text-ink">Information you provide directly.</strong> When you use
                our enquiry form, book a call, or otherwise reach out to us, you provide information such as your
                name, email address, company (if you choose to share it), the service you&apos;re interested in,
                and your message or project details.
              </p>
              <p>
                Our enquiry form does not submit to a server we control: there is no backend behind it. Filling
                it in composes a pre-addressed, pre-filled email and opens it in your own email application; the
                information you&apos;ve entered is only actually sent to us once you choose to send that email
                yourself. We don&apos;t receive anything from the form unless you take that additional step.
              </p>
              <p>
                <strong className="font-medium text-ink">Information collected automatically.</strong> At this
                time, this website does not use analytics or tracking cookies to monitor visitor behavior.
              </p>
            </LegalSection>

            <LegalSection id="how-we-use-your-information" number={3} title="How We Use Your Information">
              <p>We use the information we collect to:</p>
              <BulletList
                items={[
                  "Respond to your enquiries and requests",
                  "Discuss and scope potential projects with you",
                  "Provide the services you engage us for",
                  "Improve this website and our services",
                  "Communicate with you about your project, if you become a client",
                ]}
              />
              <p>We do not use your information for purposes unrelated to these without letting you know first.</p>
            </LegalSection>

            <LegalSection id="how-we-share-your-information" number={4} title="How We Share Your Information">
              <p>We do not sell your personal information.</p>
              <p>
                This website is hosted by Vercel. Loading any page on this site means your browser communicates
                with Vercel&apos;s servers to serve that page to you, in the same way as any website. This is
                standard web hosting, not something particular to Greatest Solutions. Because our enquiry form has
                no backend of its own (see Section 2), Vercel does not receive the contents of anything you type
                into that form; that information only ever reaches us if you send the pre-filled email the form
                composes, through your own email provider.
              </p>
              <p>We may otherwise share information with:</p>
              <BulletList
                items={[
                  "Legal authorities, if required to comply with a legal obligation, protect our rights, or respond to a valid legal request.",
                ]}
              />
              <p>We do not share your information with third parties for their own independent marketing purposes.</p>
            </LegalSection>

            <LegalSection id="cookies" number={5} title="Cookies and Similar Technologies">
              <p>
                This website does not currently use cookies for advertising, analytics, or tracking purposes. It
                may use essential technical functionality required for the site to work correctly, which does not
                track you across other websites.
              </p>
            </LegalSection>

            <LegalSection id="data-retention" number={6} title="Data Retention">
              <p>
                Because our enquiry form works by opening a pre-filled email rather than submitting to a server we
                control (see Section 2), the only information we hold is what you actually email to us; there is
                no separate database of form submissions. We retain that correspondence for as long as necessary
                to respond to your enquiry, deliver services if you become a client, and comply with any legal or
                accounting obligations that may apply. If you&apos;d like us to delete information we hold about
                you, you can request this at any time using the contact details below.
              </p>
            </LegalSection>

            <LegalSection id="your-rights" number={7} title="Your Rights">
              <p>
                Depending on where you&apos;re located, you may have rights regarding your personal information,
                which can include the right to:
              </p>
              <BulletList
                items={[
                  "Access the information we hold about you",
                  "Correct inaccurate information",
                  "Request deletion of your information",
                  "Object to or restrict certain processing",
                  "Request a copy of your information in a portable format",
                ]}
              />
              <p>
                To exercise any of these rights, contact us at{" "}
                <a href={`mailto:${site.email}`} className="text-ink underline-offset-4 hover:underline">
                  {site.email}
                </a>
                . We&apos;ll respond within a reasonable timeframe.
              </p>
            </LegalSection>

            <LegalSection id="data-security" number={8} title="Data Security">
              <p>
                We take reasonable measures to protect the information you share with us from unauthorized access,
                disclosure, or misuse. However, no method of transmission over the internet or electronic storage
                is completely secure, and we cannot guarantee absolute security. This also depends in part on the
                security of your own email provider, since our enquiry form sends information through your email
                application rather than a system we operate.
              </p>
            </LegalSection>

            <LegalSection id="childrens-privacy" number={9} title="Children's Privacy">
              <p>
                This website and our services are not directed at individuals under the age of 18, and we do not
                knowingly collect personal information from children.
              </p>
            </LegalSection>

            <LegalSection id="third-party-links" number={10} title="Third-Party Links">
              <p>
                This website may contain links to third-party websites (including our social media profiles and,
                where relevant, client or portfolio project links). We are not responsible for the privacy
                practices or content of those external sites. We encourage you to review the privacy policies of
                any third-party sites you visit.
              </p>
            </LegalSection>

            <LegalSection id="international-visitors" number={11} title="International Visitors">
              <p>
                This website may be accessed from outside{" "}
                <LegalPlaceholder>[Country: to be confirmed]</LegalPlaceholder>, and your information may be
                processed in a different country than the one you&apos;re located in. By using this website, you
                understand that your information may be transferred to and processed in such locations.
              </p>
            </LegalSection>

            <LegalSection id="changes-to-this-policy" number={12} title="Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. Any changes will be posted on this page with
                an updated &ldquo;Last updated&rdquo; date. We encourage you to review this page periodically.
              </p>
            </LegalSection>

            <LegalSection id="governing-law" number={13} title="Governing Law">
              <p>
                This Privacy Policy is governed by the laws of{" "}
                <LegalPlaceholder>[Governing Law / Jurisdiction: to be confirmed by the business owner]</LegalPlaceholder>.
              </p>
            </LegalSection>

            <LegalSection id="contact-us" number={14} title="Contact Us">
              <p>If you have any questions about this Privacy Policy or how we handle your information, contact us at:</p>
              <p>
                Email:{" "}
                <a href={`mailto:${site.email}`} className="text-ink underline-offset-4 hover:underline">
                  {site.email}
                </a>
              </p>
              <p>
                See also our{" "}
                <Link href="/terms" className="text-ink underline-offset-4 hover:underline">
                  Terms of Service
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
