import Image from "next/image";
import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Marquee } from "@/components/ui/Marquee";
import {
  CELL_WIDTH,
  CELL_WIDTH_PHONE,
  clientRows,
  clientsEyebrow,
  clientsHeading,
  ROW_3_LEAD,
  TICKER_PX_PER_SECOND,
  type ClientLogo,
} from "@/data/clients";

/**
 * Clients — a section header beside three drifting rows of client wordmarks.
 *
 * A Server Component. The animation is pure CSS, so this ships no JavaScript.
 *
 * ## What this section is, measured (CLIENTS-SECTION.md)
 *
 * ```
 *   ≥1200   Container is a ROW, gap 10, aligned to the top
 *           header 520 fixed · logo block takes the remainder (766 at 1440)
 *           block 461 tall, rows 143 with a 16px gap
 *   810…1199 Container is a COLUMN, gap 32
 *           header 520 · block full width, 429 tall, rows 143, gap 0
 *   ≤809    Container is a COLUMN, gap 56, padding 48 top / 80 bottom
 *           header full width · block full-bleed, 360 tall, rows 120, gap 0
 * ```
 *
 * **The earlier implementation of this section was wrong, not merely
 * incomplete.** It rendered a small mono "Our Clients" label and no heading at
 * all, so the section's whole left column — an eyebrow pill plus a 56px Fraunces
 * `h2` reading "Trusted by world-leading enterprises" — was missing, and the
 * logo block was a full-bleed strip rather than a sized column. It also bypassed
 * `SectionHeader`, which reproduces the reference's header exactly: the measured
 * pill is 123x28 with a 6/12 padding, 8px gap and 999px radius, and the h2 is
 * Fraunces 56/60/−0.04em at 520 wide, dropping to 44/48 below 810. That is
 * `SectionHeader` with `Pill size="eyebrow"`, unmodified.
 *
 * ## The rows
 *
 * Each row is a `Marquee` whose cells are a fixed width and whose logos are 40px
 * tall. Speed is **35.0 px/s** on every row at every breakpoint — measured, and
 * the same number the reference uses for all three; only the direction alternates
 * (left, right, left). Because our marquee translates by one copy's width, the
 * duration has to be derived from that width rather than shared, which is what
 * `duration()` below does.
 *
 * The radial mask on the block is what stops the rows reading as a generic logo
 * ticker: they dissolve toward every edge, so the repeat never announces itself
 * and there is no hard boundary against the page.
 */

/**
 * One copy of a row must be at least this wide, or the loop empties: the
 * animation translates by exactly one copy, so a copy narrower than its
 * container leaves the tail of every cycle blank. The widest this block ever
 * gets is 960px, at 1024.
 */
const MIN_COPY_WIDTH = 1000;

/** Repeats needed so one copy clears {@link MIN_COPY_WIDTH} at the narrower cell. */
const copiesFor = (row: ClientLogo[]) =>
  Math.max(2, Math.ceil(MIN_COPY_WIDTH / (row.length * CELL_WIDTH_PHONE)));

/**
 * Seconds for one copy to travel its own width at the measured speed.
 *
 * Two values per row, because the cell narrows on phone: a single duration would
 * mean the phone rows drift at a different speed from the desktop ones, which the
 * reference does not do.
 */
const duration = (row: ClientLogo[], cell: number, lead: number) =>
  `${((copiesFor(row) * (row.length * cell + lead)) / TICKER_PX_PER_SECOND).toFixed(2)}s`;

export function LogoStrip() {
  return (
    <Section
      id="logos"
      aria-labelledby="clients-title"
      // Phone padding is 48 top / 80 bottom, not the symmetric 64 the scale
      // gives — measured at 320, 375, 390, 430 and 768.
      className="overflow-hidden max-tablet:pt-12 max-tablet:pb-20"
    >
      {/*
        Column below 1200, row above it. The gaps are the reference's own three:
        56 on phone, 32 on tablet, 10 between the two desktop columns.
      */}
      {/*
        `desktop:items-center` — not the reference's `flex-start` — is the one
        deliberate deviation in this section, and it is a one-property change.

        The heading block is 164 tall beside a 461 tall logo field, so aligning to
        the top left its centre at 162 while the middle ticker row's centre sits at
        310.5: a 148.5px offset that read as an isolated left column parked above
        the logos. Centring puts it on 310.5 exactly.

        It works out cleanly because the field is symmetric: three 143px rows with
        two 16px gaps means the middle row's centreline (159 + 71.5 = 230.5 from
        the block's top) IS the block's own centreline (461 / 2 = 230.5). Aligning
        to the container therefore aligns to row 2 — no offset, no magic number,
        and nothing to re-derive if the rows ever change size together.

        Desktop only. Below 1200 the composition is a column and is untouched.
      */}
      <div className="flex flex-col gap-14 tablet:gap-8 desktop:flex-row desktop:items-center desktop:gap-2.5">
        {/*
          `max-w-[520px]` at every width, not just from tablet up: the reference
          holds the 520 cap at 768 too, where the container is 744 wide.
        */}
        <SectionHeader
          id="clients-title"
          eyebrow={clientsEyebrow}
          title={clientsHeading}
          className="max-w-[520px] desktop:w-[520px] desktop:shrink-0"
        />

        {/*
          The logo block. Full-bleed to the 12px page edge on phone — the same
          −12px correction Works and Blog use, because the reference insets its
          text by 12 more than its media. `min-w-0` so the flex child may shrink
          below the intrinsic width of a marquee row.
        */}
        <div
          data-logo-block
          className={
            "relative min-w-0 flex-1 overflow-clip max-tablet:-mx-3 " +
            // The mask is the section's signature: an ellipse at half the block's
            // width and height, opaque to 37.2009% and clear by 99.1818%. Measured
            // identical at every breakpoint.
            "[mask-image:radial-gradient(ellipse_50%_50%_at_center,black_37.2009%,transparent_99.1818%)] [mask-mode:alpha]"
          }
        >
          <div className="flex flex-col tablet:gap-0 desktop:gap-4">
            {clientRows.map((row, index) => {
              const lead = index === 2 ? ROW_3_LEAD : 0;
              return (
                <Marquee
                  key={index}
                  // Rows 1 and 3 travel left, row 2 right — measured.
                  reverse={index === 1}
                  // Set through CSS rather than the inline prop so the duration
                  // can change with the cell width at 810. See Marquee's note.
                  className="[--marquee-duration:var(--dur-phone)] tablet:[--marquee-duration:var(--dur-wide)]"
                  style={
                    {
                      "--dur-phone": duration(row, CELL_WIDTH_PHONE, lead),
                      "--dur-wide": duration(row, CELL_WIDTH, lead),
                    } as React.CSSProperties
                  }
                >
                  {Array.from({ length: copiesFor(row) }, (_, copy) => (
                    <div
                      key={copy}
                      // Row 3's repeating unit carries 122px of leading space in
                      // the reference — 1067 against the other rows' 945.
                      className={cellGroup(index === 2)}
                    >
                      {row.map((logo, position) => (
                        <LogoCell
                          key={`${logo.src}-${position}`}
                          logo={logo}
                          // Only the first pass is announced; the repeats exist
                          // to fill the loop.
                          decorative={copy > 0}
                        />
                      ))}
                    </div>
                  ))}
                </Marquee>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}

const cellGroup = (leading: boolean) => (leading ? "flex shrink-0 pl-[122px]" : "flex shrink-0");

function LogoCell({ logo, decorative }: { logo: ClientLogo; decorative?: boolean }) {
  return (
    // Cell 262 x 120 on phone, 315 x 143 from 810 up — both measured. The height
    // is on the cell rather than the row so the row is exactly its content.
    <div data-logo-cell className="flex h-[120px] w-[262px] shrink-0 items-center justify-center tablet:h-[143px] tablet:w-[315px]">
      <Image
        src={logo.src}
        alt={decorative ? "" : (logo.name ?? "")}
        width={logo.width}
        height={logo.height}
        // SVG: the optimizer cannot improve a 2–4 KB vector, and Next refuses to
        // process SVG without `dangerouslyAllowSVG`.
        unoptimized
        className="h-10 w-auto"
      />
    </div>
  );
}
