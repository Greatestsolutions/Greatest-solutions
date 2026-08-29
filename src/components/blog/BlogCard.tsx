import { cn } from "@/lib/cn";
import { Picture } from "@/components/ui/Picture";
import { Pill } from "@/components/ui/Pill";
import { THUMB_HEIGHT, THUMB_WIDTH, type Article } from "@/data/blog";

/**
 * One Insights article card. A Server Component; the hover is pure CSS.
 *
 * Measured at 1440 (HOMEPAGE-SECTIONS.md, 3.2c pass):
 *
 *   shell        416x552 · padding 4 · radius 24 · white · --shadow-float-soft
 *                overflow hidden, so the thumbnail's zoom is clipped by it
 *     Content    padding 20 20 40 · gap 24
 *       Name     gap 16 → date (Geist Mono 12/16/+0.03em, muted, uppercase)
 *                       + title (Fraunces 32/36/-0.04em)
 *       Desc     gap 16 → description (Inter 14/20) + category pill
 *     Thumbnail  408x268 · radius 20 · overflow clip · image object-cover
 *
 * **Text sits above the image**, which is unusual enough to be worth stating —
 * the thumbnail is the last thing in the card, not the first.
 *
 * Hover, measured: the image scales 408x268 → 428x281, i.e. **1.05**, centred,
 * clipped by the thumbnail. Nothing else changes — no lift, no shadow change, no
 * title colour change. Verified by parking a real pointer over the card, since
 * `:hover` cannot be forced from page script.
 *
 * The duration is NOT exposed — Framer reports the shorthand `all`. It reuses
 * `--duration-slow`, which is the reference's own measured duration for the only
 * other image-zoom on the page (the Works thumbnails' `transform 0.6s`).
 *
 * The reference wraps the card in a link to /blog/<slug>. Those routes arrive in
 * Task 4; until then the card is not a link, matching the navbar's rule.
 */
export function BlogCard({ article, className }: { article: Article; className?: string }) {
  return (
    <li
      className={cn(
        "flex flex-col overflow-hidden rounded-[var(--radius-md)] bg-surface p-1 shadow-float-soft",
        className,
      )}
    >
      <div className="flex flex-col gap-6 px-5 pt-5 pb-10">
        <div className="flex flex-col gap-4">
          <time
            dateTime={article.dateTime}
            className="font-mono text-body-sm tracking-[var(--tracking-label)] text-muted uppercase"
          >
            {article.date}
          </time>
          {/*
            `opsz-32` because the reference pins the axis explicitly rather than
            leaving it to `font-optical-sizing: auto`. At 32px both resolve to
            the same value, and pinning it did NOT change our rendering — it is
            here to match the reference's declaration, not to fix anything.

            `text-wrap: wrap` because the base heading rule sets `balance`, which
            evens the two lines out and breaks on a different word than the
            reference. This was previously put down to Fraunces metrics; it is
            not — the same symptom in Works turned out to be the wrap algorithm,
            with byte-identical advance widths. Same fix, same reason.
          */}
          <h3 className="text-heading-md opsz-32 [text-wrap:wrap]">{article.title}</h3>
        </div>

        <div className="flex flex-col items-start gap-4">
          {/*
            Clamped to two lines. The reference's description box is
            `overflow: clip` at a fixed 40px — two 20px lines — so a longer
            summary is cut rather than allowed to push the card taller. Without
            this, two of the three cards run 20px tall below desktop, where the
            column narrows to 318px and the text needs a third line.
          */}
          <p className="line-clamp-2 text-body-md text-body">{article.description}</p>
          <Pill tone="muted">{article.category}</Pill>
        </div>
      </div>

      {/* mt-auto keeps thumbnails aligned along the bottom when adjacent cards
          have different amounts of copy, which they do at every breakpoint. */}
      {/*
        The zoom is scoped to the THUMBNAIL, not the card. Task 3.4c measured the
        trigger directly: hovering the reference card's centre — which lands on
        the text, since the copy sits above the image here — produces nothing,
        while hovering the image gives 408x268 → 428.4x281.38, i.e. 1.05.

        Ours previously carried `group` on the whole card, so the image zoomed
        from anywhere on it. Same animation, an eager trigger.
      */}
      <div className="group/thumb mt-auto overflow-clip rounded-[var(--radius-card)]">
        <Picture
          source={article.thumbnail}
          alt=""
          width={THUMB_WIDTH}
          height={THUMB_HEIGHT}
          sizes="(min-width: 1200px) 408px, (min-width: 810px) 353px, 358px"
          className="w-full transition-transform duration-[var(--duration-slow)] ease-[var(--ease-brand)] group-hover/thumb:scale-105"
        />
      </div>
    </li>
  );
}
