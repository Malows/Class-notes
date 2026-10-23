<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { EnrollmentWithPerson } from "$lib/common/types/enrollment";

  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
  import StudentRow from "../rows/StudentRow.svelte";

  interface Props {
    enrollments: EnrollmentWithPerson[];
    onDelete: (enrollment: EnrollmentWithPerson) => void;
  }

  let { enrollments, onDelete }: Props = $props();
</script>

<ResponsiveTable items={enrollments}>
  {#snippet header()}
    <th>{$t("layout.name")}</th>
    <th>{$t("students.external_id_label")}</th>
    <th>{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(enrollment)}
    <StudentRow {enrollment} {onDelete} />
  {/snippet}
</ResponsiveTable>
