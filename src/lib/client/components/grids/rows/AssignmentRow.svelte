<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Assignment } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";

  interface Props {
    assignment: Assignment;
    onEdit: (assignment: Assignment) => void;
    onDelete: (assignment: Assignment) => void;
    onBulkUpdate: (assignment: Assignment) => void;
  }

  let { assignment, onEdit, onDelete, onBulkUpdate }: Props = $props();
</script>

<td data-test-id="assignment-title-{assignment.id}">{assignment.title}</td>
<td>{assignment.subtitle ?? ""}</td>
<td
  >{assignment.workflow_status
    ? $t(`assignments.workflow_status.${assignment.workflow_status.toLowerCase()}`)
    : ""}</td
>
<td>
  <RowActions label={assignment.title} testId="row-actions-{assignment.id}">
    {#snippet primary()}
      <Button
        testId="bulk-update-btn-{assignment.id}"
        onclick={() => onBulkUpdate(assignment)}
        withHover
        disabled={assignment.workflow_status === "WAITING_FOR_CORRECTION"}
      >
        {$t("common.bulk_update")}
      </Button>
    {/snippet}
    {#snippet overflow()}
      <Button testId="edit-btn-{assignment.id}" onclick={() => onEdit(assignment)} withHover>
        {$t("common.edit")}
      </Button>
    {/snippet}
    {#snippet destructive()}
      <Button testId="delete-btn-{assignment.id}" onclick={() => onDelete(assignment)} withHover>
        {$t("common.remove")}
      </Button>
    {/snippet}
  </RowActions>
</td>
