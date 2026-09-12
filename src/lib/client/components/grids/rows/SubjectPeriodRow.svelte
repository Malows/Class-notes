<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Period } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";

  interface Props {
    period: Period;
    facultyId: number;
    subjectId: number;
    onEdit: (period: Period) => void;
    onDelete: (period: Period) => void;
  }

  let { period, facultyId, subjectId, onEdit, onDelete }: Props = $props();

  const rootPath = $derived(
    () => `/faculties/${facultyId}/subjects/${subjectId}/periods/${period.id}`,
  );
</script>

<td data-test-id="period-year-{period.id}">{period.year}</td>
<td data-test-id="period-semester-{period.id}">{period.semester}º</td>
<td>
  <div class="row flex-right gap-2">
    <Button href="{rootPath()}/overview" testId="view-overview-btn-{period.id}" withHover>
      {$t("layout.overview")}
    </Button>
    <Button href="{rootPath()}/commissions" testId="view-commissions-btn-{period.id}" withHover>
      {$t("layout.commissions")}
    </Button>
    <Button href="{rootPath()}/assignments" testId="view-assignments-btn-{period.id}" withHover>
      {$t("layout.define_tps")}
    </Button>
    <Button testId="manage-subjects-btn-{period.id}" withHover onclick={() => onEdit(period)}>
      {$t("layout.subjects")}
    </Button>
    <Button testId="edit-btn-{period.id}" withHover onclick={() => onEdit(period)}>
      {$t("common.edit")}
    </Button>
    <Button testId="delete-btn-{period.id}" withHover onclick={() => onDelete(period)}>
      {$t("common.delete")}
    </Button>
  </div>
</td>
