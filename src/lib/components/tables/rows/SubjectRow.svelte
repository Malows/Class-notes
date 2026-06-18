<script lang="ts">
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "$lib/i18n/config";
  import type { Subject } from "$lib/types";

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
  <div class="row flex-right gap-2">
    <Button
      href="/faculties/{subject.faculty_id}/subjects/{subject.id}/periods"
      testId="view-periods-btn-{subject.id}"
      withHover
    >
      {$t("layout.view_periods")}
    </Button>
    <Button onclick={() => onEdit(subject)} testId="edit-btn-{subject.id}" withHover>
      {$t("common.edit")}
    </Button>
    <Button onclick={() => onDelete(subject)} testId="delete-btn-{subject.id}" withHover>
      {$t("common.delete")}
    </Button>
  </div>
</td>
