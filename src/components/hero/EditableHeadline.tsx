"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The hero headline, edited as ONE unit.
 *
 * The tagline is a single editable object: one pencil, one toolbar, one
 * formatting state shared by every keyword in `hero.headline`. Formatting
 * "GREATEST SOLUTIONS" formats "DIGITAL PROBLEMS" in the same click, because
 * there is only one `format` — the keywords do not each own a copy of it.
 *
 * This replaces a per-keyword model (a pencil, a toolbar and a `Record<id,
 * Format>` entry each). That model made the two keywords feel like two separate
 * widgets that happened to share a headline; the client wants the whole tagline
 * to read as one editable thing.
 *
 * Anchoring, which is the other half of the brief: the toolbar lives in a
 * **stable slot** below the whole tagline, never inside a keyword.
 *
 * ```
 *   root (width comes from the h1, not from the text)
 *     ├── tagline lines
 *     └── toolbar slot  ← absolute toolbar, centred on the root
 * ```
 *
 * Nothing in that chain reads live text metrics, which is what stops the toolbar
 * jumping. The root is a block: its width is the h1's, so bold and heading
 * changes cannot move it. Heading size is a `scale` transform, which does not
 * affect layout, and the lines are `whitespace-nowrap`, so the tagline's height
 * is fixed too. The toolbar is absolutely positioned, so opening it cannot push
 * the tagline, the hero or the supporting text anywhere.
 *
 * No `contenteditable`: the text never changes, only five style properties, and
 * controlled state keeps the accessible name stable.
 *
 * Measured chip geometry (reference, 1440), preserved:
 *
 * ```
 *   chip 276x37 · white · radius 12 · padding 4 · gap 4
 *   heading control 100x28 · radius 6 · Inter 14/20 500 · tracking -0.28
 *   divider 1px in a 7x29 box · B/I/U 28x28 · A+chevron 46x28
 * ```
 */

/**
 * The two ends of the wght axis. 350 is the resting weight globals.css pins for
 * the display face; 575 is clearly bolder without the display-black look 700
 * gave. `font-variation-settings` is what renders — it overrides `font-weight`,
 * so setting weight here would change the computed value and draw nothing.
 */
const NORMAL_WEIGHT = 350;
const BOLD_WEIGHT = 575;

/* Short labels: the long form crowded the popover and the 100px trigger. */
const SIZES = [
  { id: "h1", label: "H1", scale: 1 },
  { id: "h2", label: "H2", scale: 0.8 },
  { id: "h3", label: "H3", scale: 0.64 },
] as const;

/**
 * Five colours drawn from the site's own tokens — no blue, no purple, no
 * gradients. Each `hex` is stated literally so the swatch shows exactly what it
 * applies: reading the colour from a CSS variable at paint time meant a swatch
 * could render one colour and set another if a token ever moved.
 */
const COLORS = [
  { id: "ink", label: "Ink", hex: "#1B1B1B" },
  { id: "forest", label: "Deep green", hex: "#0C4B24" },
  { id: "emerald", label: "Emerald", hex: "#16713C" },
  { id: "leaf", label: "Soft green", hex: "#3F8159" },
  { id: "grey", label: "Muted grey", hex: "#8A8A8A" },
  { id: "mist", label: "Pale green", hex: "#DCEDE2" },
] as const;

type SizeId = (typeof SIZES)[number]["id"];
type ColorId = (typeof COLORS)[number]["id"];

interface Format {
  size: SizeId;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: ColorId;
}

const DEFAULT_FORMAT: Format = { size: "h1", bold: false, italic: false, underline: false, color: "ink" };

export interface HeadlineRun {
  text: string;
  /** Present ⇒ this run is an editable keyword. All keywords share one format. */
  id?: string;
}

const chevron = (
  <svg viewBox="0 0 12 12" className="size-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M3 4.5 6 7.5 9 4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Divider = () => (
  <span aria-hidden="true" className="flex h-[29px] w-[7px] shrink-0 items-center justify-center py-[3px]">
    <span className="h-full w-px bg-[rgb(0_0_0/0.08)]" />
  </span>
);

/** 28x28 toggle. `aria-pressed` is what makes the state audible to a screen reader. */
function Toggle({
  on, onClick, label, className, children,
}: {
  on: boolean; onClick: () => void; label: string; className?: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      title={label}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-[6px] text-[14px]/[20px] transition-colors",
        "hover:bg-[rgb(0_0_0/0.04)] focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none",
        on ? "bg-[rgb(0_0_0/0.06)] text-[rgb(20_20_20)]" : "text-[rgb(153_153_153)]",
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">{children}</span>
    </button>
  );
}

export function EditableHeadline({ lines }: { lines: readonly (readonly HeadlineRun[])[] }) {
  /* ONE format for the whole keyword group — this is the shared state the two
     keywords render from. There is deliberately no per-keyword record. */
  const [format, setFormat] = useState<Format>(DEFAULT_FORMAT);
  /*
   * Open on load, every load. The toolbar is the thing that announces the
   * tagline is editable, so hiding it until a click made the feature invisible
   * to anyone who did not already know it was there.
   *
   * Deliberately NOT persisted: nothing writes this to storage, so a refresh
   * always comes back open regardless of how the visitor left it. The pencil is
   * a visibility toggle for the session, not a saved preference.
   */
  const [open, setOpen] = useState(true);
  const [openMenu, setOpenMenu] = useState<null | "size" | "color">(null);
  const rootRef = useRef<HTMLSpanElement>(null);
  const pencilRef = useRef<HTMLButtonElement>(null);
  const toolbarId = useId();

  const update = (patch: Partial<Format>) => setFormat((prev) => ({ ...prev, ...patch }));

  const activeSize = SIZES.find((s) => s.id === format.size) ?? SIZES[0];
  const activeColor = COLORS.find((c) => c.id === format.color) ?? COLORS[0];

  /*
   * Close on outside pointerdown or Escape — the only two ways out besides the
   * pencil itself. The listener is scoped to the whole editor root, so every
   * formatting control is "inside" by construction: clicking Bold, a swatch or
   * H2 can never close the toolbar, which was an explicit requirement.
   */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // Escape unwinds one layer at a time: an open popover first, then the bar.
      if (openMenu) {
        setOpenMenu(null);
        return;
      }
      /*
       * Only RECLAIM focus if this editor had it to begin with.
       *
       * This listener is on `document`, so it fires for every Escape on the page,
       * and the toolbar is open by default — so an unconditional `focus()` here
       * hijacked focus from whatever the visitor was actually dismissing. Pressing
       * Escape to close the navbar's Services panel landed focus on this pencil
       * instead of back on the Services trigger, and the same happened from any
       * other control on the page.
       *
       * `activeElement` is read BEFORE the state change, so it still reports where
       * focus was when the key was pressed. When focus is elsewhere the bar still
       * closes — that behaviour predates this fix — but focus is left exactly
       * where the visitor put it, and the handler that owns it can do its job.
       */
      const hadFocus = rootRef.current?.contains(document.activeElement) ?? false;
      setOpen(false);
      if (hadFocus) pencilRef.current?.focus();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, openMenu]);

  const lastLine = lines.length - 1;

  return (
    /* `relative` and `block`: the positioning context for the toolbar slot. Its
       width is the h1's, never the text's, which is what makes the anchor
       immune to formatting changes. */
    <span ref={rootRef} data-hero-editor className="relative block">
      <span className="flex flex-col gap-2">
        {lines.map((line, i) => (
          /* `whitespace-nowrap` guarantees the composition is two lines, not
             three or four. The two runs on a line use different families and sizes,
             so normal wrapping breaks between them at awkward widths; the sizes
             below are chosen small enough that neither line needs to wrap even at
             390. */
          /*
            Each line is a baseline-aligned flex row, not an inline run. The keyword
            pill is an inline-block whose padding overflows the text line box, so
            with inline layout the row reported a smaller height than the pill and
            the column gap measured from the wrong edge — the two pills overlapped
            by ~2px. As flex items the row's height IS the pill's height, so the
            column gap below separates the real boxes. `items-baseline` keeps the
            keyword on the same baseline as the words before it.
          */
          <span key={i} className="flex items-baseline gap-[0.34em] whitespace-nowrap">
            {line.map((run, j) =>
              run.id ? (
                <Keyword
                  key={run.id}
                  id={run.id}
                  text={run.text}
                  format={format}
                  activeSize={activeSize}
                  activeColor={activeColor}
                  open={open}
                  /* Every keyword opens the SAME editor. Not a toggle: the
                     documented ways to close are the pencil, outside and Escape. */
                  onActivate={() => setOpen(true)}
                />
              ) : (
                /* Surrounding words: Inter, smaller, and set slightly loose so they
                   read as support rather than competing with the keywords. They sit
                   outside the formatting group and keep their own typography. */
                <span
                  key={j}
                  /* The `max-[374px]` step exists because the clamp floors out at
                     ~894px and then holds 15.2px all the way down, which makes the
                     nowrap line 340px wide inside a 272px column at 320 — the
                     tagline was clipped, and worse, it turned #hero into a scroll
                     container, so focusing the editor scrolled the whole hero
                     sideways. Sized to fit at 320; nothing at 375 and up changes. */
                  className="font-sans text-[clamp(0.95rem,1.7vw,1.5rem)] font-normal tracking-[-0.01em] text-body max-[374px]:text-[0.76rem]"
                >
                  {run.text}
                </span>
              ),
            )}

            {/*
              THE pencil — one per headline, parked at the end of the last line so
              it reads as belonging to the whole tagline rather than to the keyword
              it happens to follow. It is the toggle; the keywords only open.
            */}
            {i === lastLine && (
              <button
                ref={pencilRef}
                type="button"
                data-hero-pencil
                onClick={() => {
                  setOpen((v) => !v);
                  setOpenMenu(null);
                }}
                aria-expanded={open}
                aria-controls={open ? toolbarId : undefined}
                aria-label="Edit the headline"
                title="Edit the headline"
                className={cn(
                  /* `pointer-events-auto`: the hero Container is
                     `pointer-events-none` so the ripple owns the surface, and
                     controls opt back in individually. */
                  "pointer-events-auto grid size-[34px] shrink-0 cursor-pointer place-items-center self-center max-[374px]:size-[30px]",
                  /* A circular control rather than a bare glyph: a hairline green
                     ring over a translucent white interior — the same
                     hairline-plus-glass recipe the navbar's menu button and the
                     keyword panels use, so it reads as part of the system rather
                     than a floating icon. The mark itself stays brand green. */
                  "rounded-full border border-[rgba(22,113,60,0.28)] bg-[rgba(255,255,255,0.72)] backdrop-blur-[6px]",
                  "text-[#2E7D32] transition-[opacity,background-color,border-color] duration-200 ease-[var(--ease-brand)]",
                  "select-none hover:border-[rgba(22,113,60,0.45)] hover:bg-[rgba(255,255,255,0.9)] focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none",
                  open ? "opacity-100" : "opacity-85 hover:opacity-100",
                )}
              >
                <svg viewBox="0 0 14 14" className="size-[19px] max-[374px]:size-[17px]" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9.6 2 12 4.4 5 11.4 2 12l.6-3z" />
                  <path d="M8.4 3.2 10.8 5.6" />
                </svg>
              </button>
            )}
          </span>
        ))}
      </span>

      {/*
        The stable toolbar slot.

        Below `tablet` the supporting paragraph sits directly under the headline,
        so the slot reserves the chip's band permanently — open or closed, the
        page is laid out the same, which is why opening the toolbar never moves
        the paragraph. Above `tablet` the headline has empty hero beneath it and
        the slot collapses to nothing; the chip simply overlays that space.
      */}
      <span className="relative block h-8 tablet:h-0">
        {open && (
          <span
            id={toolbarId}
            data-editor-toolbar
            role="toolbar"
            aria-label="Headline formatting"
            className={
              /* Anchored to this slot — 11px below the last line, and NOT to any
                 keyword's box. Nothing here is derived from live text metrics, so
                 Bold/Italic/H2/colour change the type without moving the chip by
                 a pixel.

                 Horizontally the chip's centre sits at 58% of the tagline block
                 from `tablet` up, rather than at 50%. Measured, not guessed: with
                 the chip hidden, the clean band under the tagline runs out at
                 ~46% of the width, where the sculpture's rising edge crosses it.
                 58% clears that edge with room to spare, while 66% already clips
                 it and the block's right edge (the previous attempt) puts the
                 whole chip on the glass.

                 It stays a fraction of the CONTAINER, not a pixel offset, so it
                 cannot drift when the text reflows or the window resizes. Below
                 `tablet` it stays centred: the sculpture is a portrait crop well
                 below the tagline there, and a shift would push the chip past the
                 viewport at 320. */
              "pointer-events-auto absolute top-[11px] left-1/2 z-30 -translate-x-1/2 tablet:left-[58%] " +
              /* `max-w-full` plus a shrinkable heading control is the whole
                 responsive story: at 320 the chip narrows instead of overflowing,
                 and no second mobile toolbar exists. */
              "flex h-[37px] w-[276px] max-w-full items-center gap-1 " +
              "rounded-[12px] bg-white p-1 text-left " +
              "shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_1px_2px_rgb(0_0_0/0.08),0_4px_6px_rgb(0_0_0/0.04)]"
            }
          >
            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "size" ? null : "size")}
              aria-expanded={openMenu === "size"}
              aria-haspopup="menu"
              className="flex h-7 w-[100px] min-w-[58px] items-center gap-1 rounded-[6px] py-1 pr-1.5 pl-2 font-sans text-[14px]/[20px] font-medium tracking-[-0.28px] text-[rgb(20_20_20)] transition-colors hover:bg-[rgb(0_0_0/0.04)] focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
            >
              <span className="flex-1 truncate">{activeSize.label}</span>
              {chevron}
            </button>
            {openMenu === "size" && (
              <span role="menu" className="absolute top-full left-1 mt-1 flex w-[92px] flex-col rounded-[10px] bg-white p-1 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_6px_16px_rgb(0_0_0/0.12)]">
                {SIZES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={s.id === format.size}
                    onClick={() => { update({ size: s.id }); setOpenMenu(null); }}
                    className={cn(
                      "rounded-[6px] px-2 py-1.5 text-left font-sans text-[14px]/[20px] transition-colors hover:bg-[rgb(0_0_0/0.04)] focus-visible:outline-none",
                      s.id === format.size ? "font-medium text-[rgb(20_20_20)]" : "text-[rgb(101_101_101)]",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </span>
            )}

            <Divider />

            <Toggle on={format.bold} onClick={() => update({ bold: !format.bold })} label="Bold" className="font-sans font-semibold">B</Toggle>
            <Toggle on={format.italic} onClick={() => update({ italic: !format.italic })} label="Italic" className="font-serif italic">I</Toggle>
            <Toggle on={format.underline} onClick={() => update({ underline: !format.underline })} label="Underline" className="font-sans underline underline-offset-2">U</Toggle>

            <Divider />

            <button
              type="button"
              onClick={() => setOpenMenu(openMenu === "color" ? null : "color")}
              aria-expanded={openMenu === "color"}
              aria-haspopup="menu"
              className="flex h-7 w-[46px] shrink-0 items-center justify-center gap-0.5 rounded-[6px] font-sans text-[16px]/[20px] font-medium transition-colors hover:bg-[rgb(0_0_0/0.04)] focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
              style={{ color: activeColor.hex }}
            >
              <span className="sr-only">Text colour</span>
              <span aria-hidden="true">A</span>
              {chevron}
            </button>
            {openMenu === "color" && (
              <span role="menu" className="absolute top-full right-1 mt-1 flex gap-1 rounded-[10px] bg-white p-1.5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_6px_16px_rgb(0_0_0/0.12)]">
                {COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={c.id === format.color}
                    onClick={() => { update({ color: c.id }); setOpenMenu(null); }}
                    title={c.label}
                    className={cn(
                      "size-6 shrink-0 rounded-full transition-[box-shadow] focus-visible:outline-none",
                      c.id === format.color ? "ring-2 ring-brand-green/60 ring-offset-2" : "ring-1 ring-black/10",
                    )}
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className="sr-only">{c.label}</span>
                  </button>
                ))}
              </span>
            )}
          </span>
        )}
      </span>
    </span>
  );
}

/**
 * One keyword. It renders from the shared format and owns no formatting state of
 * its own — that is the whole point of the unification. It is a click target for
 * the editor and nothing else: no pencil, no toolbar.
 */
function Keyword({
  id, text, format, activeSize, activeColor, open, onActivate,
}: {
  id: string;
  text: string;
  format: Format;
  activeSize: (typeof SIZES)[number];
  activeColor: (typeof COLORS)[number];
  open: boolean;
  onActivate: () => void;
}) {
  return (
    /*
      A span with button semantics, NOT a <button>. Chromium treats form
      controls as internal flex containers and centres their content, so a
      button's element baseline is not its text baseline — `vertical-align:
      baseline` left the keyword sitting 25.5px below "we build the" instead of
      on the same line. A span participates in inline layout normally, so the
      baselines meet. Role, tabIndex and keyboard handling keep it operable.
    */
    <span
      data-keyword={id}
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate();
        }
      }}
      aria-expanded={open}
      title="Edit the headline"
      className={cn(
        /* Keywords: Fraunces, the brand display face, at roughly 2.4x the
           surrounding words. That size ratio — not weight — is what makes them
           the focal point, and the family contrast is a real pairing rather
           than a bolder version of the same font. */
        "font-display text-[clamp(1.25rem,2.3vw,2.125rem)] leading-[1.1] tracking-[-0.02em] text-ink",
        /* Same 320-only step as the surrounding words — see the note there. The
           keyword/surround size ratio is preserved, so the hierarchy is unchanged. */
        "max-[374px]:text-[1rem]",
        /*
          Frosted glass, per spec: a light green tint over a 12px blur at 160%
          saturation, so the sculpture reads through the panel instead of being
          hidden by a solid fill. No border and no default underline — the pencil
          is the affordance. Padding is in `em` so it tracks the keyword's own
          size through H1/H2/H3, and is now symmetric: the right gutter existed
          only to hold the per-keyword pencil, which no longer exists.
        */
        "pointer-events-auto relative inline-block cursor-pointer rounded-[14px] px-[0.72em] py-[0.34em] text-left align-baseline",
        "bg-[rgba(220,237,226,0.45)] backdrop-blur-[12px] backdrop-saturate-[1.6]",
        "transition-colors duration-200 hover:bg-[rgba(220,237,226,0.62)]",
        open && "bg-[rgba(220,237,226,0.7)]",
        "origin-left transition-[scale,color,background-color,border-color] duration-300 ease-[var(--ease-brand)]",
        "focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none",
        format.italic && "italic",
        format.underline && "underline decoration-from-font underline-offset-[0.08em]",
      )}
      style={{
        color: activeColor.hex,
        // A transform, so heading size cannot reflow the hero or move the toolbar.
        scale: String(activeSize.scale),
        // The wght axis, not font-weight — see NORMAL_WEIGHT above.
        fontVariationSettings: `"SOFT" 100, "WONK" 1, "wght" ${format.bold ? BOLD_WEIGHT : NORMAL_WEIGHT}`,
      }}
    >
      {text}
    </span>
  );
}
