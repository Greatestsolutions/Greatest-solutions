import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { WorksIndex } from "@/components/works/WorksIndex";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected projects by Greatest Solutions.",
  alternates: { canonical: "/works" },
};

/**
 * The full listing.
 *
 * This used to render the homepage's `Works` section with its header suppressed,
 * which made the two pages the same thing twice. It now has its own layout — see
 * {@link WorksIndex} — a searchable typographic index rather than the homepage's
 * staggered image grid. `Works.tsx` is no longer imported here and is untouched.
 */
export default function WorksPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Work"
        title="Projects we have shipped"
        description="A selection of the work. Search by tool, technique or name — every project links through to a short summary."
      />
      <WorksIndex />
    </PageShell>
  );
}
