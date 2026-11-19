<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Period } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import MobileCard from "$lib/client/components/common/MobileCard.svelte";
  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";
  import SubjectPeriodRow from "../rows/SubjectPeriodRow.svelte";

  interface Props {
    periods: Period[];
    facultySlug: string;
    subjectSlug: string;
    onEdit: (period: Period) => void;
    onDelete: (period: Period) => void;
  }

  let { periods, facultySlug, subjectSlug, onEdit, onDelete }: Props = $props();
</script>

<ResponsiveTable items={periods}>
  {#snippet header()}
    <th data-test-id="table-header-year">{$t("layout.year")}</th>
    <th data-test-id="table-header-semester">{$t("layout.semester")}</th>
    <th data-test-id="table-header-actions">{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(period)}
    <SubjectPeriodRow {period} {facultySlug} {subjectSlug} {onEdit} {onDelete} />
  {/snippet}
  {#snippet card(period)}
    <MobileCard
      title={`${period.year} · ${period.semester}º`}
      testId="subject-period-card-{period.id}"
    >
      {#snippet actions()}
        <RowActions
          label={`${period.year} - ${period.semester}º`}
          testId="subject-period-card-actions-{period.id}"
        >
          {#snippet primary()}
            <Button
              href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{period.year}/{period.semester}/overview"
              testId="mobile-view-overview-btn-{period.id}"
              withHover
            >
              {$t("layout.overview")}
            </Button>
          {/snippet}
          {#snippet overflow()}
            <Button
              href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{period.year}/{period.semester}/commissions"
              testId="mobile-view-commissions-btn-{period.id}"
              withHover
            >
              {$t("layout.commissions")}
            </Button>
            <Button
              href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{period.year}/{period.semester}/attendance"
              testId="mobile-view-attendance-btn-{period.id}"
              withHover
            >
              {$t("attendance.cursada_title")}
            </Button>
            <Button
              href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{period.year}/{period.semester}/assignments"
              testId="mobile-view-assignments-btn-{period.id}"
              withHover
            >
              {$t("layout.define_tps")}
            </Button>
            <Button
              href="/periods/{period.year}/{period.semester}/subjects"
              testId="mobile-manage-subjects-btn-{period.id}"
              withHover
            >
              {$t("layout.subjects")}
            </Button>
            <Button onclick={() => onEdit(period)} testId="mobile-edit-btn-{period.id}" withHover>
              {$t("common.edit")}
            </Button>
          {/snippet}
          {#snippet destructive()}
            <Button onclick={() => onDelete(period)} testId="mobile-delete-btn-{period.id}" withHover>
              {$t("common.delete")}
            </Button>
          {/snippet}
        </RowActions>
      {/snippet}
    </MobileCard>
  {/snippet}
</ResponsiveTable>
