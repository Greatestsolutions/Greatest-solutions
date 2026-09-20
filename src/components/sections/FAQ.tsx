import { Section } from "@/components/layout/Section";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { FaqList } from "@/components/faq/FaqList";
import { faqEyebrow, faqTitle } from "@/data/faq";

/**
 * FAQ — a header beside a list of toggling questions.
 *
 * The section itself stays a Server Component; only {@link FaqList} — the
 * initial-five-plus-"View more" reveal — needs client state. Each row's
 * accordion is still `<details>`/`<summary>` with a CSS height transition. See
 * `FaqItem` for why that is the right primitive here rather than React state.
 *
 * Measured layout (3.2d pass):
 *
 *   desktop  two columns — header 520 at l=80, list 634 at l=726
 *            container padding 80/72, the widest gutter on the page
 *   tablet   stacked, container padding 64/24, list full width (746)
 *   phone    stacked, section padding 36/24, list 342, header capped at 520
 *
 *   list     flex column, gap 24, with 44px of lead-in above it on desktop and
 *            tablet and none on phone
 *
 * **There is no `Accordion` container component.** The items hold no shared
 * state — the reference lets any number be open at once, which `<details>`
 * already gives per element — so a wrapper would be an empty `<ul>` with a name.
 * The list markup lives here; if a second accordion ever appears, that is the
 * point to extract one.
 */
export function FAQ() {
  return (
    <Section
      id="faq"
      label={faqEyebrow}
      spacing="none"
      // Three measured paddings, none of which is the shared section rhythm:
      // 36/24 on phone, 64/24 at tablet, 80/72 on desktop — the last is the
      // widest gutter on the page, 8px more than every other section.
      // Gutters are stated net of `main`'s 8px page inset, which every section
      // sits inside: 16 + 8 = the measured 24 on phone, 24 + 8 = 32 at tablet,
      // 72 + 8 = 80 on desktop.
      className="px-4 py-9 tablet:px-6 tablet:py-16 desktop:px-[72px] desktop:py-20"
      container={false}
    >
      {/*
        Header→list gap is 56 on phone, 24 at tablet, and horizontal-only on
        desktop where the two sit side by side (12px grid gutter). The 56 is
        measured: the reference's phone header ends at 144 and its first row
        starts at 200.
      */}
      <div className="mx-auto flex max-w-[520px] flex-col gap-14 tablet:max-w-[1560px] tablet:gap-6 desktop:grid desktop:grid-cols-2 desktop:gap-3">
        <SectionHeader
          eyebrow={faqEyebrow}
          align="start"
          title={
            <>
              {faqTitle[0]}
              <br className="max-tablet:hidden" /> {faqTitle[1]}
            </>
          }
        />

        {/* 44px of lead-in above the first row, so it sits level with the
            heading's second line rather than its cap height. */}
        <FaqList />
      </div>
    </Section>
  );
}
