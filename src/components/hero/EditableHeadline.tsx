"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * The hero headline, with independently editable keywords.
 *
 * ONE editor system, not one per keyword. This component renders every line from
 * `hero.headline` and keeps a formatting record keyed by keyword id, so
 * "GREATEST SOLUTIONS" and "DIGITAL PROBLEMS" have genuinely separate state —
 * bolding one cannot touch the other — while sharing a single implementation.
 * Adding a third editable keyword is a data edit in `hero.ts`.
 *
 * The toolbar belongs to whichever keyword is *active*. Clicking a keyword
 * activates it; clicking elsewhere or pressing Escape deactivates. With two
 * keywords an always-visible toolbar would stack two chips under one headline,
 * so selection decides which is shown.
 *
 * No `contenteditable`: the text never changes, only five style properties, and
 * controlled state keeps the accessible name stable.
 *
 * Sizing is a `scale` on an inline-block rather than a `font-size` change — the
 * line box is fixed by the h1's line-height, so smaller headings shrink the
 * glyphs without reflowing the hero.
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
  /** Present ⇒ this run is an editable keyword, and this keys its format state. */
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
        "flex size-7 items-center justify-center rounded-[6px] text-[14px]/[20px] transition-colors",
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
  const [formats, setFormats] = useState<Record<string, Format>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<null | "size" | "color">(null);
  const rootRef = useRef<HTMLSpanElement>(null);

  const formatOf = (id: string) => formats[id] ?? DEFAULT_FORMAT;
  const update = (id: string, patch: Partial<Format>) =>
    setFormats((prev) => ({ ...prev, [id]: { ...(prev[id] ?? DEFAULT_FORMAT), ...patch } }));

  // Deactivate on outside click or Escape. Bound once for the whole headline
  // rather than per keyword, so two keywords can never both be active.
  useEffect(() => {
    if (!activeId) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setActiveId(null);
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openMenu) setOpenMenu(null);
      else setActiveId(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [activeId, openMenu]);

  return (
    <span ref={rootRef} className="flex flex-col gap-2">
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
                format={formatOf(run.id)}
                active={activeId === run.id}
                placement={j === 0 || i === 0 ? "above" : "below"}
                openMenu={activeId === run.id ? openMenu : null}
                onActivate={(clicked) => {
                  // Toggle: the same pencil/keyword closes an open editor.
                  setActiveId((current) => (current === clicked ? null : clicked));
                  setOpenMenu(null);
                }}
                onOpenMenu={setOpenMenu}
                onChange={(patch) => update(run.id as string, patch)}
              />
            ) : (
              /* Surrounding words: Inter, smaller, and set slightly loose so they
                 read as support rather than competing with the keywords. */
              <span
                key={j}
                className="font-sans text-[clamp(0.95rem,1.7vw,1.5rem)] font-normal tracking-[-0.01em] text-body"
              >
                {run.text}
              </span>
            ),
          )}
        </span>
      ))}
    </span>
  );
}

function Keyword({
  id, text, format, active, placement, openMenu, onActivate, onOpenMenu, onChange,
}: {
  id: string;
  /** Fixed slot for this keyword's toolbar. Never derived from live text metrics. */
  placement: "above" | "below";
  text: string;
  format: Format;
  active: boolean;
  openMenu: null | "size" | "color";
  onActivate: (id: string) => void;
  onOpenMenu: (menu: null | "size" | "color") => void;
  onChange: (patch: Partial<Format>) => void;
}) {
  const activeSize = SIZES.find((s) => s.id === format.size) ?? SIZES[0];
  const activeColor = COLORS.find((c) => c.id === format.color) ?? COLORS[0];

  /*
   * The toolbar sits in a fixed SLOT belonging to the keyword — above for the
   * first keyword, below for the second — and is absolutely positioned inside the
   * keyword's own wrapper.
   *
   * The previous version measured `getBoundingClientRect()` and re-placed the
   * toolbar whenever `format` changed, which is precisely why it jumped on every
   * Bold/Italic/H2 click. Nothing here reads the keyword's live dimensions, so
   * formatting cannot move it: the wrapper's layout box is stable (heading size is
   * a `scale` transform, which does not affect layout), and `left-0` anchors to an
   * edge that never moves.
   */

  return (
    /* `mb-12` on phone only while the toolbar is open: it reserves the chip's own
       space (11px offset + 37px chip) where the tagline sits directly beneath. */
    <span
      data-keyword={id}
      className={cn("group/kw relative inline-block align-top")}
    >
      {/*
        A span with button semantics, NOT a <button>. Chromium treats form
        controls as internal flex containers and centres their content, so a
        button's element baseline is not its text baseline — `vertical-align:
        baseline` left the keyword sitting 25.5px below "We Build The" instead of
        on the same line. A span participates in inline layout normally, so the
        baselines meet. Role, tabIndex and keyboard handling keep it operable.
      */}
      <span
        role="button"
        tabIndex={0}
        onClick={() => onActivate(id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onActivate(id);
          }
        }}
        aria-expanded={active}
        title={`Edit ${text}`}
        className={cn(
          /* Keywords: Fraunces, the brand display face, at roughly 2.4x the
             surrounding words. That size ratio — not weight — is what makes them
             the focal point, and the family contrast is a real pairing rather
             than a bolder version of the same font. `leading-[1.02]` keeps the two
             keyword lines tight so the block stays clear of the sculpture. */
          "font-display text-[clamp(1.25rem,2.3vw,2.125rem)] leading-[1.1] tracking-[-0.02em] text-ink",
          /*
            Frosted glass, per spec: translucent white over a 12px blur and 160%
            saturation, so the sculpture reads through the panel instead of being
            hidden by a solid fill. No border and no underline — the pencil is the
            affordance now, so the dotted rule that used to carry that job is gone.
            Padding is in `em` so it tracks the keyword's own size through H1/H2/H3.
          */
          "pointer-events-auto relative inline-block cursor-pointer rounded-[14px] py-[0.34em] pr-[1.95em] pl-[0.72em] text-left align-baseline",
                    /* Light green frosted glass: rgba(220,237,226,0.45) over a 12px blur at
             160% saturation. Tinted rather than white, so it reads against the
             near-white hero background instead of disappearing into it. */
          "bg-[rgba(220,237,226,0.45)] backdrop-blur-[12px] backdrop-saturate-[1.6]",
          "transition-colors duration-200 hover:bg-[rgba(220,237,226,0.62)]",
          active && "bg-[rgba(220,237,226,0.7)]",
          "origin-left transition-[scale,color,background-color,border-color] duration-300 ease-[var(--ease-brand)]",
          "focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none",
          format.italic && "italic",
          format.underline && "underline decoration-from-font underline-offset-[0.08em]",
        )}
        style={{
          color: activeColor.hex,
          scale: String(activeSize.scale),
          // The wght axis, not font-weight — see NORMAL_WEIGHT above.
          fontVariationSettings: `"SOFT" 100, "WONK" 1, "wght" ${format.bold ? BOLD_WEIGHT : NORMAL_WEIGHT}`,
        }}
      >
        {text}
        {/*
          The affordance lives INSIDE the keyword's own highlight box, in a right
          gutter reserved permanently by `pr-8` — so revealing it on hover cannot
          shift the layout or push a letter, and it can never read as a control
          floating loose over the hero. 12px, fades and scales 0.9 → 1.
        */}
        {/*
          Always visible, inside the glass panel at the far right, in the gutter
          `pr-[2.1em]` reserves. `pointer-events-none` on purpose: the click still
          lands on the enclosing keyword button, so the icon opens the editor
          without being a second focus stop.
        */}
        {/* Its own button so the pointer cursor is unambiguous and the hit area is
            real; `stopPropagation` keeps the outer handler from double-firing. */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onActivate(id); }}
          aria-label={`Edit ${text}`}
          className="absolute top-1/2 right-[0.62em] grid -translate-y-1/2 cursor-pointer place-items-center text-[#2E7D32] opacity-80 transition-opacity duration-200 ease-[var(--ease-brand)] hover:opacity-100 focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
        >
          <svg viewBox="0 0 14 14" className="size-[17px]" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.6 2 12 4.4 5 11.4 2 12l.6-3z" /><path d="M8.4 3.2 10.8 5.6" />
          </svg>
        </button>
      </span>


      {active && (
        <span
          data-editor-toolbar
          data-placement={placement}
          className={
            /* `pointer-events-auto` is load-bearing: the hero Container is
               `pointer-events-none` so the ripple gets the surface, and controls
               opt back in individually. Without it clicks land on the canvas. */
                        /*
              Anchored to the keyword's LEFT edge, not centred on it.
              
              Centring meant the chip moved whenever formatting changed the
              keyword's width — bold and heading size both do — so a second click
              in quick succession landed on a different button than the one under
              the cursor a moment earlier. The keyword scales from `origin-left`,
              so its left edge is the one fixed point; anchoring there removes the
              drift entirely. It also keeps the chip inside the viewport, since
              keywords start at the container's left margin.
            */
            "pointer-events-auto absolute left-0 z-30 flex h-[37px] w-[276px] items-center gap-1 " +
            (placement === "above" ? "bottom-full mb-[11px] " : "top-full mt-[11px] ") +
            "rounded-[12px] bg-white p-1 text-left " +
            "shadow-[0_0_0_1px_rgb(0_0_0/0.04),0_1px_2px_rgb(0_0_0/0.08),0_4px_6px_rgb(0_0_0/0.04)]"
          }
        >
          <button
            type="button"
            onClick={() => onOpenMenu(openMenu === "size" ? null : "size")}
            aria-expanded={openMenu === "size"}
            aria-haspopup="menu"
            className="flex h-7 w-[100px] items-center gap-1 rounded-[6px] py-1 pr-1.5 pl-2 font-sans text-[14px]/[20px] font-medium tracking-[-0.28px] text-[rgb(20_20_20)] transition-colors hover:bg-[rgb(0_0_0/0.04)] focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
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
                  onClick={() => { onChange({ size: s.id }); onOpenMenu(null); }}
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

          <Toggle on={format.bold} onClick={() => onChange({ bold: !format.bold })} label="Bold" className="font-sans font-semibold">B</Toggle>
          <Toggle on={format.italic} onClick={() => onChange({ italic: !format.italic })} label="Italic" className="font-serif italic">I</Toggle>
          <Toggle on={format.underline} onClick={() => onChange({ underline: !format.underline })} label="Underline" className="font-sans underline underline-offset-2">U</Toggle>

          <Divider />

          <button
            type="button"
            onClick={() => onOpenMenu(openMenu === "color" ? null : "color")}
            aria-expanded={openMenu === "color"}
            aria-haspopup="menu"
            className="flex h-7 w-[46px] items-center justify-center gap-0.5 rounded-[6px] font-sans text-[16px]/[20px] font-medium transition-colors hover:bg-[rgb(0_0_0/0.04)] focus-visible:ring-2 focus-visible:ring-brand-green/40 focus-visible:outline-none"
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
                  onClick={() => { onChange({ color: c.id }); onOpenMenu(null); }}
                  title={c.label}
                  className={cn(
                    "size-6 rounded-full transition-[box-shadow] focus-visible:outline-none",
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
  );
}
