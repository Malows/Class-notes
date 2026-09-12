<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";

  interface Props {
    facultyId: number;
    subjectId: number;
    periodId: number;
  }

  let { facultyId, subjectId, periodId }: Props = $props();
</script>

<div class="card margin-top-lg" data-test-id="empty-assignments-card">
  <div class="card-body text-center">
    <h4 class="card-title">{$t("commissions.no_assignments_message")} ✏️</h4>
    <div class="margin-top-md">
      <Button
        href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/assignments"
        class="btn-secondary"
        testId="empty-assignments-cta"
      >
        {$t("commissions.define_assignments_cta")}
      </Button>
    </div>
  </div>
</div>

<style>
  .margin-top-lg {
    margin-top: 1.5rem;
  }
  .margin-top-md {
    margin-top: 1rem;
  }
  .text-center {
    text-align: center;
  }
  .card:hover {
    transform: none;
  }
</style>
