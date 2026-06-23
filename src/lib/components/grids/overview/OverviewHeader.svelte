<script lang="ts">
  import OverviewHeaderCell from "./OverviewHeaderCell.svelte";
  import type { Assignment } from "$lib/types/academic";

  interface Props {
    assignments: Assignment[];
    facultyId: number;
    subjectId: number;
    periodId: number;
    commissionId: number;
  }

  let { assignments, facultyId, subjectId, periodId, commissionId }: Props = $props();
</script>

<div class="overview-header" data-test-id="overview-header">
  <div class="overview-header__students">
    <div class="overview-header__students-title" data-test-id="overview-header-students-title">
      Students
    </div>
    <div class="overview-header__students-empty"></div>
  </div>

  <div class="overview-header__assignments">
    {#each assignments as assignment}
      <OverviewHeaderCell {assignment} {facultyId} {subjectId} {periodId} {commissionId} />
    {/each}
  </div>
</div>

<style>
  .overview-header {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    gap: 0.75rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid #ddd;
    width: 100%;
  }

  .overview-header__students {
    display: grid;
    grid-template-rows: 2rem 2.8rem;
    align-items: center;
  }

  .overview-header__students-title {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .overview-header__students-empty {
    height: 100%;
  }

  .overview-header__assignments {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(2.8rem, 2.8rem));
    gap: 0.5rem;
  }
</style>
