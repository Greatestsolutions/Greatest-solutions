"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { FilterPill } from "@/components/works/FilterPill";
import { Input } from "@/components/ui/Input";
import { WorksGrid } from "@/components/works/WorksGrid";
import { projects, type Project } from "@/data/works";

/**
 * The `/works` index.
 *
 * Owns the search — the field, the keyword chips, the result count and the empty
 * state — and hands whatever survives filtering to {@link WorksGrid}, which
 * renders it as a plain wrapping grid.
 *
 * The split is deliberate: this component knows about querying and nothing about
 * presentation; the carousel knows how to show projects and nothing about where
 * they came from. Swapping the presentation again means replacing one child —
 * which is exactly what happened when the scroll-driven stack became this.
 *
 * `Works.tsx`, its `placements[]` and `WorksParallax` are untouched and unimported
 * — the homepage section is not involved in this file in any way.
 *
 * A Client Component, because the search is client-side: six projects is far too
 * few to justify a round trip, and filtering an array this size is instant.
 */

/**
 * The quick-search keywords.
 *
 * Every one is a real value from the works data, and every one returns more than
 * one project — the only four in the set that do:
 *
 *   Python        3   PriceWatch · LinkedIn Job Scraper · FlipSense
 *   RAG           2   DocChat AI · PolicAI
 *   Web Scraping  2   PriceWatch · LinkedIn Job Scraper
 *   Automation    2   PriceWatch · LinkedIn Job Scraper
 *
 * There is no fifth worth adding. The only value that would widen coverage is
 * "Front-end", which reaches exactly one project (ComixHub) — a one-result chip
 * advertises a filter that barely filters, so it is left out rather than padded
 * to five. Revisit once the portfolio grows.
 */
const KEYWORDS = ["Python", "RAG", "Web Scraping", "Automation"] as const;

/**
 * One lowercase haystack per project, built once.
 *
 * Covers title, description, category, tags and technologies — the fields a
 * visitor would plausibly type. `type` rides along too, so "personal" or
 * "internal" also finds things. `fullDescription` is deliberately excluded: it is
 * a paragraph of prose, and searching it makes short queries match almost
 * everything, which reads as a broken filter rather than a generous one.
 */
const haystack = (p: Project) =>
  [p.title, p.description, p.category, p.type, ...p.tags, ...p.technologies].join(" ").toLowerCase();

const INDEX = new Map(projects.map((p) => [p.slug, haystack(p)]));

export function WorksIndex() {
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();
  const results = useMemo(
    () => (term ? projects.filter((p) => INDEX.get(p.slug)?.includes(term)) : projects),
    [term],
  );

  /* A chip is pressed when the box holds exactly its keyword — so typing the word
     by hand lights the chip too, and editing the text afterwards unlights it. */
  const pressed = (keyword: string) => term === keyword.toLowerCase();

  return (
    <Section spacing="compact" container={false}>
      <Container className="flex flex-col gap-12 tablet:gap-16">
        {/* ---- search ------------------------------------------------------ */}
        <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-4">
          <div className="relative w-full">
            <SearchIcon />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search projects, tools and techniques"
              aria-label="Search projects"
              // Room for the icon on the left and the clear control on the right.
              // `[&::-webkit-search-cancel-button]:hidden` removes Chrome's own
              // clear affordance, which would sit beside ours and do the same job.
              className="w-full pr-11 pl-10 [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted transition-colors duration-[var(--duration-quick)] hover:bg-scrim-06 hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
              >
                <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true" focusable="false">
                  <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {KEYWORDS.map((keyword) => (
              <FilterPill
                key={keyword}
                pressed={pressed(keyword)}
                /* Pressing an active chip clears it, so the same control that
                   applied the filter also removes it. */
                onClick={() => setQuery(pressed(keyword) ? "" : keyword)}
              >
                {keyword}
              </FilterPill>
            ))}
          </div>

          {/* Announced, so a keyboard or screen-reader user learns the result
              count changed without having to go looking for the list. */}
          <p aria-live="polite" className="text-body-sm text-muted">
            {term
              ? `${results.length} of ${projects.length} ${results.length === 1 ? "project" : "projects"} matching “${query.trim()}”`
              : `${projects.length} projects`}
          </p>
        </div>

        {results.length === 0 ? (
          <EmptyState query={query.trim()} onClear={() => setQuery("")} />
        ) : (
          /*
            The results, now inside the Container rather than full-bleed beside
            it: the carousel sat outside because its peeking cards ran to the
            viewport edges, and a grid has no peeking cards — it should stop at
            the same max-width column as the search above it.

            It renders straight from `results`, so a chip or a keystroke
            re-renders it with just those projects. No `key` remount either: that
            existed only to reset the carousel's `activeIndex` to the first match,
            and a grid holds no such state to reset. Zero results renders the
            empty state instead.
          */
          <WorksGrid projects={results} />
        )}
      </Container>
    </Section>
  );
}

/**
 * Nothing matched. States plainly what happened and what to do about it — no
 * spinner, no illustration, no "oops".
 */
function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-[var(--radius-lg)] border border-black/8 bg-surface p-8 tablet:p-12">
      <p className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
        No matches
      </p>
      <p className="max-w-[56ch] text-body-lg text-body">
        Nothing in the work matches “{query}”. The portfolio is six projects deep, so a
        narrow term will often come back empty — try a broader one, or clear the search to
        see everything.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="cursor-pointer text-body-md font-medium text-ink underline underline-offset-4 transition-colors duration-[var(--duration-quick)] hover:text-brand-green focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
      >
        Clear search
      </button>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
    >
      <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
