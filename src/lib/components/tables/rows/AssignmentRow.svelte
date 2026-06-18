<script lang="ts">
  import { t } from "$lib/i18n/config";
  import type { Assignment } from "$lib/types";

  import Button from "$lib/components/common/Button.svelte";

  interface Props {
    assignment: Assignment;
    onEdit: (assignment: Assignment) => void;
    onDelete: (assignment: Assignment) => void;
  }

  let { assignment, onEdit, onDelete }: Props = $props();
</script>

<td data-test-id="assignment-title-{assignment.id}">{assignment.title}</td>
<td>
  <div class="row flex-right gap-2">
    <Button testId="edit-btn-{assignment.id}" onclick={() => onEdit(assignment)} withHover>
      {$t("layout.edit")}
    </Button>
    <Button testId="delete-btn-{assignment.id}" onclick={() => onDelete(assignment)} withHover>
      {$t("layout.remove")}
    </Button>
  </div>
</td>
