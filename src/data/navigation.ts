/**
 * Navigation model.
 *
 * One source of truth for both the desktop bar and the mobile menu — the
 * reference kept two separate markup trees and reconciled them at runtime with
 * a MutationObserver, which is exactly the debt this rebuild removes.
 *
 * Routes that do not exist yet still appear here because the navigation is part
 * of the design. They are marked `pending`, which renders them as disabled
 * rather than as links that 404 — the reference shipped 13 dead links to
 * /contact alone.
 */

import { services } from "@/data/services";

export interface NavItem {
  label: string;
  href: string;
  /** Route not built yet: rendered non-interactive instead of linking to a 404. */
  pending?: boolean;
  /** Presence of children turns this into a disclosure menu. */
  children?: NavItem[];
  /**
   * Lay the panel out in this many columns instead of one. Set where a list has
   * grown long enough that a single column becomes a scroll — the panel gets
   * wider and much shorter. Omit for the normal one-column menu.
   *
   * When set, the FIRST child is treated as the overview entry and spans the
   * full width above a divider, which is why "All services" is authored first.
   */
  columns?: number;
}

/**
 * Primary navigation.
 *
 * The Services dropdown is **generated from `services.ts`**, not a second hand-kept
 * list: adding or removing a service there updates the navbar automatically, and
 * the two can never drift out of sync. Every child href is built from a real slug,
 * so a dropdown entry cannot point at a route that does not exist.
 *
 * "Pages" carries the utility routes. **Blog is deliberately not among them**
 * (task 6.3): /blog, blog.ts, the Blog section and its components all still exist
 * and the route still returns 200 — only the navigation entry is gone.
 *
 * **Solutions and Pricing have no entry at all**, same reasoning as Blog, one
 * step further: both routes were deleted outright (`/solutions` with
 * `data/solutions.ts`; `/pricing` with the homepage's Pricing section, once
 * each service grew its own three tiers on its own detail page), so there is
 * no route to link to and nothing to mark `pending`. `data/pricing.ts` and
 * `PricingCard` are not part of that deletion — they are what the per-service
 * tiers on `/services/[slug]` are built from.
 */
export const navItems: NavItem[] = [
  { label: "Works", href: "/works" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    // Ten services in one column ran to 11 rows and started scrolling on short
    // windows. Two columns of five is roughly half the height and reads as a
    // menu rather than a list.
    columns: 2,
    children: [
      // The trigger is a button (it opens the panel), so the overview page needs
      // its own entry or /services becomes unreachable from the navbar. It is
      // FIRST deliberately — the grid layout spans it across the full width.
      { label: "All services", href: "/services" },
      ...services.map((service) => ({ label: service.title, href: `/services/${service.slug}` })),
    ],
  },
  {
    label: "Pages",
    href: "#",
    children: [
      { label: "Home", href: "/" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

/* Typed as NavItem rather than inferred so `pending` stays part of the shape:
   the navbar branches on it, and a bare object literal narrows it away. */
export const navCta: NavItem = { label: "Book a call", href: "/contact" };
