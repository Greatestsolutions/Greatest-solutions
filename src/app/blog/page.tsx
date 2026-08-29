import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { PageShell } from "@/components/layout/PageShell";
import { Blog } from "@/components/sections/Blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing from the Greatest Solutions team.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return (
    <PageShell>
      <PageHeader eyebrow="Blog" title="Ideas, insights & perspectives" />
      <Blog showHeader={false} showCta={false} />
    </PageShell>
  );
}
