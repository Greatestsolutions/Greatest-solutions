import { cn } from "@/lib/cn";

/**
 * A small solid triangle marking the end of a drawn connector line.
 *
 * Shared by the two hand-drawn connectors on the service detail page — the
 * problem/build arrow and the AI + human workflow's step-to-step arrows — so
 * "a line plus an arrowhead" is one connector language on the page rather than
 * a slightly different shape in each place.
 *
 * A filled triangle via `clip-path`, not the earlier two-border mitre
 * (`border-t border-r`, rotated 45°/135°). At 7–8px that construction shows a
 * visibly uneven joint where the two borders meet — a clipped solid shape reads
 * crisper at this size and scales cleanly with the connector's own colour.
 */
export function ConnectorArrowhead({
  direction,
  className,
}: {
  /** Which way the arrow points. */
  direction: "right" | "down";
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "block size-2.5 bg-brand-emerald",
        direction === "right"
          ? "[clip-path:polygon(0_0,100%_50%,0_100%)]"
          : "[clip-path:polygon(0_0,100%_0,50%_100%)]",
        className,
      )}
    />
  );
}
