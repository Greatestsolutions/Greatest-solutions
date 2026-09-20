"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { Project } from "@/data/works";

/**
 * The video player dialog for Works cards with a real `media`.
 *
 * Deliberately a close mechanical copy of {@link ContactModalProvider} —
 * same portal-to-`<body>`, same scrim, same focus trap, same Escape/Tab
 * handling on one capture-phase listener, same body-scroll lock, same
 * trigger-focus-restore — rather than a shared abstraction. The two dialogs
 * hold genuinely different content (a form vs. a `<video>`) and `ContactModal`
 * was never factored for reuse; forcing one shared component through both
 * would mean threading a content-slot prop through logic that is otherwise
 * identical by coincidence, not by design. Copying the mechanics keeps each
 * dialog free to diverge later without the other's git blame in the way.
 *
 * One instance for the whole site, exactly like the contact dialog: only one
 * video should ever be playing in the modal at a time, so a single "which
 * project, if any" slot is simpler than a per-card modal instance.
 */

type VideoModal = { play: (project: Project) => void };

const VideoModalContext = createContext<VideoModal | null>(null);

/** Opens the video dialog for `project`. Throws if the provider is missing —
 *  a play button that silently does nothing is a worse failure than one that
 *  surfaces immediately in development. */
export function useVideoModal(): VideoModal {
  const value = useContext(VideoModalContext);
  if (!value) throw new Error("useVideoModal must be used within <VideoModalProvider>");
  return value;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function VideoModalProvider({ children }: { children: ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const card = useRef<HTMLDivElement>(null);
  const scrimPress = useRef(false);
  const titleId = useId();

  const open = project !== null;

  const play = useCallback((next: Project) => {
    trigger.current = document.activeElement as HTMLElement | null;
    setProject(next);
  }, []);

  const close = useCallback(() => setProject(null), []);

  useEffect(() => {
    if (open) return;
    const previous = trigger.current;
    trigger.current = null;
    previous?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    card.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !card.current) return;

      const items = [...card.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (items.length === 0) return;

      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !card.current.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, close]);

  return (
    <VideoModalContext.Provider value={{ play }}>
      {children}
      {open
        ? createPortal(
            <div
              className={
                "fixed inset-0 z-[var(--z-modal)] grid place-items-center overflow-y-auto p-2 tablet:p-8 " +
                "bg-[rgb(20_20_20/0.32)] backdrop-blur-[6px] " +
                "motion-safe:animate-[fade-in_200ms_var(--ease-brand)]"
              }
              onMouseDown={(event) => {
                scrimPress.current = event.target === event.currentTarget;
              }}
              onClick={(event) => {
                if (scrimPress.current && event.target === event.currentTarget) close();
                scrimPress.current = false;
              }}
              onPointerDown={(event) => event.stopPropagation()}
            >
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
            </div>,
            document.body,
          )
        : null}
    </VideoModalContext.Provider>
  );
}
