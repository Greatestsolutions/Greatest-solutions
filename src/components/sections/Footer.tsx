import Link from "next/link";
import { ContactButton } from "@/components/contact/ContactButton";
import { SocialIcon } from "@/components/footer/SocialIcon";
import { site, socialLinks } from "@/config/site";
import { footerCopyright, footerCta, footerVideo } from "@/data/footer";

/**
 * Footer + CTA — one block, as in the reference, where it sits **outside** the
 * page body as a sibling of `main` rather than as another section inside it.
 * That is why this is a `<footer>` landmark and not a `Section`.
 *
 * A Server Component; no client JavaScript. The video is a declarative
 * `autoplay muted loop playsInline` element, which is what the reference uses.
 *
 * Measured (3.2e pass):
 *
 *   container   pad 80/72/48 · gap 104        (desktop)
 *               pad 64/20/32 · gap 80         (tablet)
 *               pad 36/12    · gap 36         (phone)
 *   CTA card    radius 32 · #141414 · overflow clip · position relative
 *               pad 80/64/32 · gap 80   ·  64/40/24 · gap 64  ·  32/24 · gap 280
 *   heading     Fraunces 64 / 51 / 44, white, opsz 64
 *   eyebrow     Geist Mono 12 uppercase, white
 *   action      110x40 white pill on --shadow-bloom
 *   video       691x481 desktop · 407x417 tablet · 350x833 phone, object-cover
 *   rule        1px white inside the card; 1px rgb(0 0 0 / .08) above the
 *               copyright
 *   socials     text labels, `space-between`; 20px icons on phone
 *   wordmark    full-width brand name, 293 / 172 / 80 tall
 *   copyright   Inter 14/20/-0.02em muted; row on desktop, column on phone
 *
 * The video is `absolute` inside the clipped card so it fills the right half
 * without pushing the text: the reference overlaps them, and at phone its 833px
 * height is deliberately taller than the 637px card.
 */
export function Footer() {
  return (
    <footer className="px-2">
      <div className="mx-auto flex max-w-[1560px] flex-col gap-9 px-3 pt-9 pb-9 tablet:gap-20 tablet:px-5 tablet:pt-16 tablet:pb-8 desktop:gap-[104px] desktop:px-[72px] desktop:pt-20 desktop:pb-12">
        {/* ---- CTA card -------------------------------------------------- */}
        <section
          aria-labelledby="footer-cta-title"
          className="relative flex flex-col overflow-clip rounded-[var(--radius-lg)] bg-ink px-6 pt-8 pb-8 tablet:px-10 tablet:pt-16 tablet:pb-6 desktop:px-16 desktop:pt-20 desktop:pb-8"
        >
          {/*
            Sits behind the copy and bleeds off the card's right edge. Decorative,
            so it is hidden from assistive tech and carries no controls.

            The left edge is masked to a fade. Without it the video is a plain
            rectangle butted against the ink panel, and the join renders as a hard
            vertical seam straight down the middle of the card; the reference has
            no such line.
          */}
          <video
            className="pointer-events-none absolute top-0 right-0 h-[833px] w-[350px] object-cover [filter:url(#gst-emerald)_saturate(1.05)] [mask-image:linear-gradient(to_right,transparent,black_40%)] [mask-mode:alpha] tablet:h-full tablet:w-[407px] desktop:w-[691px]"
            src={footerVideo.src}
            width={footerVideo.width}
            height={footerVideo.height}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
            tabIndex={-1}
          />

          <div className="relative flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              {/*
                Not a `Pill`. Every other eyebrow on the page is a 28px white
                chip; this one is a bare 16px label on ink — measured, and using
                the chip here made the card 12px too tall.
              */}
              <p className="font-mono text-body-sm tracking-[var(--tracking-label)] text-white uppercase">
                {footerCta.eyebrow}
              </p>

              {/*
                Line height is stated at every step. `tablet:leading-[1.1]` alone
                also applies at desktop, where 1.1 x 64 = 70.4 and the two-line
                heading measured 141 instead of 136.
              */}
              <h2
                id="footer-cta-title"
                className="text-heading-xl leading-[48px] text-white opsz-64 tablet:text-[3.1875rem] tablet:leading-[56.1px] desktop:text-[4rem] desktop:leading-[68px]"
              >
                {footerCta.title[0]}
                <br className="max-tablet:hidden" /> {footerCta.title[1]}
              </h2>
            </div>

            {/* Opens the contact dialog rather than navigating — `action.href`
                still records where it used to point, and the route still works. */}
            <ContactButton tone="light" className="self-center shadow-bloom tablet:self-start">
              {footerCta.action.label}
            </ContactButton>
          </div>

          {/* Social row, pinned to the bottom of the card above a white rule. */}
          <div className="relative mt-[280px] flex flex-col gap-8 tablet:mt-16 desktop:mt-20">
            <div aria-hidden="true" className="h-px w-full bg-white" />
            <ul className="flex items-center justify-between">
              {socialLinks.map((social) => (
                <li key={social.key}>
                  {social.pending ? (
                    /* No account yet — a label, not a link. Same treatment the
                       navbar gives routes that do not exist. */
                    <span
                      aria-disabled="true"
                      title="Coming soon"
                      className="flex cursor-default items-center gap-1.5 font-mono text-body-sm tracking-[var(--tracking-label)] text-white/64 uppercase"
                    >
                      <span aria-hidden="true" className="[&_svg]:size-8 tablet:[&_svg]:size-6">
                        <SocialIcon name={social.key} />
                      </span>
                      <span className="max-tablet:sr-only">{social.label}</span>
                    </span>
                  ) : (
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    /*
                      Task 3.4b measured this the other way round. The reference
                      rests at **opacity 0.64 and brightens to 1** on hover; ours
                      rested at full white and dimmed. Same two values, inverted —
                      so the row read as "everything is active until you touch
                      it". `focus-visible` matches, since these are keyboard
                      reachable.
                    */
                    className="flex items-center gap-1.5 font-mono text-body-sm tracking-[var(--tracking-label)] text-white/64 uppercase transition-colors duration-[var(--duration-quick)] ease-[var(--ease-brand)] hover:text-white focus-visible:text-white"
                  >
                    {/* Icon at every width — the reference pairs icon + label on
                        desktop, and this was hiding the icon above tablet, so the
                        row rendered as bare text. Label collapses to sr-only on
                        phone, where there is no room for both. */}
                    <span aria-hidden="true" className="[&_svg]:size-8 tablet:[&_svg]:size-6">
                      <SocialIcon name={social.key} />
                    </span>
                    <span className="max-tablet:sr-only">{social.label}</span>
                  </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- Wordmark + copyright ---------------------------------------- */}
        <div className="flex flex-col gap-4 tablet:gap-8">

          {/*
            The brand name set to the full container width. The reference draws
            it as SVG text so it scales with the column instead of stepping at
            breakpoints, and this keeps that — plus real selectable text.

            The viewBox is 113 units wide, not the reference's 52.48: that number
            is the width of "orionix" at font-size 12, and our name is eleven
            characters longer. `textLength` + `lengthAdjust` pin the run to the
            viewBox so it fills edge to edge whatever the font metrics do.

            Consequence, and it is unavoidable: a longer name at the same width
            is a shorter name. Ours renders ~136px tall against the reference's
            293. Matching that height would need either a clipped name or
            distorted glyphs.
          */}
          {/* `group` + `fill-*` transition gives the wordmark a hover fade from
              the resting grey up to full ink. Colour only — nothing moves, so
              there is no layout shift, and touch devices simply never trigger
              it rather than being given a sticky fake hover. */}
          <svg viewBox="0 0 113 12" className="group w-full" role="img" aria-label={site.name}>
            <text
              x="0"
              y="9.6"
              textLength="113"
              lengthAdjust="spacingAndGlyphs"
              /* The reference sets this wordmark in a light grey, not near-black:
                 its darkest glyph pixel samples rgb(157 157 155) against the page
                 background, where ours was rgb(20 20 20). At this size the dark
                 fill read as a second headline instead of a watermark. */
              className="fill-muted font-display transition-[fill] duration-500 ease-[var(--ease-brand)] group-hover:fill-ink"
              fontSize="12"
            >
              {site.name.toLowerCase()}
            </text>
          </svg>

          {/* The rule and the copyright are their own 16px group; only the
              wordmark sits 32px above them. Measured — a flat 32 made the
              bottom block 378 against the reference's 362. */}
          <div className="flex flex-col gap-4">
            <div aria-hidden="true" className="h-px w-full bg-hairline-strong" />

            <div className="flex flex-col gap-1 text-body-md text-muted tablet:flex-row tablet:justify-between tablet:gap-0">
              {/* `text-body`, matching the address opposite it — the two halves of
                  this row should read at the same strength. Applied to the element
                  rather than to `--color-muted`, which still serves captions and
                  secondary text elsewhere. */}
              <p className="text-body">{footerCopyright}</p>
            <p>
              <Link
                href={`mailto:${site.email}`}
                /* `text-body` overrides the row's `text-muted` for the address
                   only — it is the one interactive item in this row, so it is the
                   one that has to be readable. The copyright beside it keeps its
                   muted tone deliberately. */
                className="text-body transition-colors duration-[var(--duration-quick)] ease-[var(--ease-brand)] hover:text-ink"
              >
                {site.email}
              </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
