import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

/**
 * The one form-control recipe.
 *
 * These classes were copied three times inside `EnquiryForm` — on its text
 * inputs, its `select` and its `textarea` — which is exactly how a border colour
 * or a focus ring drifts between controls that are meant to match. They now live
 * here, and the works search field consumes the same constant, so the search bar
 * matches the contact form by construction rather than by imitation.
 *
 * Split in two because only the sizing differs: `textarea` pads on all four
 * sides instead of taking a fixed height.
 */
export const fieldBase =
  "rounded-[var(--radius-sm)] border border-black/12 bg-white text-body-md text-ink " +
  "transition-colors duration-[var(--duration-quick)] " +
  "placeholder:text-muted focus-visible:border-brand-green focus-visible:outline-none";

/** `fieldBase` plus the measured 44px single-line height. */
export const fieldControl = `h-11 px-3 ${fieldBase}`;

/**
 * A text input carrying the shared recipe. Every native input prop passes
 * through, so it is a drop-in for `<input>`.
 */
export function Input({ className, ...rest }: ComponentPropsWithoutRef<"input">) {
  return <input className={cn(fieldControl, className)} {...rest} />;
}
