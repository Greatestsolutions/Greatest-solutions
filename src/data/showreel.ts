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
 */
export const showreel = {
  marquee: "Watch our reel",
  src: "/video/showreel.mp4",
  poster: { avif: "/video/showreel.avif", webp: "/video/showreel.webp", fallback: "/video/showreel.png" },
  playLabel: "Play showreel",
  videoLabel: "Greatest Solutions showreel",
} as const;
