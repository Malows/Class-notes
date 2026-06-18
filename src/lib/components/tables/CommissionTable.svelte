<script lang="ts">
  import ResponsiveTable from "$lib/components/common/ResponsiveTable.svelte";
  import { t } from "$lib/i18n/config";
  import type { Commission } from "$lib/types";

  import CommissionRow from "./rows/CommissionRow.svelte";

  interface Props {
    commissions: Commission[];
    facultyId: number;
    subjectId: number;
    periodId: number;
    onEdit: (commission: Commission) => void;
    onDelete: (commission: Commission) => void;
  }

  let { commissions, facultyId, subjectId, periodId, onEdit, onDelete }: Props = $props();
</script>

<ResponsiveTable items={commissions}>
  {#snippet header()}
    <th>{$t("layout.name")}</th>
    <th>{$t("layout.students")}</th>
    <th>{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(commission)}
    <CommissionRow {commission} {facultyId} {subjectId} {periodId} {onEdit} {onDelete} />
  {/snippet}
</ResponsiveTable>
