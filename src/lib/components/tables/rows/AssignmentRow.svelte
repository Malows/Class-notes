<script lang="ts">
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "$lib/i18n/config";
  import type { Assignment } from "$lib/types";

  interface Props {
    assignment: Assignment;
    onDelete: (assignment: Assignment) => void;
  }

  let { assignment, onDelete }: Props = $props();
</script>

<td data-test-id="assignment-title-{assignment.id}">{assignment.title}</td>
<td>
  <div class="row flex-right gap-2">
    <Button testId="delete-btn-{assignment.id}" withHover onclick={() => onDelete(assignment)}>
      {$t("layout.remove")}
    </Button>
  </div>
</td>
