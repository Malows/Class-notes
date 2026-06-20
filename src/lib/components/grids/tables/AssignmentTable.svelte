<script lang="ts">
  import { t } from "$lib/i18n/config";
  import type { Assignment } from "$lib/types";

  import ResponsiveTable from "$lib/components/common/ResponsiveTable.svelte";
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
</ResponsiveTable>
