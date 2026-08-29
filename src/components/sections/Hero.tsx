import { RippleImage } from "@/components/hero/RippleImage";
import { Container } from "@/components/layout/Container";
import { CopyEmail } from "@/components/hero/CopyEmail";
import { EditableHeadline } from "@/components/hero/EditableHeadline";
import { LocalTime } from "@/components/hero/LocalTime";
import { Section } from "@/components/layout/Section";
import { hero } from "@/data/hero";

/**
 * Full-viewport hero: the WebGL sculpture with the headline and footer bar over it.
 *
 * A Server Component. Only {@link RippleImage} is a client component, so the
 * headline, tagline and contact link are all server-rendered — the interactive
 * boundary is as small as it can be.
 *
 * The headline is left-aligned on desktop for a measured reason: `coverFit`
 * scales the sculpture up as the canvas gets wider, and past roughly 1.9 aspect
 * it climbs into the vertical middle and lands behind centred type. On a
 * 1272x605 window the glass covered 20% of the headline's box; moving it left
 * dropped that to 1%.
 *
 * The overlay runs through {@link Container} rather than carrying its own
 * padding. That is not tidiness — hardcoding it here drifted 8px from the
 * reference at every desktop size, and left the hero as the one section with no
 * max-width, so at 1920 its content spanned 1760px while every other section
 * would stop at 1560px.
 */
export function Hero() {
  return (
    <Section
      id="hero"
      label="Introduction"
      spacing="none"
      container={false}
      className="h-[calc(100dvh-1rem)] overflow-hidden rounded-[var(--radius-md)] tablet:rounded-[var(--radius-xl)]"
    >
      <RippleImage
        landscapeSrc={hero.image.landscape}
        portraitSrc={hero.image.portrait}
        alt={hero.image.alt}
        className="absolute inset-0"
      />

      {/* pointer-events-none so the whole surface stays interactive for the
          ripple; individual controls opt back in. */}
      <Container className="pointer-events-none relative flex h-full flex-col justify-between pt-[112px] pb-8 desktop:pt-[148px]">
        <div>
          {/*
            The headline is longer than the two-word original, so the display step
            is reduced here — on the h1 only, not on the shared `--text-display`
            token, which other sections use. Everything else about the hero is
            untouched: the sculpture, its container, the ripple and the layout are
            all exactly as they were.

            Centred below the desktop switch, left-aligned above it, as before.
          */}
          <h1 className="max-w-[40rem] font-sans leading-[1.25] desktop:ml-[4.5rem] max-desktop:mx-auto max-desktop:text-center">
            <EditableHeadline lines={hero.headline} />
          </h1>

          {/*
            On phone the tagline sits directly under the headline, as it does in
            the reference. Squeezing it into the three-column bottom bar at 390px
            wrapped it to seven lines and pushed the email off-screen.
          */}
          <p className="mx-auto mt-6 max-w-[34ch] text-center text-body-lg text-body tablet:hidden">
            {hero.tagline}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <span className="hidden gap-1.5 font-mono text-body-sm uppercase tracking-[var(--tracking-label)] text-muted tablet:flex">
            {hero.timezone}
            <LocalTime offsetHours={hero.timezoneOffsetHours} />
          </span>
          <p className="hidden max-w-[34ch] text-center text-body-lg text-body tablet:block">
            {hero.tagline}
          </p>
          {/*
            A copy-to-clipboard button, not a mailto link. Task 3.4e measured the
            reference control as `<button aria-label="Copy to Clipboard">` whose
            visible label swaps to "Copied!" after a click. See `CopyEmail`.
          */}
          <CopyEmail />
        </div>
      </Container>
    </Section>
  );
}
