<script lang="ts">
  import ResponsiveTable from "$lib/components/common/ResponsiveTable.svelte";
  import { t } from "$lib/i18n/config";
  import type { Assignment } from "$lib/types";

  import AssignmentRow from "./rows/AssignmentRow.svelte";

  interface Props {
    assignments: Assignment[];
    onDelete: (assignment: Assignment) => void;
  }

  let { assignments, onDelete }: Props = $props();
</script>

<ResponsiveTable items={assignments}>
  {#snippet header()}
    <th>{$t("layout.title")}</th>
    <th>{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(assignment)}
    <AssignmentRow {assignment} {onDelete} />
  {/snippet}
</ResponsiveTable>
