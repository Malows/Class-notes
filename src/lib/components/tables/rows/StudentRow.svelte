<script lang="ts">
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "$lib/i18n/config";
  import type { Student } from "$lib/types";

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
      {$t("layout.edit")}
    </Button>
    <Button testId="delete-btn-{student.id}" onclick={() => onDelete(student)} withHover>
      {$t("layout.delete")}
    </Button>
  </div>
</td>
