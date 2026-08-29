import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";

/**
 * The frame every route shares: navbar, focusable `<main>`, footer.
 *
 * Extracted from the home page rather than copied into each new route — the
 * skip-link contract below is easy to get subtly wrong, and eleven divergent
 * copies of it would be eleven chances to break keyboard navigation.
 *
 * `tabIndex={-1}` makes the skip-link target programmatically focusable. Without
 * it browsers scroll to the anchor but leave focus on the link, so the next Tab
 * goes straight back into the navigation and the bypass silently fails for
 * exactly the keyboard users it exists for. -1 permits `focus()` without adding
 * `<main>` to the tab order.
 *
 * The navbar is fixed and sits before `<main>` in the DOM so keyboard order
 * matches visual order. `p-2` is the 8px page inset; `Container` supplies the
 * gutters inside it.
 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main id="main" tabIndex={-1} className="min-h-dvh p-2 focus:outline-none">
        {children}
      </main>
      <Footer />
    </>
  );
}
