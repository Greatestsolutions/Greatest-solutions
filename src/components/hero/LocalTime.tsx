"use client";

import { useEffect, useState } from "react";

/**
 * The running clock beside the hero's timezone label.
 *
 * The reference renders `GMT-7 15:37` bottom-left and the minutes tick over;
 * ours was showing the offset alone. The time is deliberately **not** rendered on
 * the server: the server's clock is not the reader's, so emitting a time during
 * SSR guarantees a hydration mismatch and a flash of the wrong value. It renders
 * empty, then fills in on mount.
 *
 * The offset is fixed by the label it sits next to, so the time is computed for
 * that zone rather than the visitor's — otherwise "GMT-7" and the digits beside
 * it would disagree for everyone outside that zone.
 */
export function LocalTime({ offsetHours }: { offsetHours: number }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      // Shift UTC by the label's offset, then read the UTC fields back out.
      const shifted = new Date(now.getTime() + offsetHours * 3_600_000);
      setTime(
        `${String(shifted.getUTCHours()).padStart(2, "0")}:${String(shifted.getUTCMinutes()).padStart(2, "0")}`,
      );
    };
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, [offsetHours]);

  // suppressHydrationWarning: the server renders nothing here by design.
  return (
    <span suppressHydrationWarning className="text-strong">
      {time}
    </span>
  );
}
