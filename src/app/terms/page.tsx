import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { PendingContent } from "@/components/layout/PendingContent";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Greatest Solutions.",
  alternates: { canonical: "/terms" },
  // Not useful in search until the real text is published.
  robots: { index: false, follow: true },
};

/**
 * Structure only. Legal text is a legal question, not a copywriting one — a
 * plausible-looking Terms of Service that has not been reviewed is a liability rather
 * than a placeholder, so the page states its status instead.
 */
export default function TermsPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Legal" title="Terms of Service" />
      <PendingContent what="Our Terms of Service" />
    </PageShell>
  );
}
