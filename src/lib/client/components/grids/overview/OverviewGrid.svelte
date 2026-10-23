<script lang="ts">
  import type { Assignment } from "$lib/common/types/academic";
  import type { EnrollmentGridRowDTO } from "$lib/common/types/dto";

  import OverviewRow from "./OverviewRow.svelte";
  import OverviewHeader from "./OverviewHeader.svelte";
  import OverviewEmptyAssignments from "./OverviewEmptyAssignments.svelte";
  import OverviewEmptyStudents from "./OverviewEmptyStudents.svelte";

  interface Props {
    assignments: Assignment[];
    grid: EnrollmentGridRowDTO[];
    facultySlug: string;
    subjectSlug: string;
    periodYear: number;
    periodSemester: number;
    commissionSlug: string;
  }

  let {
    assignments,
    grid,
    facultySlug,
    subjectSlug,
    periodYear,
    periodSemester,
    commissionSlug,
  }: Props = $props();
</script>

{#if grid.length === 0}
  <OverviewEmptyStudents
    {facultySlug}
    {subjectSlug}
    {periodYear}
    {periodSemester}
    {commissionSlug}
  />
{:else if assignments.length === 0}
  <OverviewEmptyAssignments {facultySlug} {subjectSlug} {periodYear} {periodSemester} />
{:else}
  <div
    class="overview-grid"
    data-test-id="overview-grid"
    style="display: grid; --cols: {assignments.length};"
  >
    <OverviewHeader {assignments} {facultySlug} {subjectSlug} {periodYear} {periodSemester} {commissionSlug} />

    {#each grid as student}
      <OverviewRow
        name={student.name}
        deliveries={student.deliveries}
        {facultySlug}
        {subjectSlug}
        {periodYear}
        {periodSemester}
        {commissionSlug}
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
</style>