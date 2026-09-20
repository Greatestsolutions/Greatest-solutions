import type { ReactNode } from "react";

/**
 * Marks a spot in the Privacy Policy / Terms of Service where a real legal
 * decision hasn't been made yet (governing law, jurisdiction, country) —
 * visibly flagged rather than silently resolved with a guess.
 *
 * Deliberately not brand emerald/ink: those colours mean "this is Greatest
 * Solutions" everywhere else on the site, which is the opposite of what a
 * "you need to fill this in" marker should signal. Amber is the one
 * exception to the brand palette on the whole site, used nowhere else, and
 * used only for this functional purpose.
 */
export function LegalPlaceholder({ children }: { children: ReactNode }) {
  return (
    <span className="inline whitespace-normal rounded-[var(--radius-sm)] border border-dashed border-amber-400 bg-amber-50 px-1.5 py-0.5 font-mono text-[0.9em] text-amber-900">
      {children}
    </span>
  );
}
