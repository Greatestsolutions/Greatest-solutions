import Link from "next/link";
import { cn } from "@/lib/cn";
import { Picture } from "@/components/ui/Picture";
import { Pill } from "@/components/ui/Pill";
import { THUMB_HEIGHT, THUMB_WIDTH, type Project } from "@/data/works";

/**
 * One featured-work card. A Server Component; the only moving part is a CSS
 * custom property written by `WorksParallax`.
 *
 * Measured at 1440 (WORKS-SECTION.md §2), and identical in structure at every
 * breakpoint — only the widths change:
 *
 *   card         flex column · gap 24            ("Parallax Image")
 *     frame      padding 4 · radius 24 · white · --shadow-float · overflow hidden
 *       window   aspect 416/522 · radius 20 · overflow clip
 *         layer  inset-y -15% · background-cover image · translateY(scroll)
 *     content    padding 0 12 · gap 20
 *       name     gap 8 → h3 Fraunces 32/36/-0.04em + description Inter 16/24
 *       tags     gap 8 → 32px `Pill`s
 *
 * **The aspect ratio lives on the inner window, not the frame.** The frame is
 * simply that box plus 4px of padding, which is why the frame measures 0.8000 at
 * 424 wide but 0.8014 at 296 — a single 4:5 frame is right at one width and a
 * pixel out at the others. The window is 0.79694 at every width measured.
 *
 * The content block is a constant 144px tall (36 + 8 + 48 + 20 + 32), so cards in
 * a row stay aligned regardless of how long the copy is. That only holds because
 * the description is clamped to two lines, which is the reference's behaviour: its
 * description box is `overflow: clip` and measures 48px at every width except 768,
 * where the column is wide enough for one line and it measures 24.
 *
 * Hover: a slow 1.04 zoom on the image inside its clip window. Recorded honestly
 * — an earlier pass measured the reference with a real pointer on every card and
 * found *no* hover response at all, so this is an addition requested for our
 * build, not a reproduction of the reference. It is scoped to the thumbnail layer
 * so the card frame, crop and layout stay exactly as they were.
 *
 * It sets the `scale` property rather than `transform`: Tailwind v4 emits those
 * as separate declarations, so this composes with the parallax `translateY` on
 * the same element instead of overwriting it.
 *
 * The reference wraps each card in a link to /works/<slug>. Those routes arrive in
 * Task 4; until then the card is not a link, matching the navbar's rule against
 * shipping links to 404s. `slug` is already in `data/works.ts` for that day.
 */
export function ProjectCard({ project, className }: { project: Project; className?: string }) {
  return (
    // `data-project` is the parity harness's handle on a card; nothing styles it.
    <li data-project={project.slug} className={className}>
      {/*
        One link wrapping the whole card: the entire tile is the target for a
        pointer, and it is a single tab stop rather than one per card region.
        `block` keeps the flex column that used to live on the <li>.
      */}
      <Link
        href={`/works/${project.slug}`}
        /* `group/card` lives on the link, not the <li>: the <li> cannot receive
           focus, so keyboard users would never trigger the hover state if the
           group were declared there. On the link, hover and focus-visible both
           drive it. */
        className="group/card flex flex-col gap-6 rounded-[var(--radius-md)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-green"
      >
      <div className="relative overflow-hidden rounded-[var(--radius-md)] bg-surface p-1 shadow-float">
        {/*
          `data-parallax` marks the clip window: WorksParallax measures this box
          and writes `--parallax` (0 → 1) onto it. Custom properties inherit, so
          the layer below reads it without being queried itself.
        */}
        <div
          data-parallax
          className="relative aspect-[416/522] w-full overflow-clip rounded-[var(--radius-card)]"
        >
          {/*
            The layer is 130% of the window's height — 15% of overspill above and
            below — and slides through that slack as the card crosses the viewport.

            translateY resolves percentages against the element's OWN height, so
            the ±15%-of-window travel is ±15/130 = ±11.5385% here. `--parallax`
            defaults to 0.5, i.e. dead centre, which is what renders on the server,
            under `prefers-reduced-motion`, and if the script never runs.
          */}
          <div
            className="absolute inset-x-0 -inset-y-[15%] will-change-transform transition-[scale] duration-[var(--duration-spring)] ease-[var(--ease-spring)] group-hover/card:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover/card:scale-100"
            style={{ transform: "translateY(calc((var(--parallax, 0.5) * 2 - 1) * 11.5385%))" }}
          >
            {project.thumbnail ? (
              <Picture
                source={project.thumbnail}
                alt=""
                width={THUMB_WIDTH}
                height={THUMB_HEIGHT}
                sizes="(min-width: 1200px) 590px, (min-width: 810px) 460px, 100vw"
                className="size-full object-cover"
              />
            ) : (
              /*
                No screenshot exists for this project, so the card shows a neutral
                typographic panel rather than stock art or a generated mockup —
                either would be a fabricated screenshot. Same box, same parallax,
                same hover; only the fill differs.
              */
              /*
                Inset by 11.5385% top and bottom, NOT padded by it.
                
                This panel fills the parallax layer, which is 130% of the clip
                window with 15% overspill each side, so content laid out against
                the full height falls outside the visible band — measured: the
                category sat at y=360 against a window starting at y=424, i.e.
                clipped, and the card read as an empty dark rectangle.
                
                The first attempt used `py-[11.5385%]` and did not fix it, because
                **percentage padding resolves against the WIDTH**, not the height:
                on a 416-wide card that is 48px, where 15% of the 750px layer is
                112.5px. Percentage `top`/`bottom` insets do resolve against the
                height, so the panel is positioned rather than padded. 15/130 =
                11.5385%, the same ratio the translateY above uses.
              */
              <div className="absolute inset-x-0 top-[11.5385%] bottom-[11.5385%] flex flex-col justify-between bg-brand-ink p-8">
                <span className="font-mono text-body-sm tracking-[var(--tracking-label)] text-white/64 uppercase">
                  {project.category}
                </span>
                <span className="text-heading-md text-surface">{project.title}</span>
              </div>
            )}
          </div>
        </div>

        {/*
          "View details" — appears on hover and on keyboard focus of the card link.
          Built from the project's own tokens (brand ink, --ease-brand, the
          existing duration scale); no new animation library, and no cursor
          tracking, which would need a client component for a decorative effect.

          `absolute` + `pointer-events-none` means it cannot shift layout or
          intercept the click. It is `aria-hidden` because the link already has an
          accessible name — announcing "View details" again would be noise.
        */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center",
            "opacity-0 transition-opacity duration-[var(--duration-medium)] ease-[var(--ease-brand)]",
            "group-hover/card:opacity-100 group-focus-visible/card:opacity-100",
            "[@media(hover:none)]:hidden motion-reduce:transition-none",
          )}
        >
          <span
            className={cn(
              "grid size-[112px] place-items-center rounded-full bg-brand-ink text-center",
              "text-body-sm font-medium tracking-[-0.01em] text-surface",
              "scale-90 transition-transform duration-[var(--duration-spring)] ease-[var(--ease-spring)]",
              "group-hover/card:scale-100 group-focus-visible/card:scale-100 motion-reduce:transition-none",
            )}
          >
            View details
          </span>
        </span>
      </div>

      <div className="flex flex-col gap-5 px-3">
        <div className="flex flex-col gap-2">
          {/*
            `h3` under the section's `h2`. The reference uses `h5` here, which
            skips two levels — the heading order is corrected, the type is not:
            `text-heading-md` is the measured 32/36, and `opsz-32` matches the
            axis the reference pins explicitly.
          */}
          {/* States plainly whether the work was internal, personal or a client
              engagement. Without it a portfolio card is read as client work by
              default, which for these projects would be untrue. */}
          <span className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase">
            {project.type}
          </span>
          <h3 className="text-heading-md opsz-32">{project.title}</h3>
          <p className="line-clamp-2 text-body-lg text-body">{project.description}</p>
        </div>

        <ul className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Pill key={tag} as="li">
              {tag}
            </Pill>
          ))}
        </ul>
      </div>
      </Link>
    </li>
  );
}
