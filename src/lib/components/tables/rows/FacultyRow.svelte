<script lang="ts">
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "$lib/i18n/config";
  import type { Faculty } from "$lib/types";

  interface Props {
    faculty: Faculty;
    onEdit: (faculty: Faculty) => void;
    onDelete: (faculty: Faculty) => void;
  }

  let { faculty, onEdit, onDelete }: Props = $props();
</script>

<td data-test-id="faculty-id-{faculty.id}">{faculty.id}</td>
<td data-test-id="faculty-name-{faculty.id}">{faculty.name}</td>
<td>
  <div class="row flex-right gap-2">
    <Button
      href="/faculties/{faculty.id}/subjects"
      testId="view-subjects-btn-{faculty.id}"
      withHover
    >
      {$t("layout.view_subjects")}
    </Button>
    <Button onclick={() => onEdit(faculty)} testId="edit-btn-{faculty.id}" withHover>
      {$t("layout.edit")}
    </Button>
    <Button onclick={() => onDelete(faculty)} testId="delete-btn-{faculty.id}" withHover>
      {$t("layout.delete")}
    </Button>
  </div>
</td>
