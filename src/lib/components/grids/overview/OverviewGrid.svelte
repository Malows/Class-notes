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

<div class="overview-grid" data-test-id="overview-grid" style="display: grid;">
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
    gap: 0.75rem;
    width: 100%;
  }
</style>
