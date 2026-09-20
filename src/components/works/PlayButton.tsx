"use client";

import { cn } from "@/lib/cn";
import { useVideoModal } from "@/components/works/VideoModal";
import type { Project } from "@/data/works";

/**
 * The play affordance on a video project's card.
 *
 * The thin client boundary for {@link useVideoModal} — same shape as
 * {@link ContactButton} for the contact dialog: only this wrapper ships,
 * so the otherwise-server `ProjectCard` and `ProjectGridCard` stay server
 * components everywhere they render a project with no `media`.
 *
 * Always visible rather than hover-only revealed: a hidden-until-hover
 * control is invisible to touch and to a screen-reader user scanning the
 * card, and "there is a video here" is exactly the kind of thing a card
 * should say plainly rather than make someone discover by accident.
 *
 * Sits above the card's own stretched link in stacking order (`z-20` beats
 * the link's `z-10`) and stops the click reaching it, so pressing play
 * opens the modal instead of navigating to the detail page.
 */
export function PlayButton({ project, className }: { project: Project; className?: string }) {
  const { play } = useVideoModal();
  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        play(project);
      }}
      aria-label={`Play ${project.title}`}
      className={cn(
        "group/play relative z-20 grid size-16 shrink-0 cursor-pointer place-items-center rounded-full",
        "bg-white/90 text-brand-ink shadow-[0_4px_20px_rgb(0_0_0/0.24)] backdrop-blur-sm",
        "transition-[scale,background-color] duration-[var(--duration-medium)] ease-[var(--ease-brand)]",
        "hover:scale-110 hover:bg-white focus-visible:scale-110 focus-visible:bg-white",
        "focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40 focus-visible:outline-none",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="ml-1 size-6" aria-hidden="true" focusable="false">
        <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
      </svg>
    </button>
  );
}
