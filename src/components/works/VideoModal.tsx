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
import nextDynamic from "next/dynamic";
import type { Project } from "@/data/works";

/**
 * Code-split for the same reason `ContactModal` splits its own dialog
 * content — see `VideoDialogContent`'s doc comment. `ssr: false` is safe: the
 * branch this renders in never evaluates during SSR or hydration regardless,
 * since `project` starts `null` and can only become set from a click.
 */
const VideoDialogContent = nextDynamic(() => import("@/components/works/VideoDialogContent"), {
  ssr: false,
});

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
              <VideoDialogContent project={project} card={card} titleId={titleId} close={close} />
            </div>,
            document.body,
          )
        : null}
    </VideoModalContext.Provider>
  );
}
