<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Faculty } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";

  interface Props {
    faculty: Faculty;
    onEdit: (faculty: Faculty) => void;
    onDelete: (faculty: Faculty) => void;
  }

  let { faculty, onEdit, onDelete }: Props = $props();
</script>

<td data-label={$t("layout.id")} data-test-id="faculty-id-{faculty.id}">{faculty.id}</td>
<td data-label={$t("layout.name")} data-test-id="faculty-name-{faculty.id}">{faculty.name}</td>
<td>
  <RowActions label={faculty.name} testId="row-actions-{faculty.id}">
    {#snippet primary()}
      <Button
        href="/faculties/{faculty.slug}/subjects"
        testId="view-subjects-btn-{faculty.id}"
        withHover
      >
        {$t("layout.view_subjects")}
      </Button>
    {/snippet}
    {#snippet overflow()}
      <Button onclick={() => onEdit(faculty)} testId="edit-btn-{faculty.id}" withHover>
        {$t("common.edit")}
      </Button>
    {/snippet}
    {#snippet destructive()}
      <Button onclick={() => onDelete(faculty)} testId="delete-btn-{faculty.id}" withHover>
        {$t("common.delete")}
      </Button>
    {/snippet}
  </RowActions>
</td>
