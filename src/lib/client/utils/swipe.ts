export type SwipeDecision = "present" | "absent" | "skip" | null;

/** A card needs a real gesture: at least 80px, or a fifth of its width when wider. */
export const swipeThreshold = (width: number): number => Math.max(80, width * 0.2);

/** No intent is shown until the card travels this far, so a tap or a jitter stays neutral. */
export const deadZone = 28;

/** A flick this fast (px/ms) decides with less distance, like a card throw. */
export const flickSpeed = 0.9;

/** A flick still has to travel this share of the regular threshold. */
const flickDistanceRatio = 0.45;

/** The other axis must clearly win before the active direction switches. */
const axisHysteresis = 1.35;

/**
 * Turns a drag into a decision. The dominant axis wins, so a mostly-horizontal
 * drag never registers as a skip and vice versa. Downwards does nothing.
 * A fast flick lowers the distance needed; slow drags still need the full run.
 */
export function resolveSwipe(
  dx: number,
  dy: number,
  width: number,
  speed = 0,
): SwipeDecision {
  const threshold =
    speed >= flickSpeed
      ? Math.max(deadZone * 1.5, swipeThreshold(width) * flickDistanceRatio)
      : swipeThreshold(width);

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx >= threshold) return "present";
    if (dx <= -threshold) return "absent";
    return null;
  }

  if (dy <= -threshold) return "skip";
  return null;
}

/**
 * The live direction shown while dragging. Only one direction can be active at
 * a time: the vertical axis needs to beat the horizontal one by `axisHysteresis`
 * before the hint switches, so a diagonal drag never shows two stamps at once.
 */
export function resolveIntent(
  dx: number,
  dy: number,
  previous: SwipeDecision,
  minDistance = deadZone,
): SwipeDecision {
  const ax = Math.abs(dx);
  const ay = Math.abs(dy);

  if (Math.max(ax, ay) < minDistance) return null;

  if (previous === "skip") {
    if (ax > ay * axisHysteresis) return dx >= 0 ? "present" : "absent";
    return dy < 0 ? "skip" : null;
  }

  if (previous === "present" || previous === "absent") {
    if (dy < 0 && ay > ax * axisHysteresis) return "skip";
    return dx >= 0 ? "present" : "absent";
  }

  if (ax >= ay) return dx >= 0 ? "present" : "absent";
  if (dy < 0) return "skip";
  return null;
}
