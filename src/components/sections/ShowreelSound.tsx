"use client";

import { useRef, useState } from "react";
import { showreel } from "@/data/showreel";

/**
 * The foreground showreel video, plus a small mute/unmute toggle.
 *
 * Not a play/pause control — the video always autoplays and always loops,
 * exactly as requested, with no button that starts or stops it. Browsers
 * flatly refuse unmuted autoplay for a first-time visitor (Chrome, Firefox
 * and Safari all block it outright; there is no attribute or setting that
 * changes this), so `muted` on mount is what makes the automatic playback
 * possible in the first place, not a design choice. The one thing a click
 * genuinely unlocks — because a real user gesture is exactly what every
 * browser's autoplay-with-sound policy requires — is sound, so that's the
 * only thing this button touches.
 *
 * `muted` is set via the ref rather than by re-rendering the JSX attribute:
 * React only applies `muted` on `<video>` once, at mount (a long-standing
 * quirk, shared by every framework wrapping the DOM), so toggling it later
 * has to go through the element directly. The click handler is the user
 * gesture the browser's audio policy requires — this is the sanctioned way
 * to unmute, not a workaround.
 */
export function ShowreelSound() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  return (
    <div className="relative size-full">
      <video
        ref={videoRef}
        className="size-full rounded-[32px] object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={showreel.poster.fallback}
        aria-label={showreel.videoLabel}
      >
        <source src={showreel.src} type="video/mp4" />
      </video>

      <button
        type="button"
        onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          video.muted = !video.muted;
          setMuted(video.muted);
        }}
        aria-label={muted ? "Unmute showreel" : "Mute showreel"}
        aria-pressed={!muted}
        className={
          "absolute right-4 bottom-4 z-20 grid size-10 shrink-0 cursor-pointer place-items-center rounded-full " +
          "bg-black/40 text-white backdrop-blur-sm " +
          "transition-colors duration-[var(--duration-quick)] ease-[var(--ease-brand)] " +
          "hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        }
      >
        {muted ? (
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" focusable="false">
            <path
              d="M4 9v6h4l5 5V4L8 9H4z M16 9l4 4m0-4l-4 4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" focusable="false">
            <path
              d="M4 9v6h4l5 5V4L8 9H4z M15.5 8.5a5 5 0 0 1 0 7 M18 6a8 8 0 0 1 0 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
