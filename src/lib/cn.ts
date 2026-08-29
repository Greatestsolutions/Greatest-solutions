/**
 * Conditional className joiner.
 *
 * Deliberately not `clsx` + `tailwind-merge`: two dependencies to do what six
 * lines do, and this project has no case yet where conflicting Tailwind classes
 * need resolving. If component variants later need real conflict resolution,
 * swap the body for tailwind-merge — every call site already goes through here,
 * so that becomes a one-file change.
 */
export type ClassValue = string | number | null | undefined | false;

export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
