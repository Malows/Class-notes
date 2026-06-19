<script lang="ts">
  import ResponsiveTable from "$lib/components/common/ResponsiveTable.svelte";
  import { t } from "$lib/i18n/config";
  import type { Student } from "$lib/types";

  import StudentRow from "../rows/StudentRow.svelte";

  interface Props {
    students: Student[];
    onEdit: (student: Student) => void;
    onDelete: (student: Student) => void;
  }

  let { students, onEdit, onDelete }: Props = $props();
</script>

<ResponsiveTable items={students}>
  {#snippet header()}
    <th>{$t("layout.name")}</th>
    <th>{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(student)}
    <StudentRow {student} {onEdit} {onDelete} />
  {/snippet}
</ResponsiveTable>
