<script lang="ts">
  import OverviewRow from "$lib/components/grids/overview/OverviewRow.svelte";
  import OverviewHeader from "./OverviewHeader.svelte";
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "$lib/i18n/config";
  import type { Assignment } from "$lib/types/academic";
  import type { StudentGridRowDTO } from "$lib/types/dto";

  interface Props {
    assignments: Assignment[];
    grid: StudentGridRowDTO[];
    facultyId: number;
    subjectId: number;
    periodId: number;
    commissionId: number;
  }

  let { assignments, grid, facultyId, subjectId, periodId, commissionId }: Props = $props();
</script>

{#if assignments.length === 0}
  <div class="card margin-top-lg" data-test-id="empty-assignments-card">
    <div class="card-body text-center">
      <h4 class="card-title">{$t("commissions.no_assignments_message")} ✏️</h4>
      <div class="margin-top-md">
        <Button
          href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/assignments"
          class="btn-secondary"
          testId="empty-assignments-cta"
        >
          {$t("commissions.define_assignments_cta")}
        </Button>
      </div>
    </div>
  </div>
{:else if grid.length === 0}
  <div class="card margin-top-lg" data-test-id="empty-students-card">
    <div class="card-body text-center">
      <h4 class="card-title">{$t("commissions.no_students_message")} 👤</h4>
      <div class="margin-top-md">
        {#if commissionId > 0}
          <Button
            href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/commissions/{commissionId}/students"
            class="btn-secondary"
            testId="empty-students-cta"
          >
            {$t("commissions.enroll_students_cta")}
          </Button>
        {:else}
          <Button
            href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/commissions"
            class="btn-secondary"
            testId="empty-commissions-cta"
          >
            {$t("commissions.define_commissions_cta")}
          </Button>
        {/if}
      </div>
    </div>
  </div>
{:else}
  <div
    class="overview-grid"
    data-test-id="overview-grid"
    style="display: grid; --cols: {assignments.length};"
  >
    <OverviewHeader {assignments} {facultyId} {subjectId} {periodId} {commissionId} />

    {#each grid as student}
      <OverviewRow
        name={student.name}
        deliveries={student.deliveries}
        {facultyId}
        {subjectId}
        {periodId}
        {commissionId}
        studentCommissionId={student.commission_id}
      />
    {/each}
  </div>
{/if}

<style>
  .overview-grid {
    display: grid;
    /* First track 12rem for student name, N tracks of 2.8rem for each assignment */
    grid-template-columns: 12rem repeat(var(--cols, 1), 2.8rem);
    gap: 0.25rem;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
  .margin-top-lg {
    margin-top: 1.5rem;
  }
  .margin-top-md {
    margin-top: 1rem;
  }
  .text-center {
    text-align: center;
  }
</style>
