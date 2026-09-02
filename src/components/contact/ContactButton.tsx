"use client";

import { Button, type ButtonProps } from "@/components/ui/Button";
import { useContactModal } from "@/components/contact/ContactModal";

/**
 * A {@link Button} that opens the contact dialog instead of navigating.
 *
 * The thin client boundary that lets Server Components — the footer, the pricing
 * cards — keep a contact CTA without becoming client components themselves. Only
 * this wrapper ships; `Button` and its callers are unchanged in every other use.
 *
 * It takes the same props as `Button` minus `href`, so a call site converts by
 * dropping `href="/contact"` and swapping the component name; size, tone and
 * className carry over untouched and the CTA looks identical.
 */
export function ContactButton(props: Omit<ButtonProps, "href" | "type" | "onClick">) {
  const { open } = useContactModal();
  return <Button {...props} onClick={open} />;
}
