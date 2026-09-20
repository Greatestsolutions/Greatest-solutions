/**
 * Clients — `Section - Clients` in the reference.
 *
 * Three marquee rows of client wordmarks, beside (desktop) or below (tablet and
 * phone) a standard section header.
 *
 * Measured geometry, all breakpoints (WORKS-SECTION.md's sibling,
 * `CLIENTS-SECTION.md` §2): logos render 40px tall in a fixed-width cell —
 * **315px from 810 up, 262px below** — inside rows that are **143px tall from
 * 810 up and 120px below**. The third row carries an extra 122px of leading
 * space once per repeat, which is what stops all three rows sharing a rhythm.
 */

/**
 * Intrinsic widths are the authored ones; all share a 40px height. Names are
 * read off the rendered wordmark, not hidden behind an empty `alt` the way the
 * reference does it — "trusted by world-leading enterprises" is exactly the
 * claim a screen-reader user should be able to check, once a real name is
 * here to check it against.
 */
export interface ClientLogo {
  src: string;
  width: number;
  height: number;
  /** Real brand name, when known. Absent ⇒ decorative. */
  name?: string;
}

/**
 * EMPTY. This held eight of the template's own company names, displayed under
 * "Trusted by world-leading enterprises". None are Greatest Solutions clients,
 * and naming another company as a client is a claim about them as well as
 * about us, so the names are removed from the repository rather than left
 * dormant in a data file. Deliberately not listed here either, for the same
 * reason a removed name doesn't belong in a `git log` message about it — this
 * comment shouldn't be the one remaining place the eight names still appear.
 *
 * **This is the second time this array has been emptied.** A prior pass wrote
 * a note to that effect, then a later one — chasing visual parity with the
 * reference's measured row/name composition (see `LogoStrip.tsx`'s own
 * docblock) — reintroduced the template's names as "recovered" content,
 * apparently conflating "restore the layout" with "restore the data." The
 * layout and the data are independent: `LogoStrip` and `Marquee` render
 * whatever `clientRows` holds, empty or not, so matching the reference's
 * row/cell/ticker geometry never required matching its company names too. If
 * this section is rebuilt again, restore the MEASUREMENTS (`CELL_WIDTH`,
 * `ROW_3_LEAD`, `TICKER_PX_PER_SECOND`, all still below and still correct)
 * without also restoring the names that go with them.
 *
 * The `ClientLogo` shape and the `LogoStrip` component are intact; supplying
 * real logos here — `{ src: "/logos/<file>.svg", width, height: 40, name }`
 * per row, `public/logos/` recreated to hold the files — and re-adding one
 * line to the home page (`<LogoStrip />`, removed from `app/page.tsx`)
 * restores the section.
 */
export const clientRows: ClientLogo[][] = [];


/** Cell width, measured centre-to-centre: 315 from 810 up, 262 below. */
export const CELL_WIDTH = 315;
export const CELL_WIDTH_PHONE = 262;

/**
 * Extra leading space on the third row, once per repeat. In the reference the
 * row's repeating unit measures 1067 against the other rows' 945 — the 122px
 * difference is a padded group wrapper, and it is why row 3 never lines up with
 * rows 1 and 2.
 */
export const ROW_3_LEAD = 122;

/**
 * Ticker speed, measured: **35.0 px/s**, identical on every row and at every
 * breakpoint, with rows 1 and 3 travelling left and row 2 right.
 *
 * Establishing that took care — see `CLIENTS-SECTION.md` §4. Under swiftshader
 * the reference's always-on WebGL hero starves the page to ~4fps and its
 * delta-clamped ticker then reads 6.4 px/s. At a healthy frame rate it is 35.0
 * px/s in three consecutive runs.
 */
export const TICKER_PX_PER_SECOND = 35;

export const clientsEyebrow = "Our Clients";
export const clientsHeading = "Trusted by world-leading enterprises";
