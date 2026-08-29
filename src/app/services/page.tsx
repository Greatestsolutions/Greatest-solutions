import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Services } from "@/components/sections/Services";

export const metadata: Metadata = {
  title: "Services",
  description: "Software development and technology services from Greatest Solutions.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Services"
        title="What we build"
        description="Each service below has its own page with a fuller description."
      />
      {/* Services renders no heading of its own, so PageHeader above is the only one. */}
      <Services />
    </PageShell>
  );
}
