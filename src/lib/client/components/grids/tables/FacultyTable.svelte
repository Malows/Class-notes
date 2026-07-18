<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Faculty } from "$lib/common/types/academic";

  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
  import FacultyRow from "../rows/FacultyRow.svelte";

  interface Props {
    faculties: Faculty[];
    onEdit: (faculty: Faculty) => void;
    onDelete: (faculty: Faculty) => void;
  }

  let { faculties, onEdit, onDelete }: Props = $props();
</script>

<ResponsiveTable items={faculties}>
  {#snippet header()}
    <th data-test-id="table-header-id">{$t("layout.id")}</th>
    <th data-test-id="table-header-name">{$t("layout.name")}</th>
    <th data-test-id="table-header-actions">{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(faculty)}
    <FacultyRow {faculty} {onEdit} {onDelete} />
  {/snippet}
</ResponsiveTable>
