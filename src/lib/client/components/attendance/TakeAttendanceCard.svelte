<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import { AttendanceStatus } from "$lib/common/types/attendance";

  import { deadZone, resolveIntent, resolveSwipe, swipeThreshold } from "$lib/client/utils/swipe";

  type Decision = "present" | "absent" | "skip";

  interface Props {
    studentName: string;
    legajo: string | null;
    commissionName: string | null;
    status: AttendanceStatus | null;
    current: number;
    total: number;
    onDecide: (decision: Decision) => void;
    onUndo: () => void;
    canUndo: boolean;
  }

  let {
    studentName,
    legajo,
    commissionName,
    status,
    current,
    total,
    onDecide,
    onUndo,
    canUndo,
  }: Props = $props();

  let card = $state<HTMLDivElement | null>(null);
  let dragging = $state(false);
  let flying = $state<Decision | null>(null);
  let intent = $state<Decision | null>(null);
  let dx = $state(0);
  let dy = $state(0);
  let pointerId = $state<number | null>(null);
  let speed = $state(0);
  let startX = 0;
  let startY = 0;
  let lastX = 0;
  let lastY = 0;
  let lastTime = 0;

  let width = $derived(card?.offsetWidth ?? 320);
  let height = $derived(card?.offsetHeight ?? 200);

  // The tint only commits at the real decision threshold; the stamp appears
  // earlier but always for a single, locked direction.
  const pending = $derived(dragging && !flying ? resolveSwipe(dx, dy, width) : null);

  const threshold = $derived(swipeThreshold(width));
  const revealSpan = $derived(Math.max(1, threshold - deadZone));

  const revealStrength = (distance: number) =>
    Math.min(1, Math.max(0, (distance - deadZone) / revealSpan));

  const presentReveal = $derived(
    flying === "present" ? 1 : intent === "present" ? revealStrength(dx) : 0,
  );
  const absentReveal = $derived(
    flying === "absent" ? 1 : intent === "absent" ? revealStrength(-dx) : 0,
  );
  const skipReveal = $derived(
    flying === "skip" ? 1 : intent === "skip" ? revealStrength(-dy) : 0,
  );

  const rotation = $derived(flying ? 0 : dx / 22);

  const transform = $derived(
    flying === "present"
      ? `translate(${width * 1.5}px, ${dy + height * 0.3}px) rotate(16deg)`
      : flying === "absent"
        ? `translate(${-width * 1.5}px, ${dy + height * 0.3}px) rotate(-16deg)`
        : flying === "skip"
          ? `translate(${dx}px, ${-height * 1.4}px) rotate(0deg)`
          : `translate(${dx}px, ${dy}px) rotate(${rotation}deg)`,
  );

  const tint = $derived(
    (flying ?? pending) === "present"
      ? "is-present"
      : (flying ?? pending) === "absent"
        ? "is-absent"
        : (flying ?? pending) === "skip"
          ? "is-skip"
          : "",
  );

  let settleTimer: ReturnType<typeof setTimeout> | undefined;

  function clearSettle() {
    if (settleTimer !== undefined) {
      clearTimeout(settleTimer);
      settleTimer = undefined;
    }
  }

  function reset() {
    clearSettle();
    dragging = false;
    flying = null;
    intent = null;
    dx = 0;
    dy = 0;
    speed = 0;
    pointerId = null;
  }

  function prefersReducedMotion() {
    return (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    );
  }

  function settle(decision: Decision) {
    if (prefersReducedMotion()) {
      reset();
      onDecide(decision);
      return;
    }

    flying = decision;
    dragging = false;
    clearSettle();
    settleTimer = setTimeout(() => {
      settleTimer = undefined;
      reset();
      onDecide(decision);
    }, 190);
  }

  // Pointer capture can already be gone (pointer left the window, unmount,
  // browser cancelled it), so both calls are defensive.
  function capturePointer(id: number) {
    try {
      card?.setPointerCapture?.(id);
    } catch {
      // The browser can reject capture for an inactive pointer.
    }
  }

  function releasePointer(id: number) {
    try {
      if (card?.hasPointerCapture?.(id)) {
        card.releasePointerCapture(id);
      }
    } catch {
      // The capture may have been released already.
    }
  }

  function handlePointerDown(event: PointerEvent) {
    if (flying || (event.pointerType === "mouse" && event.button !== 0)) return;

    event.preventDefault();
    dragging = true;
    intent = null;
    speed = 0;
    dx = 0;
    dy = 0;
    startX = event.clientX;
    startY = event.clientY;
    lastX = event.clientX;
    lastY = event.clientY;
    lastTime = event.timeStamp;
    pointerId = event.pointerId;
    capturePointer(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent) {
    if (!dragging || flying || event.pointerId !== pointerId) return;

    event.preventDefault();
    dx = event.clientX - startX;
    dy = event.clientY - startY;

    const elapsed = Math.max(16, event.timeStamp - lastTime);
    const instant = Math.hypot(event.clientX - lastX, event.clientY - lastY) / elapsed;
    // Smoothed so a single jittery sample cannot flip the hint.
    speed = speed * 0.6 + instant * 0.4;
    lastX = event.clientX;
    lastY = event.clientY;
    lastTime = event.timeStamp;

    intent = resolveIntent(dx, dy, intent);
  }

  function handlePointerUp(event: PointerEvent) {
    if (!dragging || event.pointerId !== pointerId) return;

    const id = event.pointerId;
    // Clear first: releasing can fire `lostpointercapture` synchronously.
    pointerId = null;
    releasePointer(id);

    // A pause before releasing cancels the flick: the card is not moving anymore.
    const releaseSpeed = event.timeStamp - lastTime > 120 ? 0 : speed;
    const decision = resolveSwipe(dx, dy, width, releaseSpeed);
    if (decision) {
      settle(decision);
      return;
    }

    // Snaps back and keeps the same student.
    dragging = false;
    intent = null;
    dx = 0;
    dy = 0;
    speed = 0;
  }

  function handlePointerCancel() {
    // A cancelled gesture is not a decision: just put the card back.
    if (!dragging && !flying) return;
    reset();
  }

  function handleLostCapture(event: PointerEvent) {
    // Losing capture mid-gesture (pointer left the window) is not a decision.
    if (dragging && event.pointerId === pointerId) {
      reset();
    }
  }

  // Every new student starts from a clean card.
  $effect(() => {
    if (current >= 0) {
      reset();
    }
    return clearSettle;
  });
</script>

<div class="take-stage">
  <div
    bind:this={card}
    class="take-card {tint}"
    class:is-dragging={dragging && !flying}
    class:is-flying={flying !== null}
    role="group"
    aria-label={studentName}
    style="transform: {transform};"
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerCancel}
    onlostpointercapture={handleLostCapture}
    data-test-id="take-card"
  >
    <span
      class="take-stamp take-stamp--present"
      style="opacity: {presentReveal};"
      aria-hidden="true"
    >
      {$t("attendance.take_present")}
    </span>
    <span
      class="take-stamp take-stamp--absent"
      style="opacity: {absentReveal};"
      aria-hidden="true"
    >
      {$t("attendance.take_absent")}
    </span>
    <span class="take-stamp take-stamp--skip" style="opacity: {skipReveal};" aria-hidden="true">
      {$t("attendance.take_skip")}
    </span>

    <p class="take-card__progress" data-test-id="take-progress">
      {$t("attendance.take_progress", { current: current + 1, total } as never)}
    </p>

    <p class="take-card__name" aria-live="polite" data-test-id="take-student-name">
      {studentName}
    </p>
    <p class="take-card__meta">
      {legajo ?? "—"}
      {#if commissionName}
        <span>· {commissionName}</span>
      {/if}
    </p>

    <p class="take-card__state" data-test-id="take-current-state">
      {status === AttendanceStatus.PRESENT
        ? $t("attendance.state_present")
        : status === AttendanceStatus.ABSENT
          ? $t("attendance.state_absent")
          : $t("attendance.state_unmarked")}
    </p>

    <p class="take-card__hint">{$t("attendance.take_hint")}</p>
  </div>
</div>

<div class="take-actions">
  <button
    type="button"
    class="btn btn-outline btn-error"
    onclick={() => onDecide("absent")}
    data-test-id="take-absent"
  >
    {$t("attendance.take_absent")}
  </button>
  <button
    type="button"
    class="btn btn-ghost"
    onclick={() => onDecide("skip")}
    data-test-id="take-skip"
  >
    {$t("attendance.take_skip")}
  </button>
  <button
    type="button"
    class="btn btn-primary"
    onclick={() => onDecide("present")}
    data-test-id="take-present"
  >
    {$t("attendance.take_present")}
  </button>
  <button
    type="button"
    class="btn btn-ghost"
    onclick={onUndo}
    disabled={!canUndo}
    data-test-id="take-undo"
  >
    {$t("attendance.take_undo")}
  </button>
</div>

<style>
  /* The stage fixes the layout and clips the card while it is dragged or
     thrown away, so the gesture can never grow the document and scroll. */
  .take-stage {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 14.5rem;
    padding: 0.75rem;
    overflow: hidden;
    overscroll-behavior: contain;
    touch-action: none;
  }

  .take-card {
    position: relative;
    width: 100%;
    max-width: 28rem;
    min-height: 12rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 1.5rem;
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-box);
    background-color: var(--color-surface-container-lowest);
    color: var(--color-on-surface);
    box-shadow: 0 10px 30px -18px color-mix(in srgb, var(--color-on-surface) 40%, transparent);
    cursor: grab;
    user-select: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    -webkit-tap-highlight-color: transparent;
    will-change: transform;
    transition:
      transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
      background-color 120ms ease,
      border-color 120ms ease;
  }

  .take-card.is-dragging {
    cursor: grabbing;
    transition: background-color 120ms ease, border-color 120ms ease;
  }

  .take-card.is-flying {
    transition: transform 190ms ease-in;
  }

  .take-card.is-present {
    border-color: var(--color-success);
    background-color: color-mix(
      in srgb,
      var(--color-success) 12%,
      var(--color-surface-container-lowest)
    );
  }

  .take-card.is-absent {
    border-color: var(--color-error);
    background-color: color-mix(
      in srgb,
      var(--color-error) 12%,
      var(--color-surface-container-lowest)
    );
  }

  .take-card.is-skip {
    background-color: var(--color-surface-container-low);
  }

  .take-stamp {
    position: absolute;
    padding: 0.125rem 0.5rem;
    border: 2px solid currentColor;
    border-radius: 0.375rem;
    font-family: var(--font-sans);
    font-size: 0.875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    pointer-events: none;
    will-change: opacity;
  }

  .take-stamp--present {
    top: 1rem;
    left: 1rem;
    color: var(--color-success);
    transform: rotate(-12deg);
  }

  .take-stamp--absent {
    top: 1rem;
    right: 1rem;
    color: var(--color-error);
    transform: rotate(12deg);
  }

  .take-stamp--skip {
    bottom: 1rem;
    left: 50%;
    color: var(--color-on-surface-variant);
    transform: translateX(-50%);
  }

  .take-card__progress {
    margin: 0;
    color: var(--color-on-surface-variant);
    font-size: 0.75rem;
    line-height: 1rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .take-card__name {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.5rem;
    font-weight: 500;
    text-align: center;
  }

  .take-card__meta,
  .take-card__state {
    margin: 0;
    color: var(--color-on-surface-variant);
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }

  .take-card__hint {
    margin: 0.5rem 0 0;
    color: var(--color-muted);
    font-size: 0.75rem;
    line-height: 1rem;
    text-align: center;
  }

  .take-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1rem;
  }

  @media (prefers-reduced-motion: reduce) {
    .take-card,
    .take-card.is-flying {
      transition: none;
    }
  }
</style>
