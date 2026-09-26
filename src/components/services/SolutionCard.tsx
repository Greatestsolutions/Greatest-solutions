import Link from "next/link";
import { cn } from "@/lib/cn";
import { Picture } from "@/components/ui/Picture";
import { Pill } from "@/components/ui/Pill";
import type { Service } from "@/data/services";

/**
 * One card in the homepage's "Solutions" section — the former "Featured
 * Work" masonry teaser, repurposed to link into the service catalog instead
 * of Works entries.
 *
 * Two things are DELIBERATELY copied verbatim from elsewhere rather than
 * invented for this card, per how this section was specified:
 *
 * - The hover treatment (`hover:scale-[1.035]` on the whole card plus the
 *   diagonal "glass sweep") is `/services`' own `CarouselCard` hover, copied
 *   value-for-value — not the old Works card's 1.04 image-only zoom. That
 *   source isn't itself touch-guarded (`hover:` rather than
 *   `@media(hover:hover)`), so this card inherits that same minor property;
 *   copying it exactly was the point.
 * - The tag row is `/services`' own single joined eyebrow pill
 *   (`tags.join(" · ")`), not the old Works card's list of separate pills.
 *
 * Everything else — the frame, the `aspect-video` window (landscape, since
 * the real service photos are all 16:9 — a plain `object-cover` fit is
 * enough to fill it with no crop worth mentioning), the hover-reveal "View
 * details" badge — follows the old Works `ProjectCard`'s own structure,
 * since this card still plays that card's ROLE in the same masonry layout,
 * just pointed at a service instead of a project. The "View details" reveal
 * keeps that card's `[@media(hover:none)]:hidden` guard, so a tap on touch
 * can never leave it stuck open.
 */
export function SolutionCard({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  return (
    <li
      data-solution={service.slug}
      className={cn("group/card relative flex flex-col gap-6 rounded-[var(--radius-md)]", className)}
    >
      <Link
        href={`/services/${service.slug}`}
        className="absolute inset-0 z-10 rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green"
      >
        <span className="sr-only">View {service.title}</span>
      </Link>

      <div
        className={cn(
          "relative flex flex-col overflow-hidden rounded-[var(--radius-md)] bg-surface p-1 shadow-float",
          "transition-[scale] duration-[var(--duration-medium)] ease-[var(--ease-brand)]",
          "group-hover/card:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100",
        )}
      >
        <div className="relative aspect-video w-full overflow-clip rounded-[var(--radius-card)] bg-background">
          <Picture
            source={service.illustration}
            alt={`${service.title} service thumbnail`}
            width={1024}
            height={1024}
            sizes="(min-width: 1200px) 590px, (min-width: 810px) 460px, 100vw"
            objectPosition={service.focalPoint}
            className="size-full object-cover"
          />
        </div>

        {/* "View details" — appears on hover and on keyboard focus, exactly
            the old Works card's own treatment; see the doc comment above. */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center",
            "opacity-0 transition-opacity duration-[var(--duration-medium)] ease-[var(--ease-brand)]",
            "group-hover/card:opacity-100 group-has-[a:focus-visible]/card:opacity-100",
            "[@media(hover:none)]:hidden motion-reduce:transition-none",
          )}
        >
          <span
            className={cn(
              "grid size-[112px] place-items-center rounded-full bg-brand-ink text-center",
              "text-body-sm font-medium tracking-[-0.01em] text-surface",
              "scale-90 transition-transform duration-[var(--duration-spring)] ease-[var(--ease-spring)]",
              "group-hover/card:scale-100 group-has-[a:focus-visible]/card:scale-100 motion-reduce:transition-none",
            )}
          >
            View details
          </span>
        </span>

        {/* The glass sweep — `/services`' own `CarouselCard` treatment,
            copied value-for-value. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[15] overflow-hidden motion-reduce:hidden"
        >
          <span
            className={
              "absolute inset-y-[-60%] left-0 w-[38%] -translate-x-[180%] rotate-[18deg] blur-[8px] " +
              "bg-[linear-gradient(90deg,transparent_0%,rgb(255_255_255/0.10)_35%,rgb(255_255_255/0.40)_50%,rgb(255_255_255/0.10)_65%,transparent_100%)] " +
              "group-hover/card:animate-[glass-sweep_1100ms_var(--ease-brand)]"
            }
          />
        </span>
      </div>

      <div className="flex flex-col gap-5 px-3">
        {/* Services have no category/type pair — the three capability tags
            already on each service read the same way in this slot, matching
            exactly how `/services`' own cards show them. */}
        <Pill size="eyebrow" dot={false} className="self-start">
          {service.tags.join(" · ")}
        </Pill>
        <div className="flex flex-col gap-2">
          <h3 className="text-heading-md opsz-32">{service.title}</h3>
          <p className="line-clamp-2 text-body-lg text-body">{service.description}</p>
        </div>
      </div>
    </li>
  );
}
