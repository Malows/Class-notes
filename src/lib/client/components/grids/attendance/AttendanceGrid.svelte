<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { AttendanceGrid } from "$lib/common/types/attendance";
  import { AttendanceStatus } from "$lib/common/types/attendance";

  import AttendanceCell from "./AttendanceCell.svelte";

  interface Props {
    grid: AttendanceGrid;
    canEdit?: boolean;
    takeHref?: (assignmentId: number) => string | null;
    onCycleCell?: (assignmentId: number, enrollmentId: number, current: AttendanceStatus | null) => void;
  }

  let { grid, canEdit = false, takeHref, onCycleCell }: Props = $props();

  const handleCellClick = (assignmentId: number, enrollmentId: number, current: AttendanceStatus | null) => {
    if (!canEdit || !onCycleCell) return;
    onCycleCell(assignmentId, enrollmentId, current);
  };
</script>

{#if grid.rows.length === 0}
  <p data-test-id="attendance-empty-students">{$t("attendance.empty_students")}</p>
{:else if grid.assignments.length === 0}
  <p data-test-id="attendance-empty-assignments">{$t("attendance.empty_assignments")}</p>
{:else}
  <div
    class="attendance-grid"
    data-test-id="attendance-grid"
    style="--cols: {grid.assignments.length};"
  >
    <div class="attendance-grid__header">
      <div class="attendance-grid__student-head">{$t("attendance.column_student")}</div>
      {#each grid.assignments as assignment (assignment.id)}
        <div class="attendance-grid__assignment-head" data-test-id="attendance-head-{assignment.id}">
          {#if takeHref && takeHref(assignment.id)}
            <a href={takeHref(assignment.id)} title={$t("attendance.open_take")}>
              {assignment.title}
            </a>
          {:else}
            {assignment.title}
          {/if}
        </div>
      {/each}
      <div class="attendance-grid__summary-head">{$t("attendance.column_summary")}</div>
    </div>

    {#each grid.rows as row (row.enrollment_id)}
      <div class="attendance-grid__row" data-test-id="attendance-row-{row.enrollment_id}">
        <div class="attendance-grid__student" data-test-id="attendance-row-name-{row.enrollment_id}">
          <a href="/persons/{row.person_id}">{row.name}</a>
          {#if row.is_guest}
            <span class="attendance-grid__badge" data-test-id="attendance-guest-{row.enrollment_id}">
              {$t("attendance.guest")} · {row.commission_name ?? "—"}
            </span>
          {:else if grid.scope === "cursada"}
            <span class="attendance-grid__commission" data-test-id="attendance-commission-{row.enrollment_id}">
              {row.commission_name ?? $t("attendance.no_commission")}
            </span>
          {/if}
        </div>

        {#each row.cells as cell (cell.assignment_id)}
          <AttendanceCell
            status={cell.status}
            recordedOn={cell.recorded_on}
            testId="attendance-cell-{row.enrollment_id}-{cell.assignment_id}"
            onclick={canEdit
              ? () => handleCellClick(cell.assignment_id, row.enrollment_id, cell.status)
              : undefined}
          />
        {/each}

        <div class="attendance-grid__summary" data-test-id="attendance-row-summary-{row.enrollment_id}">
          {row.present_count} / {row.taken_count}
        </div>
      </div>
    {/each}

    <div class="attendance-grid__row attendance-grid__row--counts">
      <div class="attendance-grid__student">—</div>
      {#each grid.columns as column (column.assignment_id)}
        <div class="attendance-grid__column-count" data-test-id="attendance-column-{column.assignment_id}">
          {#if column.taken_count === 0}
            <span class="attendance-grid__empty-column" data-test-id="attendance-empty-column-{column.assignment_id}">
              {$t("attendance.empty_column")}
            </span>
          {:else}
            {column.present_count} / {column.taken_count}
          {/if}
        </div>
      {/each}
      <div></div>
    </div>
  </div>
{/if}

<style>
  .attendance-grid {
    display: grid;
    grid-template-columns: 12rem repeat(var(--cols, 1), 2.8rem) 4.5rem;
    gap: 0.25rem;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    align-items: center;
  }

  .attendance-grid__header,
  .attendance-grid__row {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    gap: inherit;
    align-items: center;
    padding: 0.25rem 0.5rem;
  }

  .attendance-grid__header {
    font-weight: 700;
  }

  .attendance-grid__assignment-head,
  .attendance-grid__summary-head {
    text-align: center;
    font-size: 0.8rem;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .attendance-grid__row:nth-child(odd) {
    background-color: #f3f4f6;
  }

  :global(.dark) .attendance-grid__row:nth-child(odd) {
    background-color: #4c4b49;
  }

  .attendance-grid__student {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .attendance-grid__commission,
  .attendance-grid__badge {
    display: block;
    font-weight: 400;
    font-size: 0.75rem;
    opacity: 0.8;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .attendance-grid__summary,
  .attendance-grid__column-count {
    text-align: center;
    font-size: 0.85rem;
    font-variant-numeric: tabular-nums;
  }

  .attendance-grid__empty-column {
    font-size: 0.7rem;
    opacity: 0.6;
  }

  .attendance-grid__row--counts {
    border-top: 1px solid var(--border-color, #ccc);
    margin-top: 0.25rem;
    padding-top: 0.5rem;
  }
</style>
