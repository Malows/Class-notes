<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Assignment } from "$lib/common/types/academic";

  import OverviewHeaderCell from "./OverviewHeaderCell.svelte";

  interface Props {
    assignments: Assignment[];
    facultySlug: string;
    subjectSlug: string;
    periodYear: number;
    periodSemester: number;
    commissionSlug: string;
  }

  let {
    assignments,
    facultySlug,
    subjectSlug,
    periodYear,
    periodSemester,
    commissionSlug,
  }: Props = $props();
</script>

<div class="overview-header" data-test-id="overview-header">
  <div class="sticky left-0 z-[1] grid grid-rows-[2rem_2.8rem] items-center bg-surface">
    <p
      class="m-0 overflow-hidden text-ellipsis whitespace-nowrap text-label-sm uppercase tracking-[0.04em] text-on-surface-variant"
      data-test-id="overview-header-students-title"
    >
      {$t("layout.students_label")}
    </p>
  </div>

  {#each assignments as assignment}
    <OverviewHeaderCell {assignment} {facultySlug} {subjectSlug} {periodYear} {periodSemester} {commissionSlug} />
  {/each}
</div>

<style>
  .overview-header {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    gap: inherit;
    width: 100%;
    padding: 0.25rem 0.5rem;
    border-bottom: 1px solid var(--color-outline-variant);
  }
</style>
