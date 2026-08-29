import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { Picture } from "@/components/ui/Picture";
import { processEyebrow, processSteps, processTitle } from "@/data/process";

/**
 * "How we work" — three process steps. `Section - Progress` in the reference.
 *
 * A Server Component with no client JavaScript: it is a static three-column
 * layout, and the reference gives it no scroll or hover behaviour. Audited —
 * none of its elements carries a transition that changes on hover.
 *
 * Measured (HOMEPAGE-SECTIONS.md §3):
 *
 *   desktop   grid 3 x 400px · gap 48 · card 320 wide, left-aligned in its track
 *   tablet    grid 3 x 1fr (216.7) · gap 48 · card fills the track
 *   phone     one column · gap 42 · everything centred, heading drops to 44px
 *
 *   card      flex column · gap 32
 *     icon    96px circle · white · --shadow-pill · 36px artwork inside
 *     content flex column · gap 12 → h3 (Fraunces 40/44) + p (Inter 16/24)
 *
 * The heading is an `h3` rather than the reference's `h4`: this section's own
 * heading is an `h2`, so `h4` would skip a level. The reference's levels are
 * decorative, ours describe the outline.
 */
export function Process() {
  // Phone padding is 72 top / 36 bottom here, not the shared 64/64 — measured,
  // and specific to this section (Services at phone is 64/64, the default). The
  // override sits on the call site rather than in `Section` so the shared rhythm
  // stays the rhythm.
  return (
    <Section
      id="process"
      label={processEyebrow}
      spacing="default"
      className="max-tablet:pt-[72px] max-tablet:pb-9"
    >
      <div className="flex flex-col gap-14 tablet:gap-[72px]">
        <SectionHeader
          eyebrow={processEyebrow}
          align="start"
          className="max-tablet:mx-auto max-tablet:items-center max-tablet:text-center"
          // The reference breaks this heading explicitly from tablet up but
          // ships it as one string on phone, where 44px type wraps to the same
          // two lines on its own. Forcing the break there costs a third line.
          title={
            <>
              {processTitle[0]}
              <br className="max-tablet:hidden" />{" "}
              {processTitle[1]}
            </>
          }
        />

        {/*
          Equal fractions at every breakpoint. The reference computes to
          `400px 400px 400px` at 1440, but that is 1fr resolving inside a 1296
          container — writing 400px literally overflows every desktop width below
          1440, which is exactly what it did until this was measured at 1280.
          The 320px card cap below is what keeps cards narrower than their track.
        */}
        <ul className="grid gap-[42px] tablet:grid-cols-3 tablet:gap-12">
          {processSteps.map((step) => (
            <li
              key={step.title}
              className="flex flex-col items-center gap-8 text-center tablet:items-start tablet:text-left desktop:max-w-[320px]"
            >
              <div className="grid size-24 shrink-0 place-items-center rounded-full bg-surface shadow-pill">
                <Picture
                  source={step.icon}
                  alt=""
                  width={step.iconSize}
                  height={step.iconSize}
                  sizes="36px"
                  className="size-9"
                />
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-heading-lg">{step.title}</h3>
                <p className="text-body-lg text-body">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
