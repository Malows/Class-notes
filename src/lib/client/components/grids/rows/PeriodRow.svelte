<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Period } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";

  interface Props {
    period: Period;
    onEdit: (period: Period) => void;
    onDelete: (period: Period) => void;
  }

  let { period, onEdit, onDelete }: Props = $props();

  const rootPath = $derived(() => `/periods/${period.year}/${period.semester}`);
</script>

<td data-label={$t("layout.year")} data-test-id="period-year-{period.id}">{period.year}</td>
<td data-label={$t("layout.semester")} data-test-id="period-semester-{period.id}">{period.semester}º</td>
<td>
  <RowActions label={`${period.year} - ${period.semester}º`} testId="row-actions-{period.id}">
    {#snippet primary()}
      <Button href="{rootPath()}/subjects" testId="view-subjects-btn-{period.id}" withHover>
        {$t("layout.subjects")}
      </Button>
    {/snippet}
    {#snippet overflow()}
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
