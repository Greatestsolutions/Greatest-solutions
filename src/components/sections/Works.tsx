import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { site } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/works/ProjectCard";
import { WorksParallax } from "@/components/works/WorksParallax";
import { projects, worksCta, worksEyebrow, worksTitle } from "@/data/works";

/**
 * Featured work — four projects on a staggered 12-column grid, with a link to
 * the full `/works` listing below.
 *
 * `/works` grew to twelve entries (six real, six `-2` duplicates added to
 * exercise its own pagination) — showing all twelve here made the homepage an
 * excessively long scroll for what is meant to be a teaser. `FEATURED_COUNT`
 * caps it back down, and the `-2` slugs are filtered out first: they exist
 * only to test `/works`'s "View more" and have nothing to feature.
 *
 * This file has exactly one caller (the homepage) — `/works` builds its own
 * listing from `WorksIndex`/`WorksGrid` and does not import this component,
 * so the slice below affects nothing else.
 *
 * A Server Component. The only client code in the section is `WorksParallax`,
 * which owns no markup: it wraps the list and writes one custom property per card.
 *
 * ## The grid, measured (WORKS-SECTION.md §3)
 *
 * The reference builds this as a 12-column grid with a 12px column gap, no row
 * gap, and zero-opacity spacer cells filling the tracks each project leaves
 * empty. The spacers are pure Framer bookkeeping — auto-placement needs something
 * to occupy the gaps — so they are not reproduced; explicit column and row
 * placement says the same thing without shipping six empty divs.
 *
 *   project     column     span   margin-top
 *   Rivermark        9        4         −72
 *   Fluxa            1        5        −230
 *   River            7        4        −120
 *   Season           2        5        +180
 *   AXN              9        4        −180
 *   Nova             1        4        −120
 *
 * **The offsets are what produces the woven look.** Each card is taller than its
 * grid row by exactly that amount and hangs out of the top of it, so consecutive
 * cards overlap vertically. Reproduced here as a margin: an auto-sized row tracks
 * the item's *margin* box, so `margin-top: −72px` gives a 626px row around a 698px
 * card whose bottom edge still lands on the row's — which is precisely what the
 * reference measures (bottom delta 0 on all six, at every desktop width).
 *
 * They are **fixed pixels, not a ratio**: identical at 1280, 1366, 1440, 1600 and
 * 1920 while the cards themselves scale with the column. Season's is positive and
 * the reference expresses it as padding rather than an offset; same result.
 *
 * ## Responsive
 *
 *   ≥1200   12 columns · col-gap 12 · row-gap 0 · staggered, cards overlap
 *   810…1199 2 equal columns · gap 24 both ways · no stagger
 *   ≤809    1 column · row gap 42 · no stagger
 *
 * The stagger exists only on desktop; tablet and phone measure a flat grid with
 * every card the same size, so `desktop:` carries all of it.
 *
 * ## Rhythm
 *
 * Container padding 80/64 · 72/24 · 36 top and 64 bottom on phone — the last is
 * asymmetric in the reference and reproduced rather than normalised. The gap
 * between the header block and the grid steps 0 · 64 · 56: zero on desktop is not
 * a mistake, the header occupies columns 1–8 and the first card sits beside it in
 * 9–12.
 */
/** How many projects the homepage teaser shows before pointing to `/works`. */
const FEATURED_COUNT = 4;

export function Works({
  showHeader = true,
}: {
  showHeader?: boolean;
} = {}) {
  /*
   * Real projects first, `-2` duplicates last, then take the first
   * FEATURED_COUNT. `projects` in `data/works.ts` is already ordered that way
   * (all six real entries before any duplicate), so this is a plain slice —
   * but filtering by slug rather than assuming the array's order stays that
   * way is what makes "prioritise the real ones" true by construction instead
   * of by coincidence of authoring order.
   */
  const featured = projects
    .filter((project) => !project.slug.endsWith("-2"))
    .slice(0, FEATURED_COUNT);

  return (
    <Section
      id="work"
      label={worksEyebrow}
      spacing="default"
      // Phone padding is 36 top / 64 bottom here, not the symmetric 64 the scale
      // gives — measured at 320, 375, 390, 430 and 768.
      className="max-tablet:pt-9 max-tablet:pb-16"
    >
      <div className="flex flex-col gap-14 tablet:gap-16 desktop:gap-0">
        {showHeader && (
        <SectionHeader
          eyebrow={worksEyebrow}
          title={worksTitle}
          /*
            Greedy wrapping, not the global `text-wrap: balance`.

            Targeted at the child rather than set to inherit: `text-wrap` IS an
            inherited property, but globals.css declares `balance` on the h2
            itself, and a declaration on the element always beats an inherited
            value. Written as a child selector so SectionHeader's API does not
            grow a prop for one caller.

            This heading is the only one on the page long enough for the two to
            disagree, and the reference's line boxes are measured: 490 / 504 / 343
            at 1440 and 810. Greedy reproduces those exactly; balanced gives
            378 / 447 / 510 and breaks after "projects" instead of "built".

            Deliberately NOT fixed by dropping the global rule. Removing it also
            moves the Blog, FAQ and footer headings at 390, and in the reference
            those three break on an explicit <br> rather than on wrapping at all —
            a separate question belonging to those sections. Recorded in
            FOUNDATION.md for the final parity audit.
          */
          className="[&>h2]:[text-wrap:wrap]"
          // Measured 32px below the title block; SectionHeader's own 16px column
          // gap supplies half of it, which is what `actions` accounts for.
          actions={
            <Button href={`mailto:${site.email}`} tone="dark">
              {worksCta}
            </Button>
          }
        />
        )}

        {featured.length === 0 ? (
          /* Honest empty state. The grid, cards and parallax are all still here —
             they simply have nothing to render until real projects exist. */
          <div className="flex flex-col items-start gap-6 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-8 tablet:p-12">
            <p className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
              Coming soon
            </p>
            <p className="max-w-[56ch] text-body-lg text-body">Selected work is being prepared for publication. If you would like to talk about a project in the meantime, email us directly.</p>
            <Button href={`mailto:${site.email}`} size="lg">
              Email us
            </Button>
          </div>
        ) : (
        <>
        <WorksParallax>
          <ul
            className={
              // Phone: one column, 42px between cards. Tablet: two columns, 24
              // both ways. Desktop: the 12-track staggered grid, no row gap —
              // the offsets on each card do the vertical spacing.
              "grid gap-y-[42px] max-tablet:-mx-3 " +
              "tablet:grid-cols-2 tablet:gap-6 " +
              "desktop:grid-cols-12 desktop:gap-x-3 desktop:gap-y-0"
            }
          >
            {featured.map((project, i) => (
              <ProjectCard
                key={project.slug}
                project={project}
                className={placements[i] ?? fallbackPlacement}
              />
            ))}
          </ul>
        </WorksParallax>

        {/* The teaser's way out to the full listing. `tone="light"` is the
            site's own secondary-action pattern — the same tone Blog's "View
            all Articles" uses to link to its own archive — so this reads as
            the section's second action rather than competing with the
            header's "Book an intro call". Centred below the grid, matching
            the "View more" control `/works` itself uses under its own grid.

            Margin, not the parent flex's `gap`: that gap is shared with the
            header-to-grid space above, which is deliberately 0 at desktop
            (the header sits beside the first row of cards there). This is a
            different relationship — after the LAST row, with no card beside
            it to share space with — so it earns its own real gap at every
            width instead of inheriting a value tuned for a different pair. */}
        <div className="flex justify-center pt-14 tablet:pt-16 desktop:pt-16">
          <Button href="/works" tone="light">
            Show all works
          </Button>
        </div>
        </>
        )}
      </div>
    </Section>
  );
}

/**
 * Desktop placement, by slot rather than by project: the woven pattern belongs to
 * the layout, so reordering `projects` keeps it intact. Written as literal class
 * strings because Tailwind resolves them at build time and cannot see a value
 * assembled at runtime.
 *
 * Rows are explicit. With only a column declared, auto-placement would put River
 * beside Fluxa — a definite column does not stop the algorithm filling a row it
 * still has room in.
 *
 * ## Why this list was extended rather than cycled
 *
 * It used to hold exactly six, indexed directly, so a seventh project read
 * `placements[6]` as `undefined` and lost its desktop placement silently. The
 * obvious repair — `placements[i % placements.length]` — is the one thing that
 * must NOT be done here: every entry pins an explicit `row-start`, so slot 7
 * would be placed into row 1 on top of slot 1. Two items explicitly assigned the
 * same grid cell overlap, which is a worse failure than the one being fixed, and
 * a silent one at desktop width only.
 *
 * So the weave is written out to twelve, continuing the same rhythm: alternating
 * sides, spans of 4 and 5, and offsets in the same range. Rows stay unique and
 * monotonic, which is the property that makes the whole thing safe.
 *
 * Beyond twelve, `fallbackPlacement` takes over — see below.
 */
const placements = [
  "desktop:col-start-9 desktop:col-span-4 desktop:row-start-1 desktop:mt-[-72px]",
  "desktop:col-start-1 desktop:col-span-5 desktop:row-start-2 desktop:mt-[-230px]",
  "desktop:col-start-7 desktop:col-span-4 desktop:row-start-3 desktop:mt-[-120px]",
  "desktop:col-start-2 desktop:col-span-5 desktop:row-start-4 desktop:mt-[180px]",
  "desktop:col-start-9 desktop:col-span-4 desktop:row-start-5 desktop:mt-[-180px]",
  "desktop:col-start-1 desktop:col-span-4 desktop:row-start-6 desktop:mt-[-120px]",
  "desktop:col-start-8 desktop:col-span-4 desktop:row-start-7 desktop:mt-[-150px]",
  "desktop:col-start-2 desktop:col-span-5 desktop:row-start-8 desktop:mt-[-200px]",
  "desktop:col-start-9 desktop:col-span-4 desktop:row-start-9 desktop:mt-[-100px]",
  "desktop:col-start-1 desktop:col-span-5 desktop:row-start-10 desktop:mt-[160px]",
  "desktop:col-start-7 desktop:col-span-4 desktop:row-start-11 desktop:mt-[-190px]",
  "desktop:col-start-2 desktop:col-span-4 desktop:row-start-12 desktop:mt-[-110px]",
];

/**
 * Slot 13 and beyond.
 *
 * A span with no `col-start` and no `row-start`, so the card is auto-placed. It
 * leaves the weave — this is a plain flow position, not a woven one — but
 * auto-placement finds free space by definition, so it can never land on top of
 * an explicitly placed card the way a cycled entry would.
 *
 * The right fix for a thirteenth project is another line in `placements`. This
 * only guarantees that forgetting to add one degrades to "not woven" instead of
 * to "unstyled" or "overlapping".
 */
const fallbackPlacement = "desktop:col-span-4";
