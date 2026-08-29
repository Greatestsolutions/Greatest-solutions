/**
 * The emerald material treatment for the service illustrations.
 *
 * A duotone ramp, not a paint layer. The previous approach multiplied a solid
 * emerald over the artwork, which by definition darkens *everything* it covers —
 * including the large near-white halo each illustration carries, which had been
 * invisible against the page and turned into a solid green blob.
 *
 * This maps LUMINANCE onto a green ramp instead:
 *
 * ```
 *   feColorMatrix  saturate 0        collapse the art to pure luminance
 *   feComponentTransfer (3 stops)    remap that luminance to a colour ramp
 *
 *     luminance 0.0  →  #0b3f20   deep forest, shadows and contours
 *     luminance 0.5  →  #1d8944   brand emerald, the main body
 *     luminance 1.0  →  #f4f8f5   near-white, the artwork's own highlights
 * ```
 *
 * Because the top of the ramp is near-white, the halo maps back to near-white and
 * disappears into the page — exactly where it started — while the sculpted mid
 * and shadow tones carry the emerald. That is what keeps the 3D form: the
 * artwork's highlights, shadows and contours all survive as distinct values
 * rather than collapsing to one flat green.
 *
 * `color-interpolation-filters="sRGB"` is required. The SVG default is linearRGB,
 * which shifts the mid-tones noticeably lighter and washes the emerald out.
 *
 * Rendered once and referenced by `filter: url(#gst-emerald)`; the element itself
 * paints nothing.
 */
export function EmeraldFilter() {
  return (
    <svg aria-hidden="true" focusable="false" className="pointer-events-none absolute size-0">
      <defs>
        <filter id="gst-emerald" colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            {/*
              Five stops, deliberately weighted rather than evenly spaced. The
              source art averages luminance 0.74, so an even 3-stop ramp put most
              of the sculpture in its top half and the result read mint. Holding
              forest→emerald across the first four stops keeps the body on brand
              and reserves near-white for the top quarter only — which is also
              where the halo sits, so it still disappears into the page.

                0.00  #0b3f20  forest      shadows and contours
                0.25  #14602f  deep        lower mid-tones
                0.50  #1d8944  emerald     main body
                0.75  #5aa877  soft green  upper mid-tones
                1.00  #f4f8f5  near-white  true highlights
            */}
            <feFuncR type="table" tableValues="0.043 0.078 0.114 0.353 0.957" />
            <feFuncG type="table" tableValues="0.247 0.376 0.537 0.659 0.973" />
            <feFuncB type="table" tableValues="0.125 0.184 0.267 0.467 0.961" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}
