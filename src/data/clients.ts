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

export interface ClientLogo {
  src: string;
  width: number;
  height: number;
  /** Real brand name, when known. Absent ⇒ decorative. */
  name?: string;
}


/**
 * Intrinsic widths are the authored ones; all share a 40px height.
 *
 * Names are read off the rendered wordmarks. The reference ships these with an
 * empty `alt`, i.e. decorative — but the logos plainly say who the clients are,
 * and "trusted by world-leading enterprises" is exactly the claim a screen-reader
 * user should be able to check, so they are named rather than hidden.
 */
/**
 * EMPTY. These were the template's client logos — Convergence, PictelAI, Ikigai
 * Labs, Warpspeed and the rest — displayed under "Trusted by world-leading
 * enterprises". They are not Greatest Solutions clients, and naming another
 * company as a client is a claim about them as well as about us, so the names
 * are removed from the repository rather than left dormant in a data file.
 *
 * The `ClientLogo` shape and the LogoStrip component are intact; supplying real
 * logos here and re-adding one line to the home page restores the section.
 */
const logo = (file: string, width: number, name: string): ClientLogo => ({
  src: `/logos/${file}.svg`,
  width,
  height: 40,
  name,
});

/**
 * Restored to the composition measured in Task 1 and documented in
 * CLIENTS-SECTION.md §3. Recovered from three independent sources that agree:
 *
 *   - the row/name table in CLIENTS-SECTION.md
 *   - occurrence order of each asset id in the reference export
 *   - each SVG's own intrinsic width at its native height of 40
 *
 * Four widths were already known from the previous implementation (Convergence
 * 174, PictelAI 137, Ikigai Labs 164, Warpspeed 167) and all four match the file
 * headers, which is what confirms the id → name mapping rather than assuming it.
 * Shutterframe appearing in both row 1 and row 3 is the reference's own repeat.
 *
 * These are the TEMPLATE's companies, not Greatest Solutions clients — see the
 * heading note below.
 */
export const clientRows: ClientLogo[][] = [
  [
    logo("rCopHS45uFREtoJVdUllJ4U", 179, "Shutterframe"),
    logo("kkZ9hCpkQW7znCXdCnsTymdu9g", 174, "Convergence"),
    logo("wfME2VRv8qA8gBIF57Qko4bmV4", 137, "PictelAI"),
  ],
  [
    logo("fi4CTiZZfE9JIXfc9wQk1COOzJU", 164, "Ikigai Labs"),
    logo("WRz0JN1ddTj3lNIUxdaXIpM9wY", 121, "CoreOS"),
    logo("ubr3DSYHDjwEKEceUmDwvXcixU", 167, "Warpspeed"),
  ],
  [
    logo("rCopHS45uFREtoJVdUllJ4U", 179, "Shutterframe"),
    logo("4hKgBUYdZ0ToaWulMQ6PhY8", 109, "Layers"),
    logo("TfJFy0iJtiu7qvVoLcaONayCIIo", 170, "Visionwork"),
  ],
];


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
