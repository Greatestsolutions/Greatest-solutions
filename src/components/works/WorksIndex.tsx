"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { FilterPill } from "@/components/works/FilterPill";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { WorksGrid } from "@/components/works/WorksGrid";
import { projects, type Project } from "@/data/works";

/**
 * The `/works` index.
 *
 * Owns the search — the field, the keyword chips, the result count and the empty
 * state — plus how much of the result set is revealed, and hands the revealed
 * slice to {@link WorksGrid}, which renders it as a plain wrapping grid.
 *
 * Both pieces of state live here for the same reason: filtering and revealing
 * interact (a new filter resets the reveal), so splitting them across two
 * components would mean synchronising them across a boundary.
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
 * Rebuilt from scratch once the six placeholder/sample entries (PriceWatch,
 * DocChat AI, PolicAI, LinkedIn Job Scraper, FlipSense, ComixHub) were
 * retired — the previous set (Python, RAG, Web Scraping, Automation) was
 * built entirely around tags and technologies belonging to those six, and
 * none of it survives them: a click on any of the four would have returned
 * either zero results or, worse, real projects that were never actually
 * tagged with the term.
 *
 * Same principle as before — a real `tags[]` value that matches 2+ projects,
 * `technologies[]` checked too but empty on every current entry — with one
 * addition: preferring values that don't just restate a bigger chip. Three
 * qualify:
 *
 *   App Design      9   Cryptocurrency App · Cricket Live App · Accounting
 *                       Desktop App · Food Delivery Branding · Streaming
 *                       Service Identity · Trading Platform · Automotive
 *                       Services · Accounting Mobile App · E-commerce Store
 *   Brand Identity  7   Eyewear Campaign Identity · Fitness Product Branding
 *                       · Playful Toy Branding · Skincare Identity Design ·
 *                       Food Delivery Branding · Streaming Service Identity
 *                       · Digital Design Agency
 *   Web Design      2   Real Estate Website · Digital Design Agency
 *
 * Three more real values clear the 2+ bar — "Fintech UI" (Cryptocurrency App,
 * Trading Platform), "Financial Tools" (the two Accounting entries) and
 * "Packaging" (the two branding-with-packaging entries) — but each is a pure
 * subset of a chip already above it: every project either would match, App
 * Design or Brand Identity already surfaces. A chip that never adds a result
 * the bigger one didn't already give is the same "barely filters" problem
 * the old one-result "Front-end" value was left out for, so these are left
 * out too rather than padded on to hit five. "Web Design" clears the same bar
 * cleanly: neither of its two projects carries "App Design" or "Brand
 * Identity", so it is the one addition that actually widens coverage.
 *
 * Three chips, not the four this replaces — the honest count once forcing a
 * fourth meant picking a value that duplicates one already there.
 */
const KEYWORDS = ["App Design", "Brand Identity", "Web Design"] as const;

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

/**
 * How many cards are shown before "View more", and how many each press adds.
 *
 * Six — two full rows of the three-column desktop grid. A batch that ends
 * mid-row would leave a ragged edge above the button at exactly the width most
 * people see the page at, and two rows is enough to establish the grid as a grid
 * before asking anyone to press anything.
 *
 * One constant for both the first batch and each subsequent one, deliberately:
 * "show me more" should mean the same amount every time it is pressed.
 *
 * At six projects this means the button never appears, which is correct rather
 * than untested — the whole control is provisioned for a portfolio that has
 * outgrown one screen, and it starts working the moment a seventh project is
 * added to `works.ts`, with no code change.
 */
const INITIAL_BATCH = 6;

export function WorksIndex() {
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();
  const results = useMemo(
    () => (term ? projects.filter((p) => INDEX.get(p.slug)?.includes(term)) : projects),
    [term],
  );

  const [revealed, setRevealed] = useState(INITIAL_BATCH);

  /*
   * Reset the reveal when the query changes.
   *
   * Adjusting state during render rather than in an effect: React discards this
   * pass and re-runs with the new value before anything is committed, so the
   * browser never paints the wrong number of cards. An effect would paint the
   * stale count first and correct it a frame later — visible as a flash of
   * twelve results collapsing to four, and, worse, a wave of flips starting on
   * cards that are about to be removed.
   *
   * `lastTerm` is compared rather than watched, which is what makes this cover
   * both directions the brief calls out: a narrower filter cannot carry a
   * "12 revealed" state into four matches, and a broader one cannot stay
   * under-revealed, because every change lands back on exactly INITIAL_BATCH.
   */
  const [lastTerm, setLastTerm] = useState(term);
  if (term !== lastTerm) {
    setLastTerm(term);
    setRevealed(INITIAL_BATCH);
  }

  const visible = useMemo(() => results.slice(0, revealed), [results, revealed]);
  const hidden = results.length - visible.length;

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
          {/* The "· showing N" clause appears only while something is held back,
              so the sentence is unchanged at the six-project size and the reveal
              is what introduces it. It also gives the live region something to
              announce when "View more" is pressed — otherwise a screen-reader
              user gets cards appended with no indication anything happened. */}
          <p aria-live="polite" className="text-body-sm text-muted">
            {term
              ? `${results.length} of ${projects.length} ${results.length === 1 ? "project" : "projects"} matching “${query.trim()}”`
              : `${projects.length} projects`}
            {hidden > 0 ? ` · showing ${visible.length}` : ""}
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

            It receives `visible`, not `results` — the grid renders what is
            revealed and knows nothing about the rest. That is also what keeps the
            flip wave correct across a reveal: the wave is keyed on the slugs it
            was handed, so twelve cards arriving restarts it over the full twelve
            rather than continuing to cycle the original six.
          */
          <WorksGrid projects={visible} />
        )}

        {/*
          Only while something is actually held back — the control is absent, not
          disabled, when there is nothing more to show. A permanently dead "View
          more" advertises content that does not exist.

          A real <button>: this reveals what is already on the client, so there is
          no URL to link to and nothing to navigate.
        */}
        {hidden > 0 ? (
          <div className="flex justify-center">
            <Button onClick={() => setRevealed((shown) => shown + INITIAL_BATCH)}>
              View more
              {/* The count rides in the accessible name rather than the visible
                  label — it costs no layout and tells a screen-reader user what
                  pressing this will actually do. An `sr-only` child rather than
                  an `aria-label` prop, because `ButtonProps` is a closed list and
                  widening the shared component for one caller is the wrong trade. */}
              <span className="sr-only"> projects, {hidden} remaining</span>
            </Button>
          </div>
        ) : null}
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
        Nothing in the work matches “{query}”. The portfolio is {projects.length} projects deep,
        so a narrow term will often come back empty. Try a broader one, or clear the search
        to see everything.
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
