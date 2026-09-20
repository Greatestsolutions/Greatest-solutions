import type { ReactElement } from "react";

/**
 * The four social marks used in the footer.
 *
 * A DELIBERATE, SCOPED EXCEPTION to the site's usual monochrome-icon rule:
 * these four render each platform's real brand mark/colour rather than
 * `currentColor`, on request — every other icon on the site (nav, dropdowns,
 * carousels) stays monochrome. Don't copy this pattern elsewhere; it exists
 * only because a recognisable, correctly-coloured social row reads as more
 * trustworthy than a tinted-to-match set, and that trade only makes sense for
 * outbound platform links.
 *
 *   Instagram   official 5-stop gradient (feda75→fa7e1e→d62976→962fbf→4f5bd5)
 *               behind a plain white camera glyph — there's no flat "Instagram
 *               colour", the gradient IS the mark.
 *   Facebook    #1877F2, Meta's current brand blue.
 *   X           white — X's own mark is monochrome by design, and the
 *               footer's dark card would swallow the site's usual dimmed
 *               `currentColor` treatment, so this is hardcoded full white
 *               rather than inherited.
 *   LinkedIn    #0A66C2, LinkedIn's current brand blue.
 *
 * X and LinkedIn's paths are GENERATED from the reference, not drawn: each
 * was a CSS mask on a tinted box there, so the path data was read out of the
 * computed `mask-image` and emitted verbatim by `scratchpad/gen-social.js`.
 * Instagram and Facebook have no reference mark to trace, so Facebook's path
 * is Simple Icons' official glyph (CC0); Instagram's is a hand-built
 * gradient-square-plus-camera composite, since Simple Icons only ships flat
 * single-colour marks and the brief specifically wants the gradient one.
 *
 * The reference shows text labels from tablet up and swaps to these icons on
 * phone, where four labels will not fit across 302px.
 */
const glyphs: Record<string, { viewBox: string; path: ReactElement }> = {
  "instagram": {
    viewBox: "0 0 24 24",
    path: (
      <>
        <defs>
          <radialGradient id="gst-social-instagram" cx="30%" cy="107%" r="150%">
            <stop offset="0%" stopColor="#feda75" />
            <stop offset="25%" stopColor="#fa7e1e" />
            <stop offset="50%" stopColor="#d62976" />
            <stop offset="75%" stopColor="#962fbf" />
            <stop offset="100%" stopColor="#4f5bd5" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="24" height="24" rx="6" fill="url(#gst-social-instagram)" />
        <circle cx="12" cy="12" r="5" fill="none" stroke="#fff" strokeWidth="1.8" />
        <circle cx="17.35" cy="6.65" r="1.15" fill="#fff" />
      </>
    ),
  },
  // Simple Icons (CC0), not traced — see file docblock.
  "facebook": {
    viewBox: "0 0 24 24",
    path: (
      <path
        d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
        fill="#1877F2"
      />
    ),
  },
  // X (Twitter)
  "x": {
    viewBox: "0 0 14 14",
    path: (
      <>
      <path d="M 8.888 0 L 10.619 0 L 6.838 4.324 L 11.286 10.208 L 7.803 10.208 L 5.076 6.64 L 1.954 10.208 L 0.223 10.208 L 4.267 5.583 L 0 0 L 3.571 0 L 6.037 3.262 Z M 8.281 9.172 L 9.24 9.172 L 3.05 0.982 L 2.021 0.982 Z" transform="translate(1.358 1.896)" fill="#fff" />
      </>
    ),
  },
  // LinkedIn
  "linkedin": {
    viewBox: "0 0 14 14",
    path: (
      <>
      <path d="M 9.713 0 L 0.788 0 C 0.579 0 0.378 0.083 0.231 0.231 C 0.083 0.378 0 0.579 0 0.788 L 0 9.713 C 0 9.921 0.083 10.122 0.231 10.269 C 0.378 10.417 0.579 10.5 0.788 10.5 L 9.713 10.5 C 9.921 10.5 10.122 10.417 10.269 10.269 C 10.417 10.122 10.5 9.921 10.5 9.713 L 10.5 0.788 C 10.5 0.579 10.417 0.378 10.269 0.231 C 10.122 0.083 9.921 0 9.713 0 Z M 3.15 8.925 L 1.575 8.925 L 1.575 4.2 L 3.15 4.2 Z M 2.363 3.281 C 2.182 3.276 2.007 3.218 1.859 3.114 C 1.712 3.01 1.598 2.865 1.533 2.696 C 1.467 2.528 1.453 2.344 1.491 2.168 C 1.529 1.991 1.619 1.83 1.748 1.704 C 1.878 1.578 2.041 1.493 2.219 1.46 C 2.396 1.427 2.58 1.446 2.746 1.516 C 2.912 1.587 3.054 1.704 3.154 1.855 C 3.254 2.005 3.307 2.182 3.308 2.363 C 3.303 2.609 3.202 2.845 3.025 3.017 C 2.847 3.189 2.609 3.284 2.363 3.281 Z M 8.925 8.925 L 7.35 8.925 L 7.35 6.437 C 7.35 5.691 7.035 5.423 6.625 5.423 C 6.505 5.431 6.388 5.463 6.28 5.516 C 6.173 5.57 6.076 5.644 5.997 5.735 C 5.918 5.826 5.858 5.931 5.82 6.045 C 5.782 6.159 5.766 6.28 5.775 6.4 C 5.772 6.424 5.772 6.449 5.775 6.473 L 5.775 8.925 L 4.2 8.925 L 4.2 4.2 L 5.722 4.2 L 5.722 4.883 C 5.876 4.649 6.087 4.459 6.335 4.33 C 6.583 4.201 6.861 4.138 7.14 4.148 C 7.954 4.148 8.904 4.599 8.904 6.069 Z" transform="translate(1.75 1.75)" fill="#0A66C2" />
      </>
    ),
  },
};

export type SocialKey = keyof typeof glyphs;

export function SocialIcon({ name }: { name: string }) {
  const glyph = glyphs[name];
  if (!glyph) return null;
  return (
    <svg viewBox={glyph.viewBox} className="size-5" aria-hidden="true" focusable="false">
      {glyph.path}
    </svg>
  );
}
