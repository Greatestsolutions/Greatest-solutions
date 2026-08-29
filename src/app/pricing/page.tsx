import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Pricing } from "@/components/sections/Pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Engagement options from Greatest Solutions.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Pricing" title="Ways to work together" />
      <Pricing showHeader={false} />
    </PageShell>
  );
}
