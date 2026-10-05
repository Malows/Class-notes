<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Commission } from "$lib/common/types/academic";

  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
  import CommissionRow from "../rows/CommissionRow.svelte";

  interface Props {
    commissions: Commission[];
    facultySlug: string;
    subjectSlug: string;
    periodId: number;
    onEdit: (commission: Commission) => void;
    onDelete: (commission: Commission) => void;
  }

  let { commissions, facultySlug, subjectSlug, periodId, onEdit, onDelete }: Props = $props();
</script>

<ResponsiveTable items={commissions}>
  {#snippet header()}
    <th>{$t("layout.name")}</th>
    <th>{$t("layout.students")}</th>
    <th>{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(commission)}
    <CommissionRow {commission} {facultySlug} {subjectSlug} {periodId} {onEdit} {onDelete} />
  {/snippet}
</ResponsiveTable>
