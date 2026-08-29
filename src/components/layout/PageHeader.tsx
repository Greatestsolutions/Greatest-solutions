import type { ReactNode } from "react";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";

/**
 * The masthead for a sub-page.
 *
 * Deliberately thin: it reuses {@link SectionHeader}, so sub-pages inherit the
 * eyebrow pill, display type and column widths already measured for the home
 * page instead of introducing a second heading treatment.
 *
 * The top padding clears the fixed navbar. Sub-pages have no full-height hero to
 * sit under it, so without this the first line of type lands behind the bar.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <Section spacing="compact" className="pt-[136px] desktop:pt-[184px]">
      <SectionHeader eyebrow={eyebrow} title={title} description={description}>
        {children}
      </SectionHeader>
    </Section>
  );
}
