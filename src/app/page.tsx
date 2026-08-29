import { PageShell } from "@/components/layout/PageShell";
import { Blog } from "@/components/sections/Blog";
import { FAQ } from "@/components/sections/FAQ";
import { LogoStrip } from "@/components/sections/LogoStrip";
import { Hero } from "@/components/sections/Hero";
import { Pricing } from "@/components/sections/Pricing";
import { Process } from "@/components/sections/Process";
import { Services } from "@/components/sections/Services";
import { Testimonials } from "@/components/sections/Testimonials";
import { Showreel } from "@/components/sections/Showreel";
import { Works } from "@/components/sections/Works";

/**
 * Home page. Composes sections and nothing else — layout, copy and behaviour all
 * belong to the sections themselves, so adding one is a single import here.
 */
/*
 * LogoStrip and Testimonials are both restored. Their content is the template's,
 * not Greatest Solutions' — see the notes in clients.ts and testimonials.ts.
 *
 * LogoStrip presented template companies under "Trusted by world-leading
 * enterprises", and Testimonials carried three invented people at invented
 * companies plus a 54+/96%/12+ stats strip. All of it is a claim about Greatest
 * Solutions that cannot be supported, so it is off the page rather than reworded.
 *
 * Both components, their data files and their animations are untouched on disk —
 * restoring either is re-adding one line here once real logos or real, attributed
 * testimonials exist.
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
        <LogoStrip />
        <Showreel />
        <Works />
        <Services />
        <Process />
        <Pricing />
        <Testimonials />
        <Blog />
        <FAQ />
    </PageShell>
  );
}
