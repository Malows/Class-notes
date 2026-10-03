<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Period } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";

  interface Props {
    period: Period;
    onEdit: (period: Period) => void;
    onDelete: (period: Period) => void;
  }

  let { period, onEdit, onDelete }: Props = $props();

  const rootPath = $derived(() => `/periods/${period.year}/${period.semester}`);
</script>

<td data-test-id="period-year-{period.id}">{period.year}</td>
<td data-test-id="period-semester-{period.id}">{period.semester}º</td>
<td>
  <div class="row flex-right gap-2">
    <Button href="{rootPath()}/subjects" testId="view-subjects-btn-{period.id}" withHover>
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
