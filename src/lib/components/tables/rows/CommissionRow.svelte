<script lang="ts">
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "$lib/i18n/config";
  import type { Commission } from "$lib/types";

  interface Props {
    commission: Commission;
    facultyId: number;
    subjectId: number;
    periodId: number;
    onEdit: (commission: Commission) => void;
    onDelete: (commission: Commission) => void;
  }

  let { commission, facultyId, subjectId, periodId, onEdit, onDelete }: Props = $props();

  const rootPath = $derived(
    () =>
      `/faculties/${facultyId}/subjects/${subjectId}/periods/${periodId}/commissions/${commission.id}`,
  );
</script>

<td data-test-id="commission-name-{commission.id}">{commission.name}</td>
<td>{commission.student_count}</td>
<td>
  <div class="row flex-right gap-2">
    <Button testId="view-students-btn-{commission.id}" href="{rootPath()}/students" withHover>
      {$t("layout.students_list")}
    </Button>
    <Button testId="view-overview-btn-{commission.id}" href="{rootPath()}/overview" withHover>
      {$t("layout.overview")}
    </Button>
    <Button testId="edit-btn-{commission.id}" withHover onclick={() => onEdit(commission)}>
      {$t("common.edit")}
    </Button>
    <Button testId="delete-btn-{commission.id}" withHover onclick={() => onDelete(commission)}>
      {$t("common.delete")}
    </Button>
  </div>
</td>
