/**
 * Showreel content.
 *
 * `src` is the real, original reel (previously a 5.2 MB placeholder clip).
 * Re-encoded from a 40 MB/7.1 Mbps 720p24 source to 17.3 MB/2.9 Mbps —
 * `+faststart`, a 48-frame (2s) GOP and High@L3.1 for broad decode
 * compatibility, the same discipline already applied to every Works video.
 *
 * Unlike the placeholder, this file carries real audio (AAC LC, mastered to
 * -0.9 dB peak — not an empty/silent track) meant to be heard, so the
 * section is click-to-play with sound rather than muted-autoplay-loop; see
 * `Showreel.tsx`'s doc comment for the reasoning. `poster` is the frame this
 * needs for that: extracted 5s in, not frame zero.
 *
 * **Filenames carry a content hash** (first 10 hex chars of each file's own
 * SHA-256) rather than a plain `showreel.mp4`. This asset sits behind
 * `Cache-Control: immutable, max-age=31536000` (a full year, no revalidation
 * — see `next.config.ts`), which is exactly right for content that never
 * changes under a given URL and exactly wrong for a fixed filename whose
 * *content* changes over time: the first replacement of this file (the real
 * reel swapped in for the placeholder) shipped correctly to the origin, but
 * every visitor whose browser had already cached `/video/showreel.mp4`
 * before that deploy kept playing the old bytes from disk — `immutable`
 * means the browser never even asks the origin again, for up to a year.
 * Hashing the filename means new content is a new URL, so an old cache
 * entry (for the old URL) simply can't apply to it — the standard fix for
 * combining aggressive caching with mutable content, and it removes the
 * need to ever think about cache invalidation for this asset again. Update
 * the hash (recompute via `sha256sum`, truncate to 10 hex chars) whenever
 * this file's content changes.
 */
export const showreel = {
  marquee: "Watch our reel",
  src: "/video/showreel.0e34a5d966.mp4",
  poster: {
    avif: "/video/showreel.35f8cb4958.avif",
    webp: "/video/showreel.d1efe17f59.webp",
    fallback: "/video/showreel.c08d3919f6.png",
  },
  playLabel: "Play showreel",
  videoLabel: "Greatest Solutions showreel",
} as const;
