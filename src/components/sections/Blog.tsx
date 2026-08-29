import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { BlogCard } from "@/components/blog/BlogCard";
import { site } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { articles, blogCta, blogEyebrow, blogTitle } from "@/data/blog";

/**
 * Insights — three article cards under a header with a right-aligned CTA.
 *
 * A Server Component; no client JavaScript. The card hover is CSS.
 *
 * Measured layout (3.2c pass):
 *
 *   desktop  header row space-between, CTA bottom-right · 3 cards, 416, gap 24
 *   tablet   same header row · **2 cards**, 361, gap 24 — the third is dropped
 *   phone    header column, centred, gap 32 (CTA below) · 3 cards stacked, gap 24
 *
 * Container padding 80/64 · 72/24 · 36/0, and the header→content gap steps
 * 72 · 72 · 48.
 *
 * **The tablet band shows only two articles.** That is the reference's own
 * behaviour, not a wrap artifact: at 810 its row contains two cards, not three
 * that wrapped. Reproduced by hiding the third rather than letting it wrap,
 * because a wrapped third card would leave a half-empty row.
 */
export function Blog({ showHeader = true, showCta = true }: { showHeader?: boolean; showCta?: boolean } = {}) {
  return (
    <Section
      id="insights"
      label={blogEyebrow}
      spacing="default"
      // Phone padding is 36 top and bottom here, not the shared 64 — measured.
      className="max-tablet:py-9"
    >
      <div className="flex flex-col gap-12 tablet:gap-[72px]">
        {/*
          One row on tablet and up with the CTA pinned to the header's baseline
          (`items-end`, measured); a centred column on phone.
        */}
        {(showHeader || showCta) && (
        <div className="flex flex-col items-center gap-8 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-0">
          {showHeader && (
          <SectionHeader
            eyebrow={blogEyebrow}
            align="start"
            // Explicit width from tablet up: inside a `justify-between` row the
            // header would otherwise shrink to its text and the heading column
            // would read 342 instead of the measured 520.
            className="max-tablet:items-center max-tablet:text-center tablet:w-[520px] tablet:shrink-0"
            title={
              <>
                {blogTitle[0]}
                <br className="max-tablet:hidden" /> {blogTitle[1]}
              </>
            }
          />
          )}
          {showCta && (
            <Button href="/blog" tone="light">
              {blogCta}
            </Button>
          )}
        </div>
        )}

        {articles.length === 0 ? (
          /* Honest empty state. The grid, cards and hover zoom are all still here —
             they simply have nothing to render until real articles exist. */
          <div className="flex flex-col items-start gap-6 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-8 tablet:p-12">
            <p className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
              Coming soon
            </p>
            <p className="max-w-[56ch] text-body-lg text-body">We have not published anything yet. When we do, it will appear here.</p>
            <Button href={`mailto:${site.email}`} size="lg">
              Email us
            </Button>
          </div>
        ) : (
        <ul className="grid gap-6 max-tablet:-mx-3 tablet:grid-cols-2 desktop:grid-cols-3">
          {articles.map((article, i) => (
            <BlogCard
              key={article.slug}
              article={article}
              // Visible on phone, hidden through the 810–1199 band, back at
              // 1200. `desktop:` wins over `tablet:` above 1200 because it is
              // the larger min-width.
              className={i === 2 ? "tablet:hidden desktop:flex" : undefined}
            />
          ))}
        </ul>
        )}
      </div>
    </Section>
  );
}
