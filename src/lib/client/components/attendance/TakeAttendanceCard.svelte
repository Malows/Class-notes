<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import { AttendanceStatus } from "$lib/common/types/attendance";

  import { resolveSwipe } from "$lib/client/utils/swipe";

  interface Props {
    studentName: string;
    legajo: string | null;
    commissionName: string | null;
    status: AttendanceStatus | null;
    current: number;
    total: number;
    onDecide: (decision: "present" | "absent" | "skip") => void;
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
  let dx = $state(0);
  let dy = $state(0);

  const pending = $derived(
    !dragging
      ? null
      : resolveSwipe(dx, dy, card?.clientWidth ?? 0) ?? null,
  );

  function handlePointerDown(event: PointerEvent) {
    dragging = true;
    dx = 0;
    dy = 0;
    card?.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent) {
    if (!dragging) return;
    dx = event.clientX - (card?.getBoundingClientRect().left ?? 0) - (card?.clientWidth ?? 0) / 2;
    dy = event.clientY - (card?.getBoundingClientRect().top ?? 0) - (card?.clientHeight ?? 0) / 2;
  }

  function handlePointerUp(event: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    card?.releasePointerCapture?.(event.pointerId);

    const decision = resolveSwipe(dx, dy, card?.clientWidth ?? 0);
    dx = 0;
    dy = 0;

    if (decision) {
      onDecide(decision);
    }
  }

  const transform = $derived(
    dragging ? `translate(${dx}px, ${dy}px)` : "translate(0, 0)",
  );

  const tint = $derived(
    pending === "present" ? "is-present" : pending === "absent" ? "is-absent" : pending === "skip" ? "is-skip" : "",
  );
</script>

<div
  bind:this={card}
  class="take-card {tint}"
  role="group"
  aria-label={studentName}
  style="transform: {transform};"
  onpointerdown={handlePointerDown}
  onpointermove={handlePointerMove}
  onpointerup={handlePointerUp}
  onpointercancel={handlePointerUp}
  data-test-id="take-card"
>
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

<div class="take-actions">
  <button
    type="button"
    class="paper-btn btn-danger"
    onclick={() => onDecide("absent")}
    data-test-id="take-absent"
  >
    {$t("attendance.take_absent")}
  </button>
  <button
    type="button"
    class="paper-btn"
    onclick={() => onDecide("skip")}
    data-test-id="take-skip"
  >
    {$t("attendance.take_skip")}
  </button>
  <button
    type="button"
    class="paper-btn btn-secondary"
    onclick={() => onDecide("present")}
    data-test-id="take-present"
  >
    {$t("attendance.take_present")}
  </button>
  <button
    type="button"
    class="paper-btn"
    onclick={onUndo}
    disabled={!canUndo}
    data-test-id="take-undo"
  >
    {$t("attendance.take_undo")}
  </button>
</div>

<style>
  .take-card {
    min-height: 12rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 1.5rem;
    border: 2px solid var(--border-color, #333);
    border-radius: 0.5rem;
    touch-action: none;
    user-select: none;
    transition: background-color 0.1s ease;
    background: #fff;
  }

  :global(.dark) .take-card {
    background: #1a1c1c;
  }

  .take-card.is-present {
    background: #d6f5d6;
  }

  .take-card.is-absent {
    background: #fbd5d5;
  }

  .take-card.is-skip {
    background: #e5e7eb;
  }

  .take-card__progress {
    font-size: 0.85rem;
    opacity: 0.7;
  }

  .take-card__name {
    font-size: 1.5rem;
    font-weight: 700;
    text-align: center;
    margin: 0;
  }

  .take-card__meta,
  .take-card__state {
    font-size: 0.9rem;
    opacity: 0.8;
    margin: 0;
  }

  .take-card__hint {
    font-size: 0.8rem;
    opacity: 0.6;
    text-align: center;
    margin: 0.5rem 0 0;
  }

  .take-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1rem;
  }
</style>
