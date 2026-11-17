<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Period } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";

  interface Props {
    period: Period;
    facultySlug: string;
    subjectSlug: string;
    onEdit: (period: Period) => void;
    onDelete: (period: Period) => void;
  }

  let { period, facultySlug, subjectSlug, onEdit, onDelete }: Props = $props();

  const rootPath = $derived(
    () => `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${period.year}/${period.semester}`,
  );
</script>

<td data-test-id="period-year-{period.id}">{period.year}</td>
<td data-test-id="period-semester-{period.id}">{period.semester}º</td>
<td>
  <RowActions label={`${period.year} - ${period.semester}º`} testId="row-actions-{period.id}">
    {#snippet primary()}
      <Button href="{rootPath()}/overview" testId="view-overview-btn-{period.id}" withHover>
        {$t("layout.overview")}
      </Button>
    {/snippet}
    {#snippet overflow()}
      <Button href="{rootPath()}/commissions" testId="view-commissions-btn-{period.id}" withHover>
        {$t("layout.commissions")}
      </Button>
      <Button href="{rootPath()}/attendance" testId="view-attendance-btn-{period.id}" withHover>
        {$t("attendance.cursada_title")}
      </Button>
      <Button href="{rootPath()}/assignments" testId="view-assignments-btn-{period.id}" withHover>
        {$t("layout.define_tps")}
      </Button>
      <Button
        href="/periods/{period.year}/{period.semester}/subjects"
        testId="manage-subjects-btn-{period.id}"
        withHover
      >
        {$t("layout.subjects")}
      </Button>
      <Button testId="edit-btn-{period.id}" withHover onclick={() => onEdit(period)}>
        {$t("common.edit")}
      </Button>
    {/snippet}
    {#snippet destructive()}
      <Button testId="delete-btn-{period.id}" withHover onclick={() => onDelete(period)}>
        {$t("common.delete")}
      </Button>
    {/snippet}
  </RowActions>
</td>