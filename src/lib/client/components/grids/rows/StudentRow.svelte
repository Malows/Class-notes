<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { EnrollmentWithPerson } from "$lib/common/types/enrollment";

  import Button from "$lib/client/components/common/Button.svelte";

  interface Props {
    enrollment: EnrollmentWithPerson;
    onDelete: (enrollment: EnrollmentWithPerson) => void;
  }

  let { enrollment, onDelete }: Props = $props();
</script>

<td data-test-id="student-name-{enrollment.id}">
  <a href="/persons/{enrollment.person_id}" data-test-id="student-person-link-{enrollment.id}"
    >{enrollment.name}</a
  >
</td>
<td data-test-id="student-legajo-{enrollment.id}">{enrollment.legajo ?? "—"}</td>
<td>
  <div class="row flex-right gap-2">
    <Button testId="delete-btn-{enrollment.id}" onclick={() => onDelete(enrollment)} withHover>
      {$t("common.delete")}
    </Button>
  </div>
</td>
