<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Assignment } from "$lib/common/types/academic";
  import type { AttendanceGrid } from "$lib/common/types/attendance";
  import type { EnrollmentGridRowDTO } from "$lib/common/types/dto";

  import Button from "$lib/client/components/common/Button.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import StatItem from "$lib/client/components/common/StatItem.svelte";

  import { computeAttendanceSummary, computeGradeSummary } from "./commission-summary";

  interface Props {
    assignments: Assignment[];
    grid: EnrollmentGridRowDTO[];
    attendanceGrid: AttendanceGrid | null;
    attendanceLoading?: boolean;
    attendanceFailed?: boolean;
    onRetryAttendance?: () => void;
    /** Commission URL without the trailing route, e.g. /faculties/…/commissions/tarde */
    commissionBaseHref: string;
    /** Where practical assignments are defined for this cursada. */
    assignmentsHref: string;
  }

  let {
    assignments,
    grid,
    attendanceGrid,
    attendanceLoading = false,
    attendanceFailed = false,
    onRetryAttendance,
    commissionBaseHref,
    assignmentsHref,
  }: Props = $props();

  const grades = $derived(computeGradeSummary(grid, assignments));
  const attendance = $derived(computeAttendanceSummary(attendanceGrid));

  const singleAssignment = $derived(assignments.length === 1 ? assignments[0] : null);
  const hasAssignments = $derived(assignments.length > 0);

  let selectedAssignmentId = $state("");
  const selectedAssignment = $derived(
    assignments.find((assignment) => String(assignment.id) === selectedAssignmentId) ?? null,
  );

  const correctionHref = $derived(
    selectedAssignment
      ? `${commissionBaseHref}/correct?assignment_id=${selectedAssignment.id}`
      : undefined,
  );
</script>

<section
  class="commission-summary"
  aria-labelledby="commission-summary-title"
  data-test-id="commission-summary"
>
  <div class="commission-summary__head">
    <div class="commission-summary__intro">
      <h2 id="commission-summary-title" class="m-0 font-serif text-headline-md">
        {$t("commissions.summary_title")}
      </h2>
    </div>

    <div class="commission-summary__correction" data-test-id="summary-correction-action">
      {#if singleAssignment}
        <Button
          href={`${commissionBaseHref}/correct?assignment_id=${singleAssignment.id}`}
          class="btn-outline"
          testId="correct-commission-action"
        >
          {$t("commissions.summary_correct_commission")}
        </Button>
        <p class="commission-summary__hint">{$t("commissions.summary_correct_scope")}</p>
      {:else if hasAssignments}
        <div class="commission-summary__correction-row">
          <div class="commission-summary__field">
            <label
              for="summary-assignment-select"
              class="text-label-md font-medium text-on-surface-variant"
            >
              {$t("commissions.summary_correct_assignment_label")}
            </label>
            <select
              id="summary-assignment-select"
              value={selectedAssignmentId}
              onchange={(event) => (selectedAssignmentId = event.currentTarget.value)}
              data-test-id="summary-assignment-select"
            >
              <option value="">{$t("commissions.summary_correct_assignment_placeholder")}</option>
              {#each assignments as assignment (assignment.id)}
                <option value={assignment.id}>{assignment.title}</option>
              {/each}
            </select>
          </div>

          {#if correctionHref}
            <Button
              href={correctionHref}
              class="btn-outline"
              testId="correct-commission-action"
            >
              {$t("commissions.summary_correct_commission")}
            </Button>
          {:else}
            <button
              type="button"
              class="btn btn-outline"
              disabled
              data-test-id="correct-commission-action"
            >
              {$t("commissions.summary_correct_commission")}
            </button>
          {/if}
        </div>
        <p class="commission-summary__hint">{$t("commissions.summary_correct_scope")}</p>
      {:else}
        <p class="commission-summary__quiet" data-test-id="summary-no-assignments">
          {$t("commissions.summary_no_assignments")}
        </p>
        <Button
          href={assignmentsHref}
          class="btn-ghost"
          testId="summary-define-assignments"
        >
          {$t("commissions.summary_define_assignments")}
        </Button>
      {/if}
    </div>
  </div>

  <div class="commission-summary__modules">
    <section class="commission-summary__module" aria-labelledby="summary-grading-title">
      <h3 id="summary-grading-title" class="commission-summary__label">
        {$t("commissions.summary_grading_title")}
      </h3>

      {#if grades.hasDeliveries}
        <div class="commission-summary__counts">
          <StatItem
            label={$t("commissions.summary_approved")}
            value={grades.approved}
            badge="success"
            data-test-id="summary-approved"
          />
          <StatItem
            label={$t("commissions.summary_rejected")}
            value={grades.rejected}
            badge="error"
            data-test-id="summary-rejected"
          />
          <StatItem
            label={$t("commissions.summary_pending_correction")}
            value={grades.pendingCorrection}
            badge="warning"
            data-test-id="summary-pending-correction"
          />
          <StatItem
            label={$t("commissions.summary_not_delivered")}
            value={grades.notDelivered}
            data-test-id="summary-not-delivered"
          />
          <StatItem
            label={$t("commissions.summary_total")}
            value={grades.total}
            data-test-id="summary-total"
          />
        </div>

        <p class="commission-summary__rate" data-test-id="summary-approval-rate">
          <span>{$t("commissions.summary_approval_rate")}</span>
          <strong>{grades.approvalRate ?? 0}%</strong>
        </p>
      {:else}
        <p class="commission-summary__quiet" data-test-id="summary-no-deliveries">
          {$t("commissions.summary_nothing_to_correct")}
        </p>
      {/if}
    </section>

    {#if grades.hasDeliveries}
      <section class="commission-summary__module" aria-labelledby="summary-correction-title">
        <h3 id="summary-correction-title" class="commission-summary__label">
          {$t("commissions.summary_correction_title")}
        </h3>
        <div data-test-id="summary-correction-progress">
          <p class="commission-summary__number">{grades.correctionRate ?? 0}%</p>
          <p class="commission-summary__detail">
            {$t("commissions.summary_correction_value", {
              corrected: grades.corrected,
              total: grades.total,
              percentage: grades.correctionRate ?? 0,
            } as never)}
          </p>
          <div class="commission-summary__track" aria-hidden="true">
            <div
              class="commission-summary__fill"
              style="width: {grades.correctionRate ?? 0}%"
            ></div>
          </div>
        </div>
      </section>
    {/if}

    <section
      class="commission-summary__module"
      aria-labelledby="summary-attendance-title"
      aria-live="polite"
      data-test-id="attendance-summary"
    >
      <h3 id="summary-attendance-title" class="commission-summary__label">
        {$t("commissions.summary_attendance_title")}
      </h3>

      {#if attendanceLoading}
        <p class="commission-summary__quiet" role="status" data-test-id="attendance-loading">
          {$t("commissions.summary_attendance_loading")}
        </p>
      {:else if attendanceFailed}
        <div data-test-id="attendance-error">
          <LoadError
            message={$t("commissions.summary_attendance_error")}
            onRetry={onRetryAttendance}
          />
        </div>
      {:else if attendance.recorded === 0}
        <p class="commission-summary__quiet" data-test-id="attendance-empty">
          {$t("commissions.summary_attendance_empty")}
        </p>
      {:else}
        <p class="commission-summary__number" data-test-id="attendance-rate">
          {attendance.rate}%
        </p>
        <p class="commission-summary__detail" data-test-id="attendance-counts">
          {$t("commissions.summary_attendance_counts", {
            present: attendance.present,
            recorded: attendance.recorded,
          } as never)}
        </p>
      {/if}
    </section>
  </div>
</section>

<style>
  .commission-summary {
    min-width: 0;
    padding: 1rem;
    border: 1px solid var(--color-base-300);
    border-radius: var(--radius-box);
    background-color: var(--color-base-100);
  }

  .commission-summary__head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
  }

  .commission-summary__intro {
    min-width: 0;
  }

  .commission-summary__correction {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    width: 100%;
    min-width: 0;
  }

  .commission-summary__correction-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 0.5rem;
    width: 100%;
    min-width: 0;
  }

  .commission-summary__field {
    display: flex;
    flex: 1 1 12rem;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
  }

  .commission-summary__field select {
    width: 100%;
    min-width: 0;
  }

  .commission-summary__hint {
    margin: 0;
    color: var(--color-on-surface-variant);
    font-family: var(--font-sans);
    font-size: 0.75rem;
    line-height: 1rem;
  }

  .commission-summary__modules {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-base-300);
  }

  .commission-summary__module {
    min-width: 0;
  }

  .commission-summary__label {
    margin: 0 0 0.5rem;
    color: var(--color-on-surface-variant);
    font-family: var(--font-sans);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    line-height: 0.875rem;
    text-transform: uppercase;
  }

  .commission-summary__counts {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem 1rem;
  }

  .commission-summary__counts :global(.stat-item) {
    margin-bottom: 0;
  }

  .commission-summary__rate {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin: 0.75rem 0 0;
    color: var(--color-on-surface-variant);
    font-size: 0.75rem;
    line-height: 1rem;
  }

  .commission-summary__rate strong {
    color: var(--color-on-surface);
    font-family: var(--font-serif);
    font-size: 1.125rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  .commission-summary__number {
    margin: 0;
    color: var(--color-on-surface);
    font-family: var(--font-serif);
    font-size: var(--text-display-lg-mobile);
    font-variant-numeric: tabular-nums;
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: var(--text-display-lg-mobile--line-height);
  }

  .commission-summary__detail {
    margin: 0.25rem 0 0;
    color: var(--color-on-surface-variant);
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }

  .commission-summary__quiet {
    margin: 0;
    color: var(--color-on-surface-variant);
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }

  .commission-summary__track {
    height: 0.25rem;
    margin-top: 0.75rem;
    overflow: hidden;
    border-radius: 9999px;
    background-color: var(--color-surface-container);
  }

  .commission-summary__fill {
    height: 100%;
    border-radius: inherit;
    background-color: var(--color-on-surface-variant);
  }

  @media (min-width: 768px) {
    .commission-summary {
      padding: 1.25rem;
    }

    .commission-summary__correction {
      align-items: flex-end;
      width: auto;
      max-width: 34rem;
    }

    .commission-summary__correction-row {
      flex-wrap: nowrap;
      justify-content: flex-end;
    }

    .commission-summary__field {
      flex: 0 1 16rem;
    }

    .commission-summary__hint {
      text-align: right;
    }
  }

  @media (min-width: 900px) {
    .commission-summary__modules {
      grid-template-columns: 1.4fr 1fr 1fr;
      gap: 1.5rem;
    }

    .commission-summary__module + .commission-summary__module {
      padding-left: 1.5rem;
      border-left: 1px solid var(--color-base-300);
    }
  }
</style>
