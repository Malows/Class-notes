<script lang="ts">
  import OverviewRow from "$lib/components/grids/overview/OverviewRow.svelte";
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

<div class="overview-grid" data-test-id="overview-grid" style="display: grid;">
  <div class="overview-grid__header">
    <div class="overview-grid__header-title">Students</div>
    <div class="overview-grid__assignments">
      {#each assignments as assignment}
        <div class="overview-grid__assignment" title={assignment.title}>
          <span class="overview-grid__assignment-title">{assignment.title}</span>
          <a
            href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/commissions/{commissionId}/correct?assignment_id={assignment.id}"
            class="overview-grid__correct-link"
            data-test-id={`correct-assignment-btn-${assignment.id}`}
          >
            Correct
          </a>
        </div>
      {/each}
    </div>
  </div>

  {#each grid as student}
    <OverviewRow
      name={student.name}
      deliveries={student.deliveries}
      {facultyId}
      {subjectId}
      {periodId}
      {commissionId}
    />
  {/each}
</div>

<style>
  .overview-grid {
    display: grid;
    gap: 0.75rem;
    width: 100%;
  }

  .overview-grid__header {
    display: grid;
    grid-template-columns: minmax(8rem, 12rem) minmax(0, 1fr);
    gap: 0.75rem;
    align-items: center;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid #ddd;
  }

  .overview-grid__header-title {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .overview-grid__assignments {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(2.8rem, 2.8rem));
    gap: 0.5rem;
  }

  .overview-grid__assignment {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    min-height: 3.4rem;
    padding: 0.25rem;
    border: 1.5px solid #d0d0d0;
    border-radius: 0.35rem;
    background: #f8f9fa;
    text-align: center;
  }

  .overview-grid__assignment-title {
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .overview-grid__correct-link {
    font-size: 0.7rem;
    text-decoration: none;
    color: #1e88e5;
  }
</style>
