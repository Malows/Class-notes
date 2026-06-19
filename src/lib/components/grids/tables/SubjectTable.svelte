<script lang="ts">
  import ResponsiveTable from "$lib/components/common/ResponsiveTable.svelte";
  import { t } from "$lib/i18n/config";
  import type { Subject } from "$lib/types";

  import SubjectRow from "../rows/SubjectRow.svelte";

  interface Props {
    subjects: Subject[];
    onEdit: (subject: Subject) => void;
    onDelete: (subject: Subject) => void;
  }
  let { subjects, onEdit, onDelete }: Props = $props();
</script>

<ResponsiveTable items={subjects}>
  {#snippet header()}
    <th data-test-id="table-header-name">{$t("layout.name")}</th>
    <th data-test-id="table-header-faculty">{$t("layout.faculty")}</th>
    <th data-test-id="table-header-actions">{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(subject)}
    <SubjectRow {subject} {onEdit} {onDelete} />
  {/snippet}
</ResponsiveTable>
