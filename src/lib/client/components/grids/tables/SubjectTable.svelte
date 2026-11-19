<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Subject } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import MobileCard from "$lib/client/components/common/MobileCard.svelte";
  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";
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
  {#snippet card(subject)}
    <MobileCard
      title={subject.name}
      meta={[{ label: $t("layout.faculty"), value: subject.faculty_name }]}
      testId="subject-card-{subject.id}"
    >
      {#snippet actions()}
        <RowActions label={subject.name} testId="subject-card-actions-{subject.id}">
          {#snippet primary()}
            <Button
              href="/faculties/{subject.faculty_slug}/subjects/{subject.slug}/periods"
              testId="mobile-view-periods-btn-{subject.id}"
              withHover
            >
              {$t("layout.view_periods")}
            </Button>
          {/snippet}
          {#snippet overflow()}
            <Button onclick={() => onEdit(subject)} testId="mobile-edit-btn-{subject.id}" withHover>
              {$t("common.edit")}
            </Button>
          {/snippet}
          {#snippet destructive()}
            <Button
              onclick={() => onDelete(subject)}
              testId="mobile-delete-btn-{subject.id}"
              withHover
            >
              {$t("common.delete")}
            </Button>
          {/snippet}
        </RowActions>
      {/snippet}
    </MobileCard>
  {/snippet}
</ResponsiveTable>
