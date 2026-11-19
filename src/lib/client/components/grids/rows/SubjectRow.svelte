<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Subject } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";

  interface Props {
    subject: Subject;
    onEdit: (subject: Subject) => void;
    onDelete: (subject: Subject) => void;
  }

  let { subject, onEdit, onDelete }: Props = $props();
</script>

<td data-test-id="subject-name-{subject.id}">{subject.name}</td>
<td data-test-id="subject-faculty-name-{subject.id}">{subject.faculty_name}</td>
<td>
  <RowActions label={subject.name} testId="row-actions-{subject.id}">
    {#snippet primary()}
      <Button
        href="/faculties/{subject.faculty_slug}/subjects/{subject.slug}/periods"
        testId="view-periods-btn-{subject.id}"
        withHover
      >
        {$t("layout.view_periods")}
      </Button>
    {/snippet}
    {#snippet overflow()}
      <Button onclick={() => onEdit(subject)} testId="edit-btn-{subject.id}" withHover>
        {$t("common.edit")}
      </Button>
    {/snippet}
    {#snippet destructive()}
      <Button onclick={() => onDelete(subject)} testId="delete-btn-{subject.id}" withHover>
        {$t("common.delete")}
      </Button>
    {/snippet}
  </RowActions>
</td>
