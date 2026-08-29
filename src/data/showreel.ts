/**
 * Showreel content.
 *
 * The video is self-hosted (5.2 MB) rather than pulled from the Framer CDN.
 * There is no poster yet — extracting a frame needs ffmpeg, which is not
 * available here — so the play surface is a brand-coloured panel. With
 * `preload="none"` nothing is downloaded until the visitor asks for it, so the
 * missing poster costs nothing but a flat first frame.
 */
export const showreel = {
  marquee: "Watch our reel",
  src: "/video/showreel.mp4",
  playLabel: "Play showreel",
  videoLabel: "Greatest Solutions showreel",
} as const;
