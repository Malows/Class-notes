<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import { AttendanceStatus } from "$lib/common/types/attendance";

  interface Props {
    status: AttendanceStatus | null;
    recordedOn: string | null;
    testId?: string;
    contextLabel?: string;
    onclick?: () => void;
  }

  let { status, recordedOn, testId, contextLabel, onclick }: Props = $props();

  const icon = $derived(
    status === AttendanceStatus.PRESENT ? "✓" : status === AttendanceStatus.ABSENT ? "✗" : "–",
  );

  const label = $derived(
    status === AttendanceStatus.PRESENT
      ? $t("attendance.state_present")
      : status === AttendanceStatus.ABSENT
        ? $t("attendance.state_absent")
        : $t("attendance.state_unmarked"),
  );

  const accessibleLabel = $derived(contextLabel ? `${label} · ${contextLabel}` : label);
</script>

<button
  type="button"
  class="attendance-cell"
  class:is-present={status === AttendanceStatus.PRESENT}
  class:is-absent={status === AttendanceStatus.ABSENT}
  class:is-unmarked={status === null}
  {onclick}
  disabled={!onclick}
  aria-label={accessibleLabel}
  title={recordedOn ? `${accessibleLabel} · ${recordedOn}` : accessibleLabel}
  data-test-id={testId}
>
  {icon}
</button>

<style>
  .attendance-cell {
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2rem;
    min-width: 2rem;
    /* Interactive cell: the boundary is a control edge, not a table rule. */
    border: 1px solid var(--color-outline);
    border-radius: var(--radius-field);
    background-color: var(--color-surface-container-lowest);
    color: var(--color-on-surface);
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .attendance-cell:disabled {
    cursor: default;
  }

  .attendance-cell.is-present {
    border-color: color-mix(in srgb, var(--color-success) 35%, var(--color-outline));
    background-color: color-mix(
      in srgb,
      var(--color-success) 12%,
      var(--color-surface-container-lowest)
    );
    color: var(--color-success);
  }

  .attendance-cell.is-absent {
    border-color: color-mix(in srgb, var(--color-error) 35%, var(--color-outline));
    background-color: color-mix(
      in srgb,
      var(--color-error) 12%,
      var(--color-surface-container-lowest)
    );
    color: var(--color-error);
  }

  .attendance-cell.is-unmarked {
    background-color: var(--color-surface-container-low);
    color: var(--color-muted);
  }

  @media (pointer: coarse) {
    .attendance-cell {
      min-height: 3rem;
      min-width: 3rem;
    }
  }
</style>
