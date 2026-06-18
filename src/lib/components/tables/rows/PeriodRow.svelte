<script lang="ts">
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "$lib/i18n/config";
  import type { Period } from "$lib/types";

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
    <Button href="{rootPath()}/commissions" testId="view-commissions-btn-{period.id}" withHover>
      {$t("layout.commissions")}
    </Button>
    <Button href="{rootPath()}/assignments" testId="view-assignments-btn-{period.id}" withHover>
      {$t("layout.define_tps")}
    </Button>
    <Button testId="edit-btn-{period.id}" withHover onclick={() => onEdit(period)}>
      {$t("layout.edit")}
    </Button>
    <Button testId="delete-btn-{period.id}" withHover onclick={() => onDelete(period)}>
      {$t("layout.delete")}
    </Button>
  </div>
</td>
