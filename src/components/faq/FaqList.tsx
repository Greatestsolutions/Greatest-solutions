"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FaqItem } from "@/components/faq/FaqItem";
import { faqEntries, faqInitialCount } from "@/data/faq";

/**
 * The FAQ list plus its "View more" reveal.
 *
 * A Client Component only for the reveal toggle — each {@link FaqItem} stays
 * the zero-JS `<details>` accordion it already was. The hidden entries stay
 * mounted (`hidden`, not filtered out of the map), so revealing them never
 * remounts the visible ones: an already-open question keeps its native
 * `<details open>` state across the click.
 */
export function FaqList() {
  const [revealed, setRevealed] = useState(false);
  const hiddenCount = faqEntries.length - faqInitialCount;

  return (
    <div className="flex flex-col gap-6 tablet:pt-11">
      <ul className="flex flex-col gap-6">
        {faqEntries.map((entry, i) => (
          <li key={entry.question} hidden={i >= faqInitialCount && !revealed}>
            <FaqItem entry={entry} index={i} />
          </li>
        ))}
      </ul>

      {!revealed && hiddenCount > 0 ? (
        <Button onClick={() => setRevealed(true)} className="self-start">
          View more
          {/* Rides in the accessible name rather than the visible label, same
              pattern as the Works index's own "View more". */}
          <span className="sr-only"> questions, {hiddenCount} remaining</span>
        </Button>
      ) : null}
    </div>
  );
}
