<script lang="ts">
  import OverviewRow from "$lib/components/grids/overview/OverviewRow.svelte";
  import OverviewHeader from "./OverviewHeader.svelte";
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
    />
  {/each}
</div>

<style>
  .overview-grid {
    display: grid;
    /* First track 12rem for student name, N tracks of 2.8rem for each assignment */
    grid-template-columns: 12rem repeat(var(--cols, 1), 2.8rem);
    gap: 0.5rem;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
</style>
