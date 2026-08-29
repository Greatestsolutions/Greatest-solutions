import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Works } from "@/components/sections/Works";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects by Greatest Solutions.",
  alternates: { canonical: "/works" },
};

/**
 * Reuses the home page's {@link Works} section rather than rebuilding the grid,
 * so the cards, hover zoom and parallax stay identical by construction.
 */
export default function WorksPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Work"
        title="Projects we have shipped"
        description="A selection of the work. Every project below links through to a short summary."
      />
      <Works showHeader={false} />
    </PageShell>
  );
}
