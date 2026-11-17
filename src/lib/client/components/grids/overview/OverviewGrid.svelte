<script lang="ts">
  import type { Assignment } from "$lib/common/types/academic";
  import type { EnrollmentGridRowDTO } from "$lib/common/types/dto";

  import { t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";
  import EmptyState from "$lib/client/components/common/EmptyState.svelte";

  import OverviewRow from "./OverviewRow.svelte";
  import OverviewHeader from "./OverviewHeader.svelte";

  interface Props {
    assignments: Assignment[];
    grid: EnrollmentGridRowDTO[];
    facultySlug: string;
    subjectSlug: string;
    periodYear: number;
    periodSemester: number;
    commissionSlug: string;
    commissions?: Array<{ id: number; slug: string }>;
  }

  let {
    assignments,
    grid,
    facultySlug,
    subjectSlug,
    periodYear,
    periodSemester,
    commissionSlug,
    commissions = [],
  }: Props = $props();

  const commissionSlugById = $derived(new Map(commissions.map((c) => [c.id, c.slug])));

  // The cursada grid holds rows from several commissions: each cell returns to
  // the commission of its own row, not to the (empty) page-level slug.
  const resolveCommissionSlug = (commissionId?: number) =>
    (commissionId !== undefined ? commissionSlugById.get(commissionId) : undefined) ??
    (commissionSlug || undefined);
</script>

{#if grid.length === 0}
  <EmptyState
    icon="👤"
    title={$t("commissions.no_students_message")}
    testId="empty-students-card"
  >
    {#snippet actions()}
      {#if commissionSlug}
        <Button
          href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/commissions/{commissionSlug}/students"
          class="btn-secondary"
          testId="empty-students-cta"
        >
          {$t("commissions.enroll_students_cta")}
        </Button>
      {:else}
        <Button
          href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/commissions"
          class="btn-secondary"
          testId="empty-commissions-cta"
        >
          {$t("commissions.define_commissions_cta")}
        </Button>
      {/if}
    {/snippet}
  </EmptyState>
{:else if assignments.length === 0}
  <EmptyState
    icon="✏️"
    title={$t("commissions.no_assignments_message")}
    testId="empty-assignments-card"
  >
    {#snippet actions()}
      <Button
        href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/assignments"
        class="btn-secondary"
        testId="empty-assignments-cta"
      >
        {$t("commissions.define_assignments_cta")}
      </Button>
    {/snippet}
  </EmptyState>
{:else}
  <div
    class="overview-grid"
    data-test-id="overview-grid"
    style="display: grid; --cols: {assignments.length};"
  >
    <OverviewHeader {assignments} {facultySlug} {subjectSlug} {periodYear} {periodSemester} {commissionSlug} />

    {#each grid as student}
      {@const rowCommissionSlug = resolveCommissionSlug(student.commission_id)}
      <OverviewRow
        name={student.name}
        deliveries={student.deliveries}
        {facultySlug}
        {subjectSlug}
        {periodYear}
        {periodSemester}
        commissionSlug={rowCommissionSlug}
      />
    {/each}
  </div>
{/if}

<style>
  .overview-grid {
    display: grid;
    /* First track 12rem for student name, N tracks of 3.2rem for each assignment */
    grid-template-columns: 12rem repeat(var(--cols, 1), 3.2rem);
    gap: 0.25rem;
    width: 100%;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }
</style>
