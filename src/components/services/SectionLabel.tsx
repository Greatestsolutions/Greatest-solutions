import { cn } from "@/lib/cn";

/**
 * The mono uppercase label every section on a service detail page opens with.
 *
 * Extracted because the page has nine of them and they were nine copies of the
 * same four utilities — exactly how a tracking value or a colour drifts between
 * headings meant to be identical.
 *
 * The short emerald rule is the whole visual addition: it gives a long
 * single-column scroll a repeating left edge to follow, so each section reads as
 * a deliberate unit rather than another paragraph. Restrained on purpose — one
 * 24px line, the brand colour, no icon and no box.
 */
export function SectionLabel({
  children,
  as: Tag = "h2",
  className,
}: {
  children: React.ReactNode;
  /** `h2` for a real section heading, `p` where the heading lives elsewhere. */
  as?: "h2" | "h3" | "p";
  className?: string;
}) {
  return (
    <Tag
      className={cn(
        "flex items-center gap-3 font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase",
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-6 shrink-0 bg-brand-emerald" />
      {children}
    </Tag>
  );
}
