<script lang="ts">
  import ResponsiveTable from "$lib/components/common/ResponsiveTable.svelte";
  import { t } from "$lib/i18n/config";
  import type { Period } from "$lib/types";

  import PeriodRow from "../rows/PeriodRow.svelte";

  interface Props {
    periods: Period[];
    facultyId: number;
    subjectId: number;
    onEdit: (period: Period) => void;
    onDelete: (period: Period) => void;
  }

  let { periods, facultyId, subjectId, onEdit, onDelete }: Props = $props();
</script>

<ResponsiveTable items={periods}>
  {#snippet header()}
    <th data-test-id="table-header-year">{$t("layout.year")}</th>
    <th data-test-id="table-header-semester">{$t("layout.semester")}</th>
    <th data-test-id="table-header-actions">{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(period)}
    <PeriodRow {period} {facultyId} {subjectId} {onEdit} {onDelete} />
  {/snippet}
</ResponsiveTable>
