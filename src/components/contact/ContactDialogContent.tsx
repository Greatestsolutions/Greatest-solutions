"use client";

import type { RefObject } from "react";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { site } from "@/config/site";

/**
 * The dialog's actual content — split out of `ContactModal.tsx` purely so it
 * can be code-split.
 *
 * This is every byte of `ContactModal` that only matters once a visitor has
 * actually clicked a CTA: the heading, the email block, and `EnquiryForm`
 * itself (its own state, validation and mailto composition). None of it is
 * needed for the first paint of any page, but before this split it shipped in
 * the ROOT layout's bundle regardless — `ContactModalProvider` is mounted
 * once at the root precisely because its triggers are in three unrelated
 * subtrees, and everything imported by that file was going into every page's
 * initial JS, whether or not that visitor ever opens the dialog.
 *
 * `ContactModal.tsx` now loads this via `next/dynamic(..., { ssr: false })`,
 * rendered only when `open` is already true — so this component's own code is
 * fetched on the click that first opens the dialog, not before. `ssr: false`
 * costs nothing here: the portal branch it lives inside already never
 * renders during SSR or hydration (`open` starts `false` and is only ever
 * set from a click handler), so there was no server-rendered markup for this
 * piece to begin with.
 *
 * Pure extraction, not a rewrite: identical markup, identical classes,
 * identical behaviour. `card`/`titleId`/`descId`/`close` are exactly the
 * values `ContactModalProvider` already held — passed in as props instead of
 * being local variables, since the state and the focus-trap wiring that
 * reads `card` stay in the parent.
 */
export default function ContactDialogContent({
  card,
  titleId,
  descId,
  close,
}: {
  card: RefObject<HTMLDivElement | null>;
  titleId: string;
  descId: string;
  close: () => void;
}) {
  return (
    <div
      ref={card}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      tabIndex={-1}
      className={
        "relative flex max-h-full w-full max-w-[560px] flex-col gap-8 overflow-y-auto " +
        "rounded-[var(--radius-md)] border border-black/8 bg-surface p-6 shadow-card " +
        "tablet:rounded-[var(--radius-lg)] tablet:p-10 " +
        "motion-safe:animate-[rise-in_260ms_var(--ease-brand)]"
      }
    >
      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className={
          "absolute top-4 right-4 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full " +
          "border border-hairline-strong bg-surface text-body " +
          "transition-colors duration-[var(--duration-quick)] ease-[var(--ease-brand)] " +
          "hover:bg-scrim-06 hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
        }
      >
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" focusable="false">
          <path
            d="M4 4l8 8M12 4l-8 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {/* Heading and intro carried over from the /contact page, so the
          two surfaces say the same thing in the same voice. */}
      <div className="flex flex-col gap-3 pr-12">
        <p className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
          Contact
        </p>
        <h2 id={titleId} className="text-heading-lg text-ink">
          Tell us what you are building
        </h2>
        <p id={descId} className="text-body-lg text-body">
          Send us the shape of the problem: timeline, stack, what it has to work with. We&apos;ll
          reply with how we&apos;d approach it.
        </p>
      </div>

      {/* The address, stated outright rather than hidden behind a link
          label. It is the one channel that genuinely works, so it gets
          the same prominence the full page gives it. */}
      <div className="flex flex-col gap-2 rounded-[var(--radius-sm)] border border-hairline-strong bg-background p-4">
        <p className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
          Email
        </p>
        <a
          href={`mailto:${site.email}`}
          className="text-heading-sm break-all text-ink underline-offset-4 transition-colors duration-[var(--duration-quick)] hover:underline"
        >
          {site.email}
        </a>
      </div>

      {/* The same component the /contact page renders — same fields,
          same mailto composition, same confirmation. */}
      <EnquiryForm variant="bare" />
    </div>
  );
}
