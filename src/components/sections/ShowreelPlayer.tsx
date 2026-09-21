"use client";

import { useState } from "react";
import { Picture } from "@/components/ui/Picture";
import { showreel } from "@/data/showreel";

/**
 * The showreel's foreground player — the one client boundary this section
 * needs, same "thin wrapper" shape as `PlayButton` for Works cards.
 *
 * Click-to-play with sound, not the old muted-autoplay-loop: the real reel
 * carries mastered AAC audio (peaks at -0.9 dB, not a silent placeholder
 * track), so autoplaying it muted would silently throw away the one thing
 * that makes it a reel rather than wallpaper. See `Showreel.tsx`'s doc
 * comment for the full reasoning.
 *
 * Starts on the poster (the real `<Picture>` — AVIF/WebP negotiate down to
 * ~5% of the PNG's weight, worth doing since this renders in the initial
 * viewport on most laptop-height screens even though the section sits below
 * the hero) with the same play-button treatment `PlayButton` uses on Works
 * cards, so the affordance reads the same way everywhere it appears on the
 * site. No `<video>` element exists at all until clicked — `preload` has
 * nothing to apply to before that, so there is no eager fetch to avoid.
 *
 * No `loop`: this is the real, finite reel, not ambient background motion —
 * native controls are enough to replay it once it ends.
 */
export function ShowreelPlayer() {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <video
        className="size-full rounded-[32px] object-cover"
        controls
        autoPlay
        playsInline
        preload="metadata"
        poster={showreel.poster.fallback}
        aria-label={showreel.videoLabel}
      >
        <source src={showreel.src} type="video/mp4" />
        Your browser doesn&apos;t support embedded video.
      </video>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={showreel.playLabel}
      className="group relative block size-full cursor-pointer overflow-hidden rounded-[32px]"
    >
      <Picture
        source={showreel.poster}
        alt=""
        width={1280}
        height={720}
        className="size-full object-cover"
      />
      <span className="absolute inset-0 grid place-items-center bg-black/10 transition-colors duration-[var(--duration-medium)] ease-[var(--ease-brand)] group-hover:bg-black/20">
        <span
          className={
            "grid size-16 shrink-0 place-items-center rounded-full bg-white/90 text-brand-ink " +
            "shadow-[0_4px_20px_rgb(0_0_0/0.24)] backdrop-blur-sm " +
            "transition-[scale,background-color] duration-[var(--duration-medium)] ease-[var(--ease-brand)] " +
            "group-hover:scale-110 group-hover:bg-white group-focus-visible:scale-110 group-focus-visible:bg-white"
          }
        >
          <svg viewBox="0 0 24 24" className="ml-1 size-6" aria-hidden="true" focusable="false">
            <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
          </svg>
        </span>
      </span>
    </button>
  );
}
