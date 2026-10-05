<script lang="ts">
  import type { Assignment } from "$lib/common/types/academic";

  import OverviewHeaderCell from "./OverviewHeaderCell.svelte";

  interface Props {
    assignments: Assignment[];
    facultySlug: string;
    subjectSlug: string;
    periodId: number;
    commissionId: number;
  }

  let { assignments, facultySlug, subjectSlug, periodId, commissionId }: Props = $props();
</script>

<div class="overview-header" data-test-id="overview-header">
  <div class="overview-header__students">
    <h4 class="overview-header__students-title" data-test-id="overview-header-students-title">
      Students
    </h4>
  </div>

  {#each assignments as assignment}
    <OverviewHeaderCell {assignment} {facultySlug} {subjectSlug} {periodId} {commissionId} />
  {/each}
</div>

<style>
  .overview-header {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    gap: inherit;
    padding: 0.25rem 0.5rem;
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
    grid-column: 1 / -1;
    grid-row: 1 / 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
