export type SwipeDecision = "present" | "absent" | "skip" | null;

/** A card needs a real gesture: at least 80px, or a fifth of its width when wider. */
export const swipeThreshold = (width: number): number => Math.max(80, width * 0.2);

/**
 * Turns a drag into a decision. The dominant axis wins, so a mostly-horizontal
 * drag never registers as a skip and vice versa. Downwards does nothing.
 */
export function resolveSwipe(dx: number, dy: number, width: number): SwipeDecision {
  const threshold = swipeThreshold(width);

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx >= threshold) return "present";
    if (dx <= -threshold) return "absent";
    return null;
  }

  if (dy <= -threshold) return "skip";
  return null;
}
