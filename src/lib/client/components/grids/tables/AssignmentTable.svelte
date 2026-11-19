<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Assignment } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import MobileCard from "$lib/client/components/common/MobileCard.svelte";
  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";
  import AssignmentRow from "../rows/AssignmentRow.svelte";

  interface Props {
    assignments: Assignment[];
    onEdit: (assignment: Assignment) => void;
    onDelete: (assignment: Assignment) => void;
    onBulkUpdate?: (assignment: Assignment) => void;
  }

  let { assignments, onEdit, onDelete, onBulkUpdate = () => {} }: Props = $props();
</script>

<ResponsiveTable items={assignments}>
  {#snippet header()}
    <th>{$t("layout.title")}</th>
    <th>{$t("layout.subtitle")}</th>
    <th>{$t("layout.status")}</th>
    <th>{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(assignment)}
    <AssignmentRow {assignment} {onEdit} {onDelete} {onBulkUpdate} />
  {/snippet}
  {#snippet card(assignment)}
    <MobileCard
      title={assignment.title}
      meta={[
        { label: $t("layout.subtitle"), value: assignment.subtitle ?? "—" },
        {
          label: $t("layout.status"),
          value: assignment.workflow_status
            ? $t(`assignments.workflow_status.${assignment.workflow_status.toLowerCase()}`)
            : "—",
        },
      ]}
      testId="assignment-card-{assignment.id}"
    >
      {#snippet actions()}
        <RowActions label={assignment.title} testId="assignment-card-actions-{assignment.id}">
          {#snippet primary()}
            <Button
              testId="mobile-bulk-update-btn-{assignment.id}"
              onclick={() => onBulkUpdate(assignment)}
              withHover
              disabled={assignment.workflow_status === "WAITING_FOR_CORRECTION"}
            >
              {$t("common.bulk_update")}
            </Button>
          {/snippet}
          {#snippet overflow()}
            <Button
              testId="mobile-edit-btn-{assignment.id}"
              onclick={() => onEdit(assignment)}
              withHover
            >
              {$t("common.edit")}
            </Button>
          {/snippet}
          {#snippet destructive()}
            <Button
              testId="mobile-delete-btn-{assignment.id}"
              onclick={() => onDelete(assignment)}
              withHover
            >
              {$t("common.remove")}
            </Button>
          {/snippet}
        </RowActions>
      {/snippet}
    </MobileCard>
  {/snippet}
</ResponsiveTable>
