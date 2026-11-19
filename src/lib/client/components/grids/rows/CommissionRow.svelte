<script lang="ts">
  import Button from "$lib/client/components/common/Button.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";
  import { t } from "$lib/common/i18n/config";
  import type { Commission } from "$lib/common/types/academic";

  interface Props {
    commission: Commission;
    facultySlug: string;
    subjectSlug: string;
    periodYear: number;
    periodSemester: number;
    onEdit: (commission: Commission) => void;
    onDelete: (commission: Commission) => void;
  }

  let {
    commission,
    facultySlug,
    subjectSlug,
    periodYear,
    periodSemester,
    onEdit,
    onDelete,
  }: Props = $props();

  const rootPath = $derived(
    () =>
      `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${periodYear}/${periodSemester}/commissions/${commission.slug}`,
  );
</script>

<td data-label={$t("layout.name")} data-test-id="commission-name-{commission.id}">{commission.name}</td>
<td data-label={$t("layout.students")}>{commission.student_count}</td>
<td>
  <RowActions label={commission.name} testId="row-actions-{commission.id}">
    {#snippet primary()}
      <Button
        testId="view-attendance-btn-{commission.id}"
        href="{rootPath()}/attendance"
        withHover
        class="btn-primary"
      >
        {$t("attendance.commission_title")}
      </Button>
      <Button
        testId="view-overview-btn-{commission.id}"
        href="{rootPath()}/overview"
        withHover
        class="btn-ghost"
      >
        {$t("layout.overview")}
      </Button>
    {/snippet}
    {#snippet overflow()}
      <Button testId="view-students-btn-{commission.id}" href="{rootPath()}/students" withHover>
        {$t("layout.students_list")}
      </Button>
      <Button testId="edit-btn-{commission.id}" withHover onclick={() => onEdit(commission)}>
        {$t("common.edit")}
      </Button>
    {/snippet}
    {#snippet destructive()}
      <Button testId="delete-btn-{commission.id}" withHover onclick={() => onDelete(commission)}>
        {$t("common.delete")}
      </Button>
    {/snippet}
  </RowActions>
</td>