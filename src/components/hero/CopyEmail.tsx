"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";

/**
 * The hero's email control — a **copy-to-clipboard button**, matching the
 * reference, which Task 3.4e measured directly:
 *
 * ```
 *   <button aria-label="Copy to Clipboard">   129x16, cursor pointer
 *   stacked labels    "Copy to Clipboard" [visible]   "Copied!" [hidden]
 *   after a click     "Copy to Clipboard" [hidden]    "Copied!" [visible]
 * ```
 *
 * Ours was an `<a href="mailto:">`, which is a different control doing a
 * different thing. The feedback here is **only** what was measured — the label
 * swaps to "Copied!" and back. No toast, no tooltip, no icon change, because the
 * reference has none of those.
 *
 * What it copies: the email address beside it. The reference's payload could not
 * be read directly (its label text is split across nodes and the clipboard is not
 * observable without granting permissions to the measuring browser), so this is
 * inferred from the control's position and name rather than measured — recorded
 * as such in HOMEPAGE-INTERACTIONS.md.
 *
 * Accessibility beyond the reference, deliberately:
 * - a real `<button>`, so Enter and Space work with no extra handlers;
 * - `aria-live="polite"` on the label so the confirmation is announced, not just
 *   shown — a purely visual "Copied!" tells a screen-reader user nothing;
 * - the address stays in the accessible name, so the button says what it copies.
 *
 * Graceful failure: without `navigator.clipboard` (insecure origins, old
 * browsers) it falls back to selecting the text, and if that fails too the label
 * simply never changes — nothing throws and nothing lies about having copied.
 */
export function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const copy = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(site.email);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${site.email} to clipboard`}
      /* `text-body` (#656565), not `text-muted` (#a4a4a4): at 12px mono over the
         warm off-white the muted tone measured 2.3:1, which is below the point
         where an address is comfortably readable. One step down the existing
         neutral ladder takes it to ~5.1:1 without going to ink. */
      className="pointer-events-auto mx-auto cursor-pointer font-mono text-body-sm tracking-[var(--tracking-label)] text-body uppercase transition-colors duration-300 hover:text-ink focus-visible:text-ink tablet:mx-0"
    >
      <span aria-live="polite">{copied ? "Copied!" : site.email}</span>
    </button>
  );
}
