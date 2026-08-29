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
 */
export const navItems: NavItem[] = [
  { label: "Works", href: "/works" },
  { label: "About", href: "/about" },
  { label: "Solutions", href: "/solutions" },
  {
    label: "Services",
    href: "/services",
    children: [
      // The trigger is a button (it opens the panel), so the overview page needs
      // its own entry or /services becomes unreachable from the navbar.
      { label: "All services", href: "/services" },
      ...services.map((service) => ({ label: service.title, href: `/services/${service.slug}` })),
    ],
  },
  { label: "Pricing", href: "/pricing" },
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
