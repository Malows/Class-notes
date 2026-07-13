<script lang="ts">
  import Button from "$lib/client/components/common/Button.svelte";
  import { t } from "$lib/common/i18n/config";
  import type { Student } from "$lib/common";

  interface Props {
    student: Student;
    onEdit: (student: Student) => void;
    onDelete: (student: Student) => void;
  }

  let { student, onEdit, onDelete }: Props = $props();
</script>

<td data-test-id="student-name-{student.id}">{student.name}</td>
<td>
  <div class="row flex-right gap-2">
    <Button testId="edit-btn-{student.id}" onclick={() => onEdit(student)} withHover>
      {$t("common.edit")}
    </Button>
    <Button testId="delete-btn-{student.id}" onclick={() => onDelete(student)} withHover>
      {$t("common.delete")}
    </Button>
  </div>
</td>
