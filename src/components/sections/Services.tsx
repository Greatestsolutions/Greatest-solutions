import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ProgressDial } from "@/components/services/ProgressDial";
import { EmeraldFilter } from "@/components/services/EmeraldFilter";
import { ServiceCard } from "@/components/services/ServiceCard";
import { ServiceScroller } from "@/components/services/ServiceScroller";
import { Picture } from "@/components/ui/Picture";
import { services, servicesLabel } from "@/data/services";

/**
 * Services — five items revealed by scroll, with a rotating numbered dial and a
 * per-service illustration.
 *
 * A Server Component. The only client code is {@link ServiceScroller}, which owns
 * no markup of its own: it reads the scroll position and writes one CSS custom
 * property plus a `data-state` attribute per item. Everything visible here is
 * server-rendered and present in the HTML, including all five services — the
 * choreography is emphasis, never the difference between content existing and not.
 *
 * Layout, measured (SERVICES-SECTION.md §2). The reference ships three variants;
 * these are the same nodes with different grid placement:
 *
 *     desktop ≥1200   12 cols · dial 1–2 · text 5–10 (max 540) · art 11–12
 *     tablet 810–1199  8 cols · dial 1–2 · text 4–8
 *     phone  <810      1 col  · dial overlaid on the card, arc across the top
 *
 * `Container` already produces the reference's grid width at both breakpoints —
 * 1296px at 1440 and 746px at 810 — so no width is restated here.
 *
 * Both sticky columns sit in the same grid row as the text column, so their grid
 * area is the full track and `sticky` can travel its whole length. That is the
 * reference's own construction, and it is why the dial does not need JavaScript
 * to stay put.
 */
export function Services() {
  return (
    <Section
      id="services"
      label={servicesLabel}
      spacing="default"
      container={false}
      // The desktop illustration deliberately runs past the right edge; clipping
      // here is what turns that into a bleed rather than a horizontal scrollbar.
      className="overflow-clip"
    >
      <EmeraldFilter />
      <ServiceScroller count={services.length}>
        <Container>
          <div className="grid grid-cols-1 gap-3 tablet:grid-cols-8 desktop:grid-cols-12">
            {/*
              Dial column. `data-service-stage` marks it as the height reference
              for progress: it is exactly one viewport, which is what the item
              pitch is measured against.

              On phone it shares column 1 with the text and simply overlays it,
              which is how the reference gets the arc across the top of the card
              without adding a row.
            */}
            <div
              data-service-stage
              className="pointer-events-none sticky top-0 z-10 col-start-1 row-start-1 h-svh self-start tablet:col-span-2"
            >
              <ProgressDial count={services.length} />
            </div>

            {/* The five items. Their combined height is the scroll span. */}
            <div
              data-service-track
              // The 36px tail is measured: on phone the reference adds it below
              // the last card so the sticky stack releases before the section
              // ends rather than exactly at it.
              className="col-start-1 row-start-1 max-tablet:pb-9 tablet:col-span-5 tablet:col-start-4 desktop:col-span-6 desktop:col-start-5 desktop:max-w-[540px]"
            >
              {services.map((service, i) => (
                <div
                  key={service.slug}
                  data-service-item
                  data-state={i === 0 ? "active" : "inactive"}
                  className={[
                    // From tablet up: one viewport per item, content centred,
                    // with the measured 90px minimum inset.
                    "flex min-h-svh tablet:items-center tablet:py-[90px]",
                    // On phone the reference does not centre — it pins the card
                    // and starts the text at a fixed 230px, which is 60px card
                    // padding + the 80px dial well + 10px gap + 80px content
                    // padding. Centring here put the title behind the dial.
                    "max-tablet:items-start max-tablet:pt-[230px]",
                    // Below tablet the reference pins one card and swaps its
                    // contents. Making every item sticky at the same offset and
                    // hiding the inactive ones reproduces that exactly, from the
                    // same markup the wider layouts use.
                    "max-tablet:sticky max-tablet:top-0 max-tablet:h-svh",
                    "transition-[opacity,filter] duration-[var(--duration-spring)] ease-[var(--ease-spring)]",
                    // Tablet and up: inactive cards stay visible, dimmed and blurred.
                    "tablet:data-[state=inactive]:opacity-50 tablet:data-[state=inactive]:blur-[4px]",
                    // Phone: the five cards are stacked at the same offset, so an
                    // inactive one has to disappear completely.
                    //
                    // The hidden state is gated on `not-focus-within` rather than
                    // being overridden by a `focus-within:opacity-100` rule. Both
                    // target `opacity`, and Tailwind orders variants by its own
                    // rules, not by class order — measured, the data-state rule won
                    // and a focused card stayed invisible. Gating means there is no
                    // conflict to lose: under focus the rule simply does not apply.
                    "max-tablet:data-[state=inactive]:not-focus-within:pointer-events-none",
                    "max-tablet:data-[state=inactive]:not-focus-within:opacity-0",
                  ].join(" ")}
                >
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>

            {/*
              Desktop illustration column. The artwork has to stay pinned while
              the text scrolls past it, so it cannot live inside the card the way
              it does on tablet and phone — this is the one place where the same
              image is placed twice, and only one copy is ever rendered.
            */}
            <div
              aria-hidden="true"
              className="pointer-events-none relative row-start-1 hidden h-svh self-start desktop:sticky desktop:top-0 desktop:col-span-2 desktop:col-start-11 desktop:block"
            >
              {services.map((service, i) => (
                <div
                  key={service.slug}
                  data-service-illustration
                  data-state={i === 0 ? "active" : i > 0 ? "upcoming" : "passed"}
                  // The emerald material. Applied to the wrapper rather than the
                  // image so it composes with the scroll transform above, and so
                  // both render paths share one filter definition.
                  style={{ filter: "url(#gst-emerald)" }}
                  className={[
                    // 600px square centred on this column's right edge, so 300px
                    // of it sits past the page gutter and bleeds off screen.
                    "absolute top-1/2 right-0 size-[600px] opacity-0",
                    "transition-[transform,opacity] duration-[var(--duration-spring)] ease-[var(--ease-spring)]",
                    // Default is the upcoming state: 64px low and scaled down.
                    "[transform:translate(50%,-50%)_translateY(64px)_scale(0.8)]",
                    "data-[state=active]:opacity-100 data-[state=active]:[transform:translate(50%,-50%)_scale(1)]",
                    "data-[state=passed]:[transform:translate(50%,-50%)_translateY(-64px)_scale(0.8)]",
                  ].join(" ")}
                >
                  <Picture
                    source={service.illustration}
                    alt=""
                    width={1024}
                    height={1024}
                    sizes="600px"
                    // The first one is on screen the moment the section is, so it
                    // is the only one worth fetching ahead of its turn.
                    loading={i === 0 ? "eager" : "lazy"}
                    /*
                      Brand tint on greyscale source art.
                      
                      The illustrations are 100% greyscale with a real alpha cutout
                      (measured: 0 coloured pixels, 883k transparent of 1.05M), so
                      all of their 3D form lives in luminance. A filter chain
                      recolours them while leaving that luminance intact — a flat
                      `mask + background` fill would give a green silhouette and
                      throw the shading away.
                      
                      sepia() first, because hue-rotate has nothing to rotate on a
                      neutral image; saturate/hue-rotate then move it to emerald.
                      Lower the saturate value for a subtler tint.
                    */
                    className="size-full"
                  />
          
                </div>
              ))}
            </div>
          </div>
        </Container>
      </ServiceScroller>
    </Section>
  );
}
