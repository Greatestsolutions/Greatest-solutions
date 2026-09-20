/**
 * A jump-link index for a long, numbered legal document.
 *
 * No table-of-contents pattern exists anywhere else on the site (Privacy and
 * Terms are the first pages long enough to need one) — this is a small, plain
 * component built for exactly that need rather than a generic "TOC" system.
 * A Server Component: it's a list of anchor links, nothing here needs the
 * client.
 *
 * Anchors targets (the `id` on each `Section` below) carry `scroll-mt-*`
 * matching the fixed navbar's own height, so a jump lands with the heading
 * clear of the bar rather than underneath it.
 */
export function TableOfContents({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav aria-label="Table of contents" className="rounded-[var(--radius-lg)] border border-black/8 bg-surface p-6 tablet:p-8">
      <p className="mb-4 font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
        On this page
      </p>
      <ol className="grid gap-x-8 gap-y-2 tablet:grid-cols-2">
        {items.map((item, i) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex gap-2 text-body-md text-body underline-offset-4 hover:text-ink hover:underline"
            >
              <span className="font-mono text-muted">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
