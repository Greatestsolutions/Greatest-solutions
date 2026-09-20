import type { ReactNode } from "react";

/**
 * One numbered section of a legal document — an anchor target for
 * `TableOfContents`, a divider rule, and the heading/body rhythm shared by
 * both Privacy and Terms.
 *
 * Plain stacked divs rather than each section being its own `Section`: with
 * fourteen-plus sections, `Section`'s own `py-12`+ vertical padding on every
 * one would spread a reference document most visitors are scanning, not
 * reading start to end, across several extra screens of empty space. A
 * border-top rule marks the same boundary far more cheaply.
 *
 * `scroll-mt-*` matches the fixed navbar's measured height (88/80/96px at
 * phone/tablet/desktop, see `Navbar.tsx`) plus a small buffer, so a jump from
 * the table of contents lands with the heading clear of the bar.
 */
export function LegalSection({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      className="flex scroll-mt-[104px] flex-col gap-4 border-t border-black/8 pt-8 first:border-t-0 first:pt-0 desktop:scroll-mt-[120px]"
    >
      <h2 className="text-heading-sm text-ink">
        <span className="text-muted">{String(number).padStart(2, "0")}.</span> {title}
      </h2>
      <div className="flex max-w-[70ch] flex-col gap-4 text-body-lg text-body">{children}</div>
    </div>
  );
}
