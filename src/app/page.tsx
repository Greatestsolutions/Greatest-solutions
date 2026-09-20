import { PageShell } from "@/components/layout/PageShell";
import { FAQ } from "@/components/sections/FAQ";
import { Hero } from "@/components/sections/Hero";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { Showreel } from "@/components/sections/Showreel";
import { Works } from "@/components/sections/Works";

/**
 * Home page. Composes sections and nothing else — layout, copy and behaviour all
 * belong to the sections themselves, so adding one is a single import here.
 *
 * The standalone Pricing section is deliberately gone: each of the ten
 * services now carries its own three pricing tiers on its own `/services/[slug]`
 * page, which made one generic homepage section redundant rather than
 * complementary. `sections/Pricing.tsx` and `data/pricing.ts` are untouched on
 * disk — `PricingCard`, `PlanIcon` and `BenefitIcon` are exactly what the new
 * per-service tiers are built from, and the homepage section itself is simply
 * unreferenced, the same treatment `Blog`'s removal from the nav got.
 */
/*
 * LogoStrip is off the page. `clientRows` in `data/clients.ts` held eight of
 * the template's own company names under "Trusted by world-leading
 * enterprises" — a claim about those companies as well as about Greatest
 * Solutions, and unsupportable either way. That array has now been emptied
 * twice; see its own file for why a second pass was needed and why the names
 * themselves aren't repeated here either. The component, `Marquee` and the
 * measured row/cell/ticker geometry are all untouched on disk — restoring the
 * section is re-adding one `<LogoStrip />` line here once real client logos
 * exist.
 *
 * Testimonials, unlike LogoStrip, stays on the page: `data/testimonials.ts`
 * no longer carries the template's three invented people — it holds two real,
 * attributed client reviews. The stats strip beneath the cards (54+/96%/12+)
 * is a separate question a prior pass flagged as unconfirmed and deliberately
 * left alone; see that file's own comment rather than this one for its status.
 *
 * `Blog` (the "Notes" section — eyebrow "Notes", "Notes from our work and
 * thinking") is also gone from here, same treatment: no articles exist yet, and
 * a "Coming soon" panel on the homepage itself reads as unfinished rather than
 * as the honest empty state it is one level down. `/blog` is untouched — the
 * route, `Blog.tsx` and `data/blog.ts` are all still there, and the route
 * renders that same component (`showHeader={false} showCta={false}`) with its
 * own "Coming soon" state intact for anyone who visits it directly. Restoring
 * this is re-adding one `<Blog />` line here once real posts exist.
 */
export default function Home() {
  return (
    /*
     * tabIndex={-1} makes the skip-link target programmatically focusable.
     * Without it, browsers scroll to the anchor but leave focus on the link, so
     * the next Tab goes straight back into the navigation — the bypass silently
     * fails for exactly the keyboard users it exists for. -1 permits focus()
     * without adding <main> to the tab order.
     *
     * p-2 is the 8px page inset the reference uses; Container supplies the
     * gutters inside it.
     */
    <PageShell>
        <Hero />
        <Showreel />
        {/* The homepage cards carry the second "Start this service" action; the
            /works listing renders the same section without it. */}
        <Works showContactCta />
        <Services />
        <Process />
        <Testimonials />
        <FAQ />
    </PageShell>
  );
}
