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
  .take-card {
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
    touch-action: none;
    user-select: none;
    transition: background-color 0.1s ease;
  }

  .take-card.is-present {
    background-color: color-mix(
      in srgb,
      var(--color-success) 12%,
      var(--color-surface-container-lowest)
    );
  }

  .take-card.is-absent {
    background-color: color-mix(
      in srgb,
      var(--color-error) 12%,
      var(--color-surface-container-lowest)
    );
  }

  .take-card.is-skip {
    background-color: var(--color-surface-container-low);
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
</style>
