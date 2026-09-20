import type { Metadata } from "next";
import Link from "next/link";
import { AboutIntro } from "@/components/about/AboutIntro";
import { CountUp } from "@/components/about/CountUp";
import { PortfolioStrip } from "@/components/about/PortfolioStrip";
import { ScrollSyncedWorkflow } from "@/components/about/ScrollSyncedWorkflow";
import { ServiceCapabilities } from "@/components/about/ServiceCapabilities";
import { PageShell } from "@/components/layout/PageShell";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/layout/Section";
import { blurFocus, noBlur, scaleFade } from "@/lib/motion";
import { services } from "@/data/services";
import { projects } from "@/data/works";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Greatest Solutions: 10 AI-powered services, delivered through a human strategy, AI-assisted production, human QA model.",
  alternates: { canonical: "/about" },
};

/**
 * About.
 *
 * Rewritten from the site's earlier "software development and technology
 * services agency" framing to match the AI-services positioning established
 * everywhere else (`services.ts`, the `/services` intro's `ProcessSequence`,
 * `AiHumanWorkflow`, the homepage FAQ). Every claim on this page traces to one
 * of those: the ten services are transcribed from `services.ts`, the delivery
 * model restates `AiHumanWorkflow`'s six steps in this page's own voice, the
 * portfolio summary is drawn from what `works.ts` actually contains (grouped
 * by kind, no client named — none of those entries has one to name), and the
 * engagement-model paragraph restates the FAQ's own pricing answer.
 *
 * Deliberately absent: a founding year, team size, named founders, and a
 * client or project count — including anything resembling the homepage
 * testimonials section's own 54+/96%/12+ stats strip (`data/testimonials.ts`),
 * which a prior pass flagged as unconfirmed and deliberately left untouched
 * rather than assumed real; this page doesn't restate those figures either,
 * for the same reason. None of what's absent here is independently
 * confirmed, and a plausible-sounding number is still an invented one. Where a
 * conventional About page would put a "Story" or "Team" section, this one goes
 * deeper on the service model and the work instead — see the report for what
 * was deliberately left out rather than filled with placeholder content.
 *
 * ## Presentation pass (first revision)
 *
 * The words above are untouched from the content pass — every section below
 * still says exactly what it said before. What changed is how each section
 * arrives and reads: this page was a flat column of paragraphs with no motion
 * and no section-to-section rhythm, so it read as plain text rather than the
 * "considered and premium" impression the rest of the site already makes.
 * Every animation reuses an existing site mechanism rather than a new one.
 *
 * ## Presentation pass, round two (this revision)
 *
 * The first pass was technically animated but mechanically so — the whole
 * page ran on two fade presets in the same on-enter pattern, the new grid and
 * strip had no hover feedback, and the "10" sat there statically despite
 * being the page's one obvious counted-up moment. This pass pushes past that
 * without inventing anything new to say:
 *
 *   1. Motion vocabulary  `lib/motion.ts` gained `riseInSpring` (a tactile
 *      interaction-spring rise, reserved for the masthead heading — the
 *      page's single highest-weight moment), `blurFocus` (blur-to-sharp) and
 *      `scaleFade` (a plain settling scale+fade, no bounce), each with its
 *      own transition, so different sections read as different arrivals
 *      rather than the same tween four times over.
 *   2. The "10"  now `CountUp` — counts 0→10 once on scroll-into-view via
 *      `motion/react`'s `animate()`, and settles on the exact figure the
 *      adjacent prose already states in words.
 *   3. Hover/focus  `ServiceCapabilities` tiles are now real links to their
 *      own `/services/[slug]` page and get the works cards' own `glass-sweep`
 *      hover; `PortfolioStrip` thumbnails get a title-reveal on hover. Both
 *      fire identically on keyboard focus (`group-focus-visible`), not mouse
 *      hover alone.
 *   4. Scroll-linked workflow  the "how we work" section's `AiHumanWorkflow`
 *      is now wrapped in `ScrollSyncedWorkflow`, which highlights the step
 *      matching scroll position via one new optional, default-`null` prop on
 *      the shared component — every other page rendering it is unaffected
 *      (see that component's own doc comment).
 *   5. Ambient glow  a blurred emerald shape drifting on the exact
 *      `gst-drift`/`gst-glow-pulse` keyframes `ServiceArt` already uses
 *      elsewhere on the site, slower and far dimmer here since this page is
 *      for reading, not a hero moment.
 *   6. Section boundary  the tinted "how we work" band is now a gradient
 *      blend into/out of the surrounding background instead of a flat colour
 *      cut.
 *
 * Nothing here adds a claim the words didn't already make: the "10" counts up
 * to the same "Ten services" the paragraph beside it already states and
 * nothing else gets a number invented to give an effect something to count.
 * `prefers-reduced-motion` fully disables every item above, the same as the
 * first pass's reveals — see each component's own comment for how.
 */
export default function AboutPage() {
  // Four real projects, one per kind currently in the portfolio (video,
  // branding, app design, web design), each with a real thumbnail —
  // `PortfolioStrip` only ever renders `project.thumbnail`, so an entry
  // without one is skipped automatically rather than left blank.
  const featuredWork = ["throne-of-blood", "eyewear-campaign-identity", "cryptocurrency-app", "real-estate-website"]
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is (typeof projects)[number] => Boolean(p));

  return (
    <PageShell>
      <AboutIntro
        eyebrow="About"
        title="An AI-powered team, built around human specialists"
        description="Greatest Solutions builds and manages 10 AI-powered systems for growing businesses. AI accelerates the work throughout, but it doesn't run unsupervised. A specialist scopes it, a specialist ships it."
      />

      {/* ---- what we do ---------------------------------------------------- */}
      <Section spacing="compact">
        <div className="flex flex-col gap-8">
          <Reveal>
            <div className="flex flex-col gap-4">
              {/* The pulled-out "10" — decorative, `aria-hidden`, and not a new
                  fact: the paragraph beside it already says "Ten services" in
                  words. Fraunces display numerals are already the site's own
                  large-figure treatment (the roadmap step numbers, the FAQ
                  order marks), reused here rather than a new badge style.
                  `CountUp` gives this one real fact on the page its own
                  arrival moment — it counts up once, the moment it scrolls
                  into view, and settles on the same "10" that was here
                  statically before; nothing about what number appears or
                  what it means has changed. */}
              <div className="flex items-end gap-4">
                <span aria-hidden="true">
                  <CountUp to={10} className="font-display text-display-lg leading-none text-brand-emerald opsz-56" />
                </span>
                <h2 className="pb-1 text-heading-sm text-ink">What we do</h2>
              </div>
              <p className="max-w-[70ch] text-body-lg text-body">
                Ten services, each a system we build and then keep running: voice agents that answer
                and book, automation built around how a specific industry actually operates, lead
                follow-up measured in minutes, content and social output that stays on-brand across
                every platform, video and UGC, conversion copy, SEO content, full websites, email and
                brand systems, and investor-ready pitch decks. Every one of them is planned, built and
                QA&apos;d by a specialist: AI is how the work gets done faster, not who is doing it.
              </p>
            </div>
          </Reveal>

          <ServiceCapabilities services={services} />
        </div>
      </Section>

      {/* ---- how we work + why ai, why us ----------------------------------- *
       * A subtle tinted band for the section-to-section rhythm the rest of the
       * page otherwise lacks. The same "panel, not a full theme change" device
       * the site already uses (the dark `bg-ink` CTA panel on service detail
       * pages, the emerald-tinted workflow cards inside `AiHumanWorkflow`
       * itself), scaled up to a full section here rather than a new
       * background language invented for this page.
       *
       * The flat `bg-surface` block this used to be is now a gradient that
       * blends from the page's own `--color-background` up to `--color-surface`
       * and back down, rather than cutting straight from one flat colour to the
       * other at the section boundary — a purely static CSS change, so it costs
       * nothing under reduced motion and cannot shift layout.
       *
       * The soft emerald glow behind the two columns is the site's own ambient
       * motion — `gst-drift`/`gst-glow-pulse`, the exact keyframes `ServiceArt`
       * uses for the floating sculpture on `/services` and every service
       * masthead — reused here as a plain blurred shape with no illustration
       * asset, slower and dimmer than `ServiceArt`'s (14s/18s vs. 9s/12s, 8%
       * opacity vs. 32%) since this page is meant to be read closely, not to
       * hold a hero moment. `motion-safe:` is a CSS media-query variant, not a
       * JS check, so `prefers-reduced-motion` removes it before a single frame
       * paints — nothing to wire up per component. */}
      <div
        className="relative isolate overflow-hidden"
        style={{
          background:
            "linear-gradient(to bottom, var(--color-background), var(--color-surface) 96px, var(--color-surface) calc(100% - 96px), var(--color-background))",
        }}
      >
        <div
          aria-hidden="true"
          className={
            "pointer-events-none absolute top-0 right-[-10%] -z-10 size-[560px] rounded-full opacity-[0.08] blur-[96px] " +
            "bg-brand-emerald motion-safe:animate-[gst-drift_14s_ease-in-out_infinite]"
          }
        />
        <div
          aria-hidden="true"
          className={
            "pointer-events-none absolute bottom-0 left-[-10%] -z-10 size-[480px] rounded-full opacity-[0.06] blur-[96px] " +
            "bg-brand-emerald motion-safe:animate-[gst-glow-pulse_18s_ease-in-out_infinite]"
          }
        />

        <Section spacing="compact">
          <div className="flex flex-col gap-14">
            <div className="grid gap-10 tablet:grid-cols-2 tablet:gap-14">
              {/* `scaleFade` here, `blurFocus` on the column beside it — two
                  more presets from the diversified `lib/motion.ts` vocabulary,
                  so the two columns don't arrive as the same animation twice. */}
              <Reveal variant={scaleFade()}>
                <div className="flex flex-col gap-4">
                  <h2 className="text-heading-sm text-ink">How we work</h2>
                  <p className="max-w-[52ch] text-body-lg text-body">
                    Every project runs the same loop, whichever of the ten services it is. A specialist
                    scopes the problem and the plan before anything else starts. AI then accelerates the
                    drafting, iteration and repetitive production work, but a specialist directs it
                    throughout, not just at the end. Before anything ships, a specialist reviews it for
                    accuracy, quality and fit with your brand, and you sign off yourself. What we deploy
                    gets monitored and improved afterward rather than handed over and forgotten.
                  </p>
                </div>
              </Reveal>

              <Reveal variant={blurFocus()} reducedVariant={noBlur}>
                <div className="flex flex-col gap-4">
                  <h2 className="text-heading-sm text-ink">Why AI, why us</h2>
                  {/* The opening sentence carries the section's whole point, so it
                      gets the site's own emphasis treatment (brand colour, on its
                      own visual weight) rather than reading identically to the
                      sentences explaining it. Same words, same paragraph —
                      `AI is leverage for a human specialist, not a replacement
                      for one.` is copied verbatim from the original copy, not
                      reworded, just set apart. */}
                  <p className="max-w-[52ch] text-body-lg text-body">
                    <span className="font-medium text-brand-green">
                      AI is leverage for a human specialist, not a replacement for one.
                    </span>{" "}
                    It is what lets a small, focused team turn around ten different kinds of work at a
                    speed a purely manual process couldn&apos;t match, without skipping the judgment,
                    taste and accountability that only come from a person actually reviewing what goes
                    out. If AI drafted it, a person still checked it before you saw it.
                  </p>
                </div>
              </Reveal>
            </div>

            {/* The same six-step human+AI loop every `/services/[slug]` page
                ends with — literally the same component and the same real
                content, not a second version of it, so the sequence the
                paragraph above just described in prose is also shown the exact
                way a visitor may already have seen it elsewhere on the site.
                `ScrollSyncedWorkflow` wraps it to tie the active step to scroll
                position on this page only — see that component and the
                `activeIndex` note on `AiHumanWorkflow` itself for why the
                shared component's own rendering is unaffected everywhere else. */}
            <ScrollSyncedWorkflow />
          </div>
        </Section>
      </div>

      {/* ---- what we've built ------------------------------------------------ */}
      <Section spacing="compact">
        <div className="flex flex-col gap-8">
          <Reveal>
            <div className="flex flex-col gap-4">
              <h2 className="text-heading-sm text-ink">What we&apos;ve built</h2>
              <p className="max-w-[70ch] text-body-lg text-body">
                The work spans brand identity and product design, mobile and web applications, fintech
                and real-estate interfaces, e-commerce platforms, internal tools built on retrieval and
                automation, and short-form video and film production. Some of it is client work, some
                personal and internal builds; every project on the{" "}
                <Link href="/works" className="text-ink underline-offset-4 hover:underline">
                  work page
                </Link>{" "}
                says which, honestly, rather than presenting one as the other.
              </p>
            </div>
          </Reveal>

          {featuredWork.length > 0 && <PortfolioStrip projects={featuredWork} />}
        </div>
      </Section>

      {/* ---- working together ------------------------------------------------ */}
      <Section spacing="compact">
        <Reveal>
          <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-8 tablet:p-12">
            <h2 className="text-heading-sm text-ink">Working together</h2>
            <p className="max-w-[70ch] text-body-lg text-body">
              Pricing depends on the service and the scope. One-time builds (a website, a voice
              agent, a deck) are quoted per project. Ongoing services like SEO and content run as
              monthly retainers. Either way, you get the number before work starts, not after, and
              every service includes a defined post-launch support window before an optional ongoing
              arrangement takes over.
            </p>
          </div>
        </Reveal>
      </Section>
    </PageShell>
  );
}
