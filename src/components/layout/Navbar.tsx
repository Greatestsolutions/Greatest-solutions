"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { CONTACT_PATH, useContactModal } from "@/components/contact/ContactModal";
import { navCta, navItems, type NavItem } from "@/data/navigation";
import { cn } from "@/lib/cn";
import { site } from "@/config/site";

/**
 * Site navigation.
 *
 * ONE component for all three breakpoints. The reference shipped three separate
 * markup trees plus a 16.5 KB MutationObserver layer to reconcile them after
 * every React render; none of that exists here.
 *
 * Layout switch is at 1024px, which is measured rather than chosen: the six
 * links, wordmark and CTA occupy ~929px, so they fit at 1024 (the reference
 * shows all six there) but overflow at 810 — where the reference silently drops
 * "Pages" to cope. Below 1024 we show the menu button instead, which keeps the
 * information architecture intact rather than hiding a section on tablets.
 *
 * Accessibility:
 * - The bar is a labelled <nav> landmark.
 * - "Pages" is a disclosure button (aria-expanded / aria-controls), not a link,
 *   because it goes nowhere on its own.
 * - Escape closes; focus returns to the trigger. Pointer-outside closes.
 * - Unbuilt routes render as `aria-disabled` spans rather than links to 404s.
 * - The bar is `fixed`, so it is placed FIRST in the DOM: keyboard order then
 *   matches visual order, and the skip link can bypass it.
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const sentinel = useRef<HTMLSpanElement>(null);

  /*
   * The scrolled backdrop, measured from the reference (Task 3.5):
   *
   *   scrollY 0     background rgba(249,248,246,0)     backdrop-filter none
   *   scrolled      background rgba(249,248,246,0.8)   backdrop-filter blur(10px)
   *
   * No shadow and no border in either state — the bar is a translucent pane, not
   * a card.
   *
   * An IntersectionObserver on a 1px sentinel at the top of the document, NOT a
   * scroll listener: the browser reports the crossing itself, so nothing runs on
   * the scroll thread. The header is `fixed`, so the sentinel has to live outside
   * it to have anything to scroll away from.
   */
  useEffect(() => {
    const mark = sentinel.current;
    if (!mark) return;
    const gate = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (entry) setScrolled(!entry.isIntersecting);
      },
      { threshold: 0 },
    );
    gate.observe(mark);
    return () => gate.disconnect();
  }, []);

  // Close the mobile menu if the viewport grows past the desktop switch —
  // otherwise the panel stays mounted and invisible, trapping focus.
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = () => desktop.matches && setMenuOpen(false);
    desktop.addEventListener("change", onChange);
    return () => desktop.removeEventListener("change", onChange);
  }, []);

  // Prevent the page scrolling behind the open mobile panel.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    /*
     * px-2 mirrors the 8px page inset that <main> carries. The header sits
     * outside <main>, so without it the nav Container starts from the viewport
     * edge and the wordmark lands 8px left of the hero headline at every width.
     * With it, nav and page content share one vertical line.
     */
    <>
      {/* Scroll sentinel — 1px at the document's top, invisible, never focusable. */}
      <span ref={sentinel} aria-hidden="true" className="absolute top-0 left-0 h-px w-px" />
      <header
        data-scrolled={scrolled ? "true" : undefined}
        className={
          "fixed inset-x-0 top-0 z-[var(--z-nav)] px-2 " +
          // Measured: transparent at the top, then the page colour at 80% behind a
          // 10px blur. The transition is ours — the reference reports the `all`
          // shorthand with no value — and reuses the brand colour duration.
          "bg-[rgb(249_248_246/0)] backdrop-blur-none " +
          "transition-[background-color,backdrop-filter] duration-[var(--duration-quick)] ease-[var(--ease-brand)] " +
          "data-[scrolled]:bg-[rgb(249_248_246/0.8)] data-[scrolled]:backdrop-blur-[10px]"
        }
      >
      {/*
        One three-column grid at every width, not a grid below the switch and a
        flex row above it.

        The reference's phone bar is menu · brand · CTA with the brand **centred
        on the viewport**, not on the space the two controls leave over — measured
        offCentre 0.0 at 768, 430, 390 and 320, with the two 44px controls giving
        equal 73.2px gaps at 390. Ours had both controls on the right and the
        brand hard left, 86.7px off centre at 390.

        `1fr auto 1fr` is what makes the centring real: the outer tracks are equal
        whatever they contain, so the middle one lands on the viewport's midline
        by construction. Centring it with `justify-between` plus a nudge would
        drift the moment either control changed width.

        Desktop now uses the same track set for the same reason. It used to be
        `flex justify-between`, which only centres the links while the brand and
        the CTA happen to be the same width — true of the old [mark + wordmark]
        lockup, false the moment the wordmark text came out. With `1fr auto 1fr`
        the links sit on the midline whatever the logo and CTA measure, so the
        centring cannot drift again.

        Only the occupant of each column changes across the switch: below it,
        menu · brand · CTA; above it, brand · links · CTA.

        DOM order stays brand → links → controls, so the tab order still reaches
        the logo first; only the visual columns are reordered.
      */}
      <Container
        as="nav"
        aria-label="Main"
        className="grid h-[88px] grid-cols-[1fr_auto_1fr] items-center gap-6 tablet:h-20 desktop:h-24"
      >
        <Wordmark className="col-start-2 row-start-1 justify-self-center lg:col-start-1 lg:justify-self-start" />

        {/* Desktop links — hidden below the measured 1024px fit threshold. */}
        <ul className="hidden items-center gap-2 lg:col-start-2 lg:row-start-1 lg:flex lg:justify-self-center">
          {navItems.map((item) =>
            item.children ? (
              <li key={item.label}>
                <Dropdown item={item} />
              </li>
            ) : (
              <li key={item.label}>
                <NavLink item={item} />
              </li>
            ),
          )}
        </ul>

        {/* Menu on the LEFT below the switch; it rejoins the right-hand group at lg. */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          /* The reference draws this as a white circular button, not a bare
             glyph — it visually balances the green CTA circle on the opposite
             side of the centred brand. Same hairline-plus-shadow recipe as the
             hero's editor chip. */
          className="col-start-1 row-start-1 grid size-[46px] place-items-center justify-self-start rounded-full bg-white text-brand-ink shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_1px_2px_rgb(0_0_0/0.08)] transition-colors duration-[320ms] ease-[var(--ease-brand)] hover:bg-scrim-06 lg:hidden"
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <MenuIcon open={menuOpen} />
        </button>

        <div className="col-start-3 row-start-1 flex items-center gap-2 justify-self-end">
          <CallToAction />
        </div>
      </Container>

      <MobileMenu open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      </header>
    </>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * The home link: the mark on its own, with the hover measured in Task 3.5.
 *
 * Reference, default → hover:
 *
 *   transform     scale 1 → 1.06, rotate 0 → −3deg, translateY 0 → −1px
 *   drop-shadow   rgba(9,52,27,0.22) 0 4px 10px  →  rgba(9,52,27,0.34) 0 8px 18px
 *
 * The transform sits on the emblem itself, which is why removing the "Greatest
 * Solutions" text beside it left the hover untouched — nothing about the motion
 * was ever attached to the words.
 *
 * The company name is gone from the BAR only. It stays in `site.name` and is
 * still announced here as the link's accessible name: a link whose only content
 * is an `aria-hidden` image would otherwise reach a screen reader unnamed.
 *
 * `focus-visible` gets the same treatment — the logo is a link, and a hover-only
 * affordance is invisible to anyone arriving by keyboard.
 */
function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group/logo flex shrink-0 items-center", className)}
      aria-label={`${site.name} home`}
    >
      <EmblemIcon />
    </Link>
  );
}

/**
 * The Greatest Solutions mark.
 *
 * Rendered from a pre-rasterised transparent PNG rather than the source SVG: the
 * supplied `GST_logo_balanced.svg` is 564 KB across 1169 traced paths, and every
 * one of those paths would be parsed on every page load for a 40px mark whose
 * detail is invisible at that size. The 34 KB PNG is served once and cached; the
 * full SVG lives at /brand/gst-logo.svg for print or large-format use.
 *
 * The hover motion is the one the hand-drawn emblem carried, kept unchanged.
 */
function EmblemIcon() {
  return (
    <Image
      src="/brand/logo-mark.png"
      alt=""
      aria-hidden="true"
      width={240}
      height={123}
      priority
      className={
        "h-6 w-auto shrink-0 origin-center " +
        "[filter:drop-shadow(rgba(9,52,27,0.22)_0_4px_10px)] " +
        "transition-[transform,filter] duration-[var(--duration-medium)] ease-[var(--ease-brand)] " +
        "group-hover/logo:scale-[1.06] group-hover/logo:-rotate-3 group-hover/logo:-translate-y-px " +
        "group-hover/logo:[filter:drop-shadow(rgba(9,52,27,0.34)_0_8px_18px)] " +
        "group-focus-visible/logo:scale-[1.06] group-focus-visible/logo:-rotate-3 " +
        "group-focus-visible/logo:-translate-y-px " +
        "motion-reduce:transition-none"
      }
    />
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className="size-5" aria-hidden="true" focusable="false">
      <line
        x1="3"
        y1={open ? "10" : "7"}
        x2="17"
        y2={open ? "10" : "7"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="origin-center transition-transform duration-300"
        transform={open ? "rotate(45 10 10)" : undefined}
      />
      <line
        x1="3"
        y1={open ? "10" : "13"}
        x2="17"
        y2={open ? "10" : "13"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        className="origin-center transition-transform duration-300"
        transform={open ? "rotate(-45 10 10)" : undefined}
      />
    </svg>
  );
}

/**
 * Shared link styling, measured from the reference:
 *   14px / 500 / rgb(34,54,42) — brand ink — letter-spacing -0.16px
 *   40px-tall pill, 8px gaps
 *   hover: colour shifts to rgb(22,113,60) — brand green
 *   transition: color 0.32s cubic-bezier(0.22, 0.85, 0.25, 1)
 *
 * Note the reference changes ONLY colour on hover — no background, no transform.
 * The first pass used a background tint, which is why it read as static-but-busy
 * rather than alive.
 */
const linkClass =
  "group/nav relative flex h-10 items-center rounded-full px-5 text-body-md font-medium tracking-[-0.16px] text-brand-ink transition-colors duration-[320ms] ease-[var(--ease-brand)]";

/**
 * The nav hover indicator — measured in Task 3.5, and missing until then.
 *
 * The reference animates three things together on every nav item:
 *
 *   opacity   0 → 1
 *   filter    blur(4px) → blur(0)
 *   position  rises 8px as it sharpens
 *   paint     4x4, rgb(29,137,68) — brand green — fully round
 *
 * The colour shift on the label was already right; this dot is what the first
 * pass missed, and it is what makes the bar feel alive rather than merely tinted.
 */
function NavDot() {
  return (
    <span
      aria-hidden="true"
      className={
        "pointer-events-none absolute bottom-1 left-1/2 size-1 -translate-x-1/2 translate-y-2 " +
        "rounded-full bg-brand-green opacity-0 blur-[4px] " +
        "transition-[opacity,filter,transform] duration-[320ms] ease-[var(--ease-brand)] " +
        "group-hover/nav:translate-y-0 group-hover/nav:opacity-100 group-hover/nav:blur-none " +
        "motion-reduce:transition-none"
      }
    />
  );
}

function NavLink({ item }: { item: NavItem }) {
  if (item.pending) {
    return (
      <span
        aria-disabled="true"
        title="Coming soon"
        className={cn(linkClass, "cursor-default hover:text-brand-green")}
      >
        {item.label}
        <NavDot />
      </span>
    );
  }
  return (
    <Link href={item.href} className={cn(linkClass, "hover:text-brand-green")}>
      {item.label}
      <NavDot />
    </Link>
  );
}

/**
 * Book-a-call action.
 *
 * Below `tablet` this collapses to an icon-only circle. At 390px the full pill
 * competed with the wordmark and burger and wrapped "Book a call" onto two
 * lines; the reference solves the same squeeze with a phone icon. The label
 * stays in the accessibility tree either way.
 */
function CallToAction() {
  const { open: openContact } = useContactModal();

  /*
   * Measured from the reference:
   *   background: linear-gradient(140deg, #219b4e 0%, #16713c 46%, #0c4b24 100%)
   *   border-radius: 100px, padding 10px 20px
   *   five-layer shadow (see --shadow-cta)
   *   transition: box-shadow 0.4s + filter 0.4s, cubic-bezier(.22,.85,.25,1)
   */
  const className =
    // `group` so the stacked labels below can react to hover on the control.
    "group grid size-10 shrink-0 place-items-center rounded-full text-surface " +
    // The gradient moved to --gradient-cta once Button became a second consumer.
    // Same value, one source; nothing else about this control changed.
    "bg-[image:var(--gradient-cta)] " +
    "shadow-[var(--shadow-cta)] " +
    /*
     * Measured in Task 3.5 — the first pass had this backwards. The reference
     * presses the button IN, it does not lift it:
     *
     *   transform  scale(0.95)          (we had -translate-y-px)
     *   filter     saturate(1.12) brightness(1.06)   (we had brightness 1.04)
     *   shadow     all five layers deepen and spread
     *
     * The label also cross-blurs as it swaps (0 → 10px on the outgoing copy,
     * 10px → 0 on the incoming). That needs the stacked-label markup this control
     * does not have, and is recorded as outstanding rather than approximated.
     */
    "transition-[box-shadow,filter,transform] duration-[var(--duration-medium)] ease-[var(--ease-brand)] " +
    "hover:shadow-[var(--shadow-cta-hover)] hover:scale-95 hover:saturate-[1.12] hover:brightness-[1.06] " +
    "tablet:flex tablet:size-auto tablet:h-10 tablet:w-auto tablet:items-center tablet:px-5 " +
    "tablet:text-body-md tablet:font-medium tablet:tracking-[-0.28px]";

  /*
   * The measured label swap (Task 3.4b). Two stacked copies 24px apart inside a
   * 20px clip window; on hover the stack slides up 44px while the copies
   * cross-blur — outgoing 0 → 10px at opacity 1 → 0, incoming the reverse. The
   * same three-property move the pricing buttons make, and the same one `Button`
   * now implements; this control cannot consume `Button` because the navbar is a
   * frozen surface with its own icon-plus-label shape.
   *
   * `sr-only tablet:not-sr-only` stays on a single real label so the accessible
   * name is announced once; the animated copies are `aria-hidden`.
   */
  const swap =
    "block h-5 transition-[opacity,filter] duration-[var(--duration-medium)] " +
    "ease-[var(--ease-brand)] motion-reduce:transition-none";

  const content = (
    <>
      <PhoneIcon />
      <span className="sr-only">{navCta.label}</span>
      <span aria-hidden="true" className="hidden h-5 overflow-clip tablet:block">
        <span className="flex flex-col gap-6 transition-transform duration-[var(--duration-medium)] ease-[var(--ease-brand)] group-hover:-translate-y-11 motion-reduce:transition-none">
          <span className={cn(swap, "opacity-100 blur-none group-hover:opacity-0 group-hover:blur-[10px]")}>
            {navCta.label}
          </span>
          <span className={cn(swap, "opacity-0 blur-[10px] group-hover:opacity-100 group-hover:blur-none")}>
            {navCta.label}
          </span>
        </span>
      </span>
    </>
  );

  if (navCta.pending) {
    return (
      <span aria-disabled="true" title="Coming soon" className={cn(className, "cursor-default")}>
        {content}
      </span>
    );
  }
  /*
    A button, not a link: it opens the contact dialog rather than navigating.
    `navCta.href` still records the route it stands in for, and /contact still
    renders standalone — nothing points at it any more.
  */
  return (
    <button type="button" onClick={openContact} className={cn(className, "cursor-pointer")}>
      {content}
    </button>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 tablet:hidden" aria-hidden="true" focusable="false">
      <path
        d="M5.2 2.5 6.8 5 5.5 6.6a8 8 0 0 0 3.9 3.9L11 9.2l2.5 1.6-.6 2.2a1 1 0 0 1-1.1.7A11.5 11.5 0 0 1 2.3 3.7a1 1 0 0 1 .7-1.1z"
        fill="currentColor"
      />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */

/** Desktop disclosure menu. A button, not a link — it has no destination. */
function Dropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  /* Two columns is the only widened layout in use, so the flag is read as a
     boolean here rather than threaded through as a column count. */
  const grid = (item.columns ?? 1) > 1;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Return focus to the trigger, or it lands back at the top of the page.
      triggerRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    // Closing on focusout covers Tab-ing past the last item.
    const onFocusIn = (event: FocusEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
    };
  }, [open]);

  return (
    <div
      ref={wrapperRef}
      className="relative"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(linkClass, "gap-1.5 hover:text-brand-green")}
      >
        {item.label}
        <svg
          viewBox="0 0 12 12"
          className={cn("size-3 transition-transform duration-300", open && "rotate-180")}
          aria-hidden="true"
          focusable="false"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div
        id={panelId}
        /*
         * Animated rather than `hidden`, so it has an entrance and an exit.
         * `visibility` is the key: it is transitionable (unlike `display`), and
         * `visibility: hidden` still removes the contents from the tab order —
         * so the panel animates without ever becoming a focus trap. Opacity
         * alone would leave invisible links tabbable.
         *
         * Kept mounted so the id stays stable for aria-controls.
         */
        /*
         * `pt-1` rather than `mt-1`. The 4px offset used to be a margin, which put
         * it OUTSIDE the panel's hit area — the pointer crossed a 4px dead strip
         * between the trigger and the panel where it was over neither element, so
         * `onPointerLeave` fired on the wrapper and the menu closed before it could
         * be reached. As padding, the gap belongs to the panel and the pointer
         * never leaves.
         */
        className={cn(
          "absolute top-full left-0 pt-1",
          /*
           * Entrance: fade + slide, now WITH a scale — `0.97 → 1`, "growing into
           * place" rather than just sliding down. Named longhand properties
           * (`translate`, `scale`), not `transform`: Tailwind v4's `translate-*`
           * and `scale-*` utilities emit the standalone CSS `translate`/`scale`
           * properties, not a composited `transform` string (the same reason
           * `ProjectCard`'s hover zoom and the card carousels' hover pop both
           * transition `scale` by name rather than `transform`) — listing the
           * literal `transform` property here, as before, transitioned nothing,
           * which is almost certainly why the open/close read as an instant snap
           * rather than the slide the code already asked for.
           */
          "origin-top transition-[opacity,visibility,translate,scale] duration-[280ms] ease-[var(--ease-brand)] motion-reduce:transition-none",
          open
            ? "visible translate-y-0 scale-100 opacity-100"
            : "invisible -translate-y-1.5 scale-[0.97] opacity-0",
        )}
      >
        {/*
          One list, laid out as a column or as a grid depending on `item.columns`.
          Services sets 2, which turns 11 stacked rows (~450px) into an overview
          row plus a 5x2 block (~230px) — short enough that the scroll cap below
          never engages at a normal window height. Pages, with no `columns`, is
          untouched and still a single column.

          The cap stays as a defensive fallback for very short windows: same
          `max-h` + `overflow-y-auto` pattern the mobile menu below uses, with no
          custom scrollbar styling, so the two match. `overscroll-contain` stops a
          scroll that reaches the end from chaining into the page behind it.

          Panel chrome — radius, hairline, shadow, padding — is one set of classes
          for both layouts, so the two dropdowns cannot drift apart.
        */}
        <ul
          className={cn(
            "max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain",
            "rounded-[var(--radius-sm)] border border-hairline bg-surface p-2 shadow-card",
            grid
              ? // Row-major, so DOM order and reading order are the same thing and
                // Tab walks the panel exactly as the eye does.
                //
                // `max-content` tracks, NOT `grid-cols-2`: Tailwind's numbered
                // utility is `repeat(2, minmax(0, 1fr))`, whose min size is zero,
                // so the columns contribute nothing to the panel's intrinsic width.
                // Measured, that collapsed the whole panel to 115px with 46px
                // columns and the labels spilling out of their cells. Sizing the
                // tracks to their content is what makes the panel as wide as the
                // longest pair of labels needs.
                "grid grid-cols-[repeat(2,max-content)] gap-x-1"
              : "flex min-w-52 flex-col",
          )}
        >
          {item.children?.map((child, i) => {
            // In grid mode the first child is the overview link: full width, with a
            // hairline beneath it so it reads as a heading for the block, not a
            // twelfth service.
            const overview = grid && i === 0;
            /*
             * The stagger reveals by ROW, not by item — two cells in the same
             * grid row share a delay, so the panel reads as rows dropping in
             * rather than eleven individual items popping one after another,
             * which would take noticeably longer to finish for the same step
             * size. In the ungridded Pages menu every item already is its own
             * row (`i` itself), so one formula covers both without a branch.
             */
            const row = overview ? 0 : grid ? Math.ceil(i / 2) : i;
            const cell = cn(
              "group/row block rounded-[var(--radius-xs)] px-3 py-2 text-body-md",
              // One property list for the item's OWN hover, kept separate from
              // the `<li>`'s entrance transition below — two elements, two
              // reasons to change, two transitions. `--duration-quick` is the
              // token this exact 320ms already was; naming it doesn't change the
              // number, just stops it being a second, disconnected 320ms.
              "transition-[background-color,color,translate] duration-[var(--duration-quick)] ease-[var(--ease-brand)] motion-reduce:transition-none",
              // Nowrap only in the grid: it is what makes the two columns size to
              // their longest label instead of wrapping into a ragged block.
              grid && "whitespace-nowrap",
            );
            return (
              <li
                key={child.label}
                /*
                 * The stagger itself. Delayed only while OPENING — `open ?
                 * delay : undefined` clears the inline style on close, so every
                 * row fades out together on the same quick beat rather than
                 * reversing the stagger, which would make closing feel slower
                 * than opening for no reason.
                 */
                style={open ? { transitionDelay: `${row * 18}ms` } : undefined}
                className={cn(
                  "transition-[opacity,translate] duration-[var(--duration-quick)] ease-[var(--ease-brand)] motion-reduce:transition-none",
                  open ? "translate-y-0 opacity-100" : "-translate-y-0.5 opacity-0",
                  overview && "col-span-2 mb-1 border-b border-hairline pb-1",
                )}
              >
                {child.pending ? (
                  <span aria-disabled="true" title="Coming soon" className={cn(cell, "text-muted")}>
                    {child.label}
                  </span>
                ) : (
                  <PanelItem
                    child={child}
                    className={cn(
                      cell,
                      // The background fill is the site's own established
                      // "subtle neutral hover" token — the same `bg-scrim-06`
                      // the navbar's own menu button, the contact dialog's
                      // close button and the carousel's arrow controls already
                      // use, not a new colour introduced for this one menu.
                      "text-brand-ink hover:bg-scrim-06 hover:text-brand-green",
                      // The "slight indent" reveal, on ordinary rows only — the
                      // overview row gets its own reveal from the arrow instead,
                      // so it isn't carrying two competing motions on hover.
                      !overview && "hover:translate-x-0.5",
                      overview && "font-medium",
                    )}
                    trailing={
                      overview ? (
                        // The arrow is the third thing that sets this row apart
                        // (with the divider and the medium weight, both already
                        // in place): visible at rest and shifting right on
                        // hover, exactly the "View project →" idiom the works
                        // index already uses — reused, not reinvented.
                        <span
                          aria-hidden="true"
                          className="text-muted transition-[color,translate] duration-[var(--duration-quick)] ease-[var(--ease-brand)] group-hover/row:translate-x-1 group-hover/row:text-brand-green"
                        >
                          →
                        </span>
                      ) : undefined
                    }
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * One row inside a dropdown panel or the mobile menu.
 *
 * The single place that decides link-or-button: an entry pointing at
 * {@link CONTACT_PATH} opens the contact dialog instead of navigating, and
 * everything else stays an ordinary `Link`. Written once so the desktop panel
 * and the mobile menu cannot drift apart on it.
 */
function PanelItem({
  child,
  className,
  trailing,
  onNavigate,
}: {
  child: NavItem;
  className: string;
  /** An extra element pinned to the row's trailing edge — currently only the
   *  desktop "All services" row's arrow. Omitted everywhere else, including
   *  the mobile menu, which never passes it. */
  trailing?: ReactNode;
  onNavigate?: () => void;
}) {
  const { open: openContact } = useContactModal();
  const content = trailing ? (
    <span className="flex w-full items-center justify-between gap-3">
      {child.label}
      {trailing}
    </span>
  ) : (
    child.label
  );

  if (child.href === CONTACT_PATH) {
    return (
      <button
        type="button"
        onClick={() => {
          onNavigate?.();
          openContact();
        }}
        className={cn(className, "w-full cursor-pointer text-left")}
      >
        {content}
      </button>
    );
  }

  return (
    <Link href={child.href} onClick={onNavigate} className={className}>
      {content}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */

function MobileMenu({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  return (
    <div
      id="mobile-menu"
      hidden={!open}
      className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-hairline bg-surface lg:hidden"
    >
      <Container>
        <ul className="flex flex-col py-4">
          {navItems.map((item) => (
            <li key={item.label} className="border-b border-hairline last:border-0">
              {item.children ? (
                <details className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-body-lg text-brand-ink marker:hidden">
                    {item.label}
                    <svg viewBox="0 0 12 12" className="size-3 transition-transform group-open:rotate-180" aria-hidden="true">
                      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </summary>
                  <ul className="flex flex-col pb-2 pl-3">
                    {item.children.map((child) => (
                      <li key={child.label}>
                        {child.pending ? (
                          <span aria-disabled="true" className="block py-2 text-body-md text-muted">
                            {child.label}
                          </span>
                        ) : (
                          <PanelItem
                            child={child}
                            onNavigate={onNavigate}
                            className="block py-2 text-body-md text-brand-ink"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : item.pending ? (
                <span aria-disabled="true" className="block py-3 text-body-lg text-muted">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} onClick={onNavigate} className="block py-3 text-body-lg text-brand-ink">
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
