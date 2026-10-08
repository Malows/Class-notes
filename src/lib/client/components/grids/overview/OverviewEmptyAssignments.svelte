<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";

  interface Props {
    facultySlug: string;
    subjectSlug: string;
    periodYear: number;
    periodSemester: number;
  }

  let { facultySlug, subjectSlug, periodYear, periodSemester }: Props = $props();
</script>

<div class="card margin-top-lg" data-test-id="empty-assignments-card">
  <div class="card-body text-center">
    <h4 class="card-title">{$t("commissions.no_assignments_message")} ✏️</h4>
    <div class="margin-top-md">
      <Button
        href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/assignments"
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