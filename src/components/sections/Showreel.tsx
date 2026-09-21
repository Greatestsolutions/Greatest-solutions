import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Marquee } from "@/components/ui/Marquee";
import { ShowreelPlayer } from "@/components/sections/ShowreelPlayer";
import { showreel } from "@/data/showreel";

/**
 * Showreel — the giant type passes BEHIND the video, so only its left and right
 * thirds are visible. Reading it as a caption above the video loses the depth.
 *
 * ## The vertical budget, measured at all 12 viewports (SHOWREEL-SECTION.md)
 *
 * ```
 *            section = padding + block          block = video + reflection
 *   ≥1280      889.75 = 160 + 729.75            729.75 = 483.75 + 246
 *   1024       873.75 = 144 + 729.75
 *   810        810.67 = 144 + 666.67            666.67 = 420.67 + 246
 *   ≤809       514.45 = 192 + 322.45            322.45 = 210.45 + 112
 * ```
 *
 * Two of these are unchanged; one moved with the swap to the real reel:
 *
 * 1. **The video is now genuinely `16/9`** (the real file is 1280×720) rather
 *    than the placeholder's idiosyncratic `1920/1062` (ratio 1.8078). At 860
 *    wide that is 483.75, not 475.73 — an 8px difference in the video's own
 *    height, absorbed entirely by `aspect-video` below; nothing else in this
 *    file's geometry depends on the exact ratio.
 * 2. **The reflection is a fixed 246px (≥810) or 112px (≤809)** — not a ratio,
 *    so it is untouched by the video's own height changing.
 * 3. **Phone padding is 192px total**, against the shared scale's 128.
 *
 * ### The bug this replaced
 *
 * The column carried `pb-[29%]` to reserve the reflection's space. **Percentage
 * padding resolves against the containing block's width, not the element's own**,
 * and the parent here is the `Container` content box — so at 1440 it computed
 * 0.29 × 1296 = **375.8px** rather than the intended 0.29 × 860 = 249. That single
 * mistake made the section 1019.58 against the reference's 881.73, the ~15%
 * discrepancy carried in the report since Task 1. It was also wrong in the other
 * direction lower down: 216 at 810 where 246 was needed, and 99 at 390 where 112
 * was. Reserving the space with a real element removes the class of bug entirely.
 *
 * The foreground video is click-to-play with sound (the real reel has real
 * audio to hear); the reflection below it stays autoplay/muted/loop, since it
 * is decorative and never audible either way. See the notes on each below.
 */
export function Showreel() {
  return (
    <Section
      id="showreel"
      label="Showreel"
      container={false}
      // Phone padding is 96 top and bottom — measured 192 total at 320, 375, 390,
      // 430 and 768, against the shared scale's 128.
      className="overflow-hidden max-tablet:py-24"
    >
      <Container>
        {/*
          The block: the video plus the space the reflection occupies. Capped at
          the measured 1200 — wider than the 860 video, which is what lets the
          reflection spill past it as the reference's does.

          Full-bleed to the 12px page edge on phone, the same −12px correction
          Works, Blog, Clients and Testimonials use: the reference's phone block
          measures viewport − 24 (366 at 390, 406 at 430, 296 at 320), where the
          text column is viewport − 48. Without it the video is 342 wide instead
          of 366 and the section lands 13.29px short.
        */}
        <div className="mx-auto w-full max-w-[1200px] max-tablet:-mx-3 max-tablet:w-auto">
          <div className="relative mx-auto aspect-video w-full max-w-[860px]">
            {/*
              Giant type, behind the video. Pulled far outside the column so it
              runs the full width of the page; the Section clips it. `aria-hidden`
              because it is a visual texture and the section is already named.

              Centred on the video's own mid-line: the reference absolutely
              positions the 128px band at top 238 — exactly half the 476 video —
              then translates it up 64, half the band's own height.
            */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 -left-[100vw] z-0 w-[300vw] -translate-y-1/2 opacity-30"
            >
              <Marquee duration={34} trackClassName="items-center">
                {Array.from({ length: 6 }).map((_, index) => (
                  <span
                    key={index}
                    className="shrink-0 pr-14 font-display text-[clamp(3.5rem,10vw,8rem)] leading-none tracking-[var(--tracking-display)] whitespace-nowrap text-muted"
                  >
                    {showreel.marquee} ·
                  </span>
                ))}
              </Marquee>
            </div>

            {/*
              The video sits above the type and fills the aspect box.

              **No longer autoplay-muted-loop.** That pattern (measured off a
              reference, Task 3.5) was only ever right for the placeholder clip
              it was built around — ambient B-roll with nothing to listen to.
              The real reel carries mastered narration/score (AAC, peaking at
              -0.9 dB — genuine signal, not an empty track), so silently looping
              it would throw away the one thing that makes it a reel rather than
              wallpaper. `ShowreelPlayer` is click-to-play with sound instead,
              the same play-button affordance Works already uses for its own
              videos with audio — one interaction pattern for "this video has
              something to hear," not two.

              This also buys back the client boundary the muted version paid to
              avoid: `ShowreelPlayer` is the one client component this section
              needs (play/pause state), same "thin wrapper" shape as `PlayButton`
              — everything else here, including the reflection below, stays
              server-rendered.
            */}
            <div className="relative z-10 size-full overflow-hidden rounded-[32px] bg-brand-forest">
              <ShowreelPlayer />
            </div>
          </div>

          {/*
            Reflection: a blurred, faded echo below the video. A real block with a
            measured height rather than percentage padding — that is what reserves
            the section's remaining space, and what the old `pb-[29%]` got wrong.

            8px top pad, 6px blur and the upward-fading mask are the reference's.
            The echo itself is a tinted panel rather than a mirrored copy of the
            video — the reference mirrors a second <video>, which would double the
            decode cost for a decorative smudge. Intentional difference since Task 1.

            It is now the **actual video**, mirrored — a flat tinted panel stayed
            blank while the reel played, which is the one thing a reflection must
            not do. Same `src`, so this is a cache hit rather than a second
            download; the cost is a second decode of an already-resident file.

            Untouched by the foreground's move to click-to-play: `muted` here
            means the real reel's audio never conflicts with anything, so this
            can keep autoplaying on its own loop as pure ambient motion whether
            or not the foreground has been played yet. It runs on its own clock
            rather than the foreground's — the two aren't frame-synced — but at
            30% opacity through a 6px blur, both desaturated, that was never
            perceptible enough to be worth a shared-state fix.

            `saturate-0` keeps the neutral grey established earlier (the old
            `bg-brand-forest` panel averaged rgb(205 214 206) against the
            reference's flat rgb(208 207 206), a green cast of +9 on G). Opacity,
            blur and the upward fade are unchanged.
          */}
          <div
            data-reflection
            aria-hidden="true"
            className="h-[112px] overflow-hidden pt-2 tablet:h-[246px] [mask-image:linear-gradient(to_top,transparent,black)] [mask-mode:alpha]"
          >
            <video
              className="mx-auto size-full max-w-[860px] -scale-y-100 rounded-[32px] object-cover opacity-30 blur-[6px] saturate-0"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src={showreel.src} type="video/mp4" />
            </video>
          </div>
        </div>
      </Container>
    </Section>
  );
}
