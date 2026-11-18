<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { AttendanceGrid } from "$lib/common/types/attendance";
  import { AttendanceStatus } from "$lib/common/types/attendance";

  import { abbreviateTitle } from "$lib/client/utils/abbreviate-title";
  import Button from "$lib/client/components/common/Button.svelte";
  import EmptyState from "$lib/client/components/common/EmptyState.svelte";

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

  const periodBase = $derived(
    `/faculties/${grid.subject.faculty_slug}/subjects/${grid.subject.slug}/periods/${grid.period.year}/${grid.period.semester}`,
  );
</script>

{#if grid.rows.length === 0}
  <EmptyState
    icon="👤"
    title={$t("attendance.empty_students")}
    testId="attendance-empty-students"
  >
    {#snippet actions()}
      {#if grid.commission?.slug}
        <Button
          href="{periodBase}/commissions/{grid.commission.slug}/students"
          class="btn-secondary"
          testId="attendance-empty-students-cta"
        >
          {$t("commissions.enroll_students_cta")}
        </Button>
      {:else}
        <Button
          href="{periodBase}/commissions"
          class="btn-secondary"
          testId="attendance-empty-commissions-cta"
        >
          {$t("commissions.define_commissions_cta")}
        </Button>
      {/if}
    {/snippet}
  </EmptyState>
{:else if grid.assignments.length === 0}
  <EmptyState
    icon="✏️"
    title={$t("attendance.empty_assignments")}
    testId="attendance-empty-assignments"
  >
    {#snippet actions()}
      <Button
        href="{periodBase}/assignments"
        class="btn-secondary"
        testId="attendance-empty-assignments-cta"
      >
        {$t("commissions.define_assignments_cta")}
      </Button>
    {/snippet}
  </EmptyState>
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
            <a
              href={takeHref(assignment.id)}
              title={assignment.title}
              aria-label={assignment.title}
            >
              {abbreviateTitle(assignment.title)}
            </a>
          {:else}
            <span title={assignment.title} aria-label={assignment.title}>
              {abbreviateTitle(assignment.title)}
            </span>
          {/if}
        </div>
      {/each}
      <div class="attendance-grid__summary-head">{$t("attendance.column_summary")}</div>
    </div>

    {#each grid.rows as row, index (row.enrollment_id)}
      <div
        class="attendance-grid__row"
        class:attendance-grid__row--striped={index % 2 === 1}
        data-test-id="attendance-row-{row.enrollment_id}"
      >
        <div class="attendance-grid__student" data-test-id="attendance-row-name-{row.enrollment_id}">
          <a class="link-editorial" href="/persons/{row.person_id}">{row.name}</a>
          {#if grid.scope === "cursada"}
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
    grid-template-columns: 12rem repeat(var(--cols, 1), 3.2rem) 4.5rem;
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
    min-height: 3rem;
    border-bottom: 1px solid var(--color-outline-variant);
    color: var(--color-on-surface-variant);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .attendance-grid__assignment-head,
  .attendance-grid__summary-head {
    overflow: hidden;
    text-align: center;
    font-size: 0.6875rem;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .attendance-grid__row--striped {
    background-color: var(--color-surface-container-low);
  }

  :global([data-theme="classnotes-dark"]) .attendance-grid__row--striped {
    background-color: transparent;
  }

  .attendance-grid__student,
  .attendance-grid__student-head {
    position: sticky;
    left: 0;
    z-index: 1;
    overflow: hidden;
    background-color: var(--color-surface);
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .attendance-grid__row--striped .attendance-grid__student {
    background-color: var(--color-surface-container-low);
  }

  :global([data-theme="classnotes-dark"]) .attendance-grid__row--striped .attendance-grid__student {
    background-color: var(--color-surface);
  }

  .attendance-grid__student-head {
    text-transform: uppercase;
  }

  .attendance-grid__commission {
    display: block;
    overflow: hidden;
    color: var(--color-on-surface-variant);
    font-size: 0.75rem;
    font-weight: 400;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .attendance-grid__summary,
  .attendance-grid__column-count {
    text-align: center;
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
  }

  .attendance-grid__empty-column {
    font-size: 0.6875rem;
    color: var(--color-muted);
  }

  .attendance-grid__row--counts {
    margin-top: 0.25rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--color-outline-variant);
  }

  @media (max-width: 768px) {
    .attendance-grid {
      grid-template-columns: 10rem repeat(var(--cols, 1), 3.2rem) 4.5rem;
    }
  }
</style>
