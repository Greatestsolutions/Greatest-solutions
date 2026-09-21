"use client";

import type { RefObject } from "react";
import type { Project } from "@/data/works";

/**
 * The video dialog's actual content — split out of `VideoModal.tsx` for the
 * same reason `ContactDialogContent` was split out of `ContactModal.tsx`: it
 * was mounted at the root layout (`VideoModalProvider` needs to be, so a
 * play button anywhere in a Works card can reach it), which put its JS in
 * every page's initial bundle site-wide — the About page, Privacy, Terms —
 * none of which has a single video card in them, whether or not any visitor
 * on THOSE pages ever opens this dialog at all.
 *
 * `VideoModal.tsx` loads this via `next/dynamic(..., { ssr: false })`,
 * rendered only once `project` is already non-null — the same `open`-gated
 * portal branch as before, so there is no server-rendered version of this to
 * lose by marking it client-only.
 *
 * Pure extraction: identical markup, identical `<video>` attributes and the
 * reasoning already recorded for them. `project`/`card`/`titleId`/`close` are
 * exactly the values `VideoModalProvider` already held.
 */
export default function VideoDialogContent({
  project,
  card,
  titleId,
  close,
}: {
  project: Project;
  card: RefObject<HTMLDivElement | null>;
  titleId: string;
  close: () => void;
}) {
  return (
    <div
      ref={card}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={
        "relative flex w-full max-w-[960px] flex-col gap-4 " +
        "motion-safe:animate-[rise-in_260ms_var(--ease-brand)]"
      }
    >
      <h2 id={titleId} className="sr-only">
        {project.title}
      </h2>

      <button
        type="button"
        onClick={close}
        aria-label="Close"
        className={
          "absolute -top-12 right-0 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full " +
          "border border-white/20 bg-white/10 text-white " +
          "transition-colors duration-[var(--duration-quick)] ease-[var(--ease-brand)] " +
          "hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
        }
      >
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" focusable="false">
          <path
            d="M4 4l8 8M12 4l-8 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="overflow-hidden rounded-[var(--radius-md)] bg-black shadow-card">
        {/* Real playback with sound — not muted, not autoplaying until the
            visitor has explicitly asked for this specific video via the
            play button. `key` forces a fresh element per project, so
            switching videos without unmounting the dialog can't leave the
            previous source paused mid-frame underneath the new poster.

            `preload="metadata"` rather than the default (browser-chosen,
            commonly "auto" — the whole file starts downloading the moment
            this element exists): the dialog only mounts the video at all
            once the visitor has pressed play, so by then metadata-only is
            the right amount of head start — enough to know duration/
            dimensions before `autoPlay` fires, not a second full prefetch
            on top of the click that already asked for this specific file.

            `width`/`height` are the source's own intrinsic pixel size
            (1920x1080 for every current video but one at 1280x720 — CSS
            still renders every video at `aspect-video w-full` regardless,
            so a mismatched intrinsic ratio here only affects layout-shift
            reservation before the real metadata loads, never the visible
            size). Explicit dimensions on a `<video>` are what let the
            browser reserve its box before that metadata arrives, same
            reasoning `Picture` already requires them for. */}
        <video
          key={project.media?.src}
          src={project.media?.src}
          poster={project.media?.poster?.fallback}
          width={1920}
          height={1080}
          controls
          autoPlay
          playsInline
          preload="metadata"
          className="aspect-video w-full"
        >
          Your browser doesn&apos;t support embedded video.
        </video>
      </div>
    </div>
  );
}
