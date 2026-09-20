"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { EnquiryForm } from "@/components/contact/EnquiryForm";
import { site } from "@/config/site";

/**
 * The contact dialog, and the one piece of shared UI state on the site.
 *
 * Every CTA that used to navigate to `/contact` now opens this instead. The page
 * itself is deliberately still there and still works — nothing links to it, but
 * a direct URL renders the full two-column version, so reverting is a matter of
 * pointing the CTAs back at the route.
 *
 * **Why a context rather than local state.** The triggers are in three different
 * subtrees — navbar, footer, pricing cards — with no common ancestor short of
 * the layout. Lifting a boolean that high through props would thread it through
 * every component in between; a context puts it exactly where it is read.
 *
 * **Why a new component rather than reusing something.** There was nothing to
 * reuse: the codebase had no portal, no dialog and no focus trap. The mobile
 * menu is the closest relative and it is an inline panel, not an overlay. What
 * IS reused is its conventions — the same body-scroll lock, the same Escape
 * handling shape, the same hairline-and-shadow surface tokens.
 */

/** The route this dialog stands in for. Exported so triggers test against it. */
export const CONTACT_PATH = "/contact";

type ContactModal = { open: () => void };

const ContactModalContext = createContext<ContactModal | null>(null);

/**
 * Opens the contact dialog. Safe to call from anywhere under the provider.
 *
 * Throws rather than no-ops if the provider is missing: a CTA that silently does
 * nothing is a much worse failure than one that surfaces in development.
 */
export function useContactModal(): ContactModal {
  const value = useContext(ContactModalContext);
  if (!value) throw new Error("useContactModal must be used within <ContactModalProvider>");
  return value;
}

/* Everything that can hold focus inside the card, in DOM order. */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  /* The element that opened the dialog, so focus can go back exactly there. */
  const trigger = useRef<HTMLElement | null>(null);
  const card = useRef<HTMLDivElement>(null);
  /* Whether the current mouse gesture began on the scrim — see the handlers. */
  const scrimPress = useRef(false);
  const titleId = useId();
  const descId = useId();

  /*
   * No `mounted` guard around the portal, deliberately. `open` starts false and
   * can only be set by a click, so the `createPortal` branch is never evaluated
   * during SSR or on the hydrating render — `document` is guaranteed to exist by
   * the time it runs.
   */

  const openModal = useCallback(() => {
    trigger.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  /*
   * Return focus to the trigger, in an effect rather than inside `close`, so it
   * runs AFTER the portal has been removed. Focusing while the dialog is still
   * mounted lets the browser move focus again as its subtree disappears.
   */
  useEffect(() => {
    if (open) return;
    const previous = trigger.current;
    trigger.current = null;
    previous?.focus();
  }, [open]);

  /* Page scroll stays put behind the dialog — same approach as the mobile menu. */
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  /*
   * Initial focus: the first field, so a keyboard visitor can start typing.
   * `preventScroll` because the card is already in view and Chromium would
   * otherwise scroll the locked body behind it.
   */
  useEffect(() => {
    if (!open) return;
    /*
     * The first FORM control, not simply the first focusable thing in the card —
     * the close button comes earlier in the DOM, and opening a contact dialog
     * with the cursor parked on × is not where anyone wants to start.
     */
    const field = card.current?.querySelector<HTMLElement>("form input, form select, form textarea");
    (field ?? card.current)?.focus({ preventScroll: true });
  }, [open]);

  /*
   * Escape and the focus trap, both on ONE listener in the CAPTURE phase.
   *
   * Capture matters. The hero editor and the navbar dropdowns each keep their own
   * bubble-phase `keydown` listener on `document`, and all of them would react to
   * the same Escape — the hero's would close its toolbar behind the dialog. A
   * capture listener on `document` runs before any of them, and stopping
   * propagation there means the event never reaches them at all: while the dialog
   * is open, Escape belongs to the dialog and to nothing else.
   *
   * Only Escape is swallowed, so typing in the form is untouched.
   */
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !card.current) return;

      // Re-read on every Tab: the form's controls change as it is used.
      const items = [...card.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;

      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;

      // Wrap at both ends, and pull focus back in if it has escaped the card.
      if (event.shiftKey && (active === first || !card.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, close]);

  return (
    <ContactModalContext.Provider value={{ open: openModal }}>
      {children}
      {open
        ? createPortal(
            <div
              /*
                The scrim. `grid place-items-center` handles the centring, and the
                padding is what makes the phone treatment a near-full-screen sheet
                and the desktop one a centred card — one element, no breakpoint
                branch in the markup.
              */
              className={
                "fixed inset-0 z-[var(--z-modal)] grid place-items-center overflow-y-auto p-2 tablet:p-8 " +
                "bg-[rgb(20_20_20/0.32)] backdrop-blur-[6px] " +
                "motion-safe:animate-[fade-in_200ms_var(--ease-brand)]"
              }
              /*
                Close on a click that both STARTS and ENDS on the scrim itself.
                Two reasons it is split across mousedown and click rather than
                done in one:

                - A drag that begins inside the form and releases on the scrim is
                  not a dismissal. Judging by the `click` target alone would throw
                  away a half-written enquiry over a stray mouse movement.
                - Closing on `mousedown` fires too early: the dialog unmounts
                  mid-gesture, the mouseup and click then land on whatever is now
                  underneath, and that steals the focus this dialog had just
                  restored to its trigger. Deciding on mousedown but acting on
                  click keeps the dialog mounted for the whole gesture.
              */
              onMouseDown={(event) => {
                scrimPress.current = event.target === event.currentTarget;
              }}
              onClick={(event) => {
                if (scrimPress.current && event.target === event.currentTarget) close();
                scrimPress.current = false;
              }}
              /*
                Other components keep document-level `pointerdown` listeners to
                close themselves on an outside click — the hero editor is one.
                This dialog is portalled to <body>, so it is "outside" all of them.
                Stopping propagation here keeps a click inside the dialog from
                quietly dismissing things behind it. Inputs still receive the
                event; only its trip up to `document` ends here.
              */
              onPointerDown={(event) => event.stopPropagation()}
            >
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
            </div>,
            document.body,
          )
        : null}
    </ContactModalContext.Provider>
  );
}
