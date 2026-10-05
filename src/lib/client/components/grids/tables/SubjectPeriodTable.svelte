<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Period } from "$lib/common/types/academic";

  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
  import SubjectPeriodRow from "../rows/SubjectPeriodRow.svelte";

  interface Props {
    periods: Period[];
    facultySlug: string;
    subjectSlug: string;
    onEdit: (period: Period) => void;
    onDelete: (period: Period) => void;
  }

  let { periods, facultySlug, subjectSlug, onEdit, onDelete }: Props = $props();
</script>

<ResponsiveTable items={periods}>
  {#snippet header()}
    <th data-test-id="table-header-year">{$t("layout.year")}</th>
    <th data-test-id="table-header-semester">{$t("layout.semester")}</th>
    <th data-test-id="table-header-actions">{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(period)}
    <SubjectPeriodRow {period} {facultySlug} {subjectSlug} {onEdit} {onDelete} />
  {/snippet}
</ResponsiveTable>
