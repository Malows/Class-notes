<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import { AttendanceStatus } from "$lib/common/types/attendance";

  interface Props {
    status: AttendanceStatus | null;
    recordedOn: string | null;
    testId?: string;
    onclick?: () => void;
  }

  let { status, recordedOn, testId, onclick }: Props = $props();

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
</script>

<button
  type="button"
  class="attendance-cell"
  class:is-present={status === AttendanceStatus.PRESENT}
  class:is-absent={status === AttendanceStatus.ABSENT}
  class:is-unmarked={status === null}
  {onclick}
  disabled={!onclick}
  aria-label={label}
  title={recordedOn ? `${label} · ${recordedOn}` : label}
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
    min-height: 2.4rem;
    min-width: 2.4rem;
    border: 1px solid var(--border-color, #333);
    border-radius: 0.25rem;
    background: transparent;
    font-weight: 700;
    line-height: 1;
    cursor: pointer;
  }

  .attendance-cell:disabled {
    cursor: default;
  }

  .attendance-cell.is-present {
    background: #d6f5d6;
    color: #14532d;
  }

  .attendance-cell.is-absent {
    background: #fbd5d5;
    color: #7f1d1d;
  }

  .attendance-cell.is-unmarked {
    color: #6b7280;
  }

  :global(.dark) .attendance-cell.is-present {
    background: #14532d;
    color: #d6f5d6;
  }

  :global(.dark) .attendance-cell.is-absent {
    background: #7f1d1d;
    color: #fbd5d5;
  }
</style>
