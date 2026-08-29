import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { PendingContent } from "@/components/layout/PendingContent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Greatest Solutions.",
  alternates: { canonical: "/privacy" },
  // Not useful in search until the real text is published.
  robots: { index: false, follow: true },
};

/**
 * Structure only. Legal text is a legal question, not a copywriting one — a
 * plausible-looking Privacy Policy that has not been reviewed is a liability rather
 * than a placeholder, so the page states its status instead.
 */
export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Legal" title="Privacy Policy" />
      <PendingContent what="Our Privacy Policy" />
    </PageShell>
  );
}
