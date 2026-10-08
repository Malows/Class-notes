<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";

  interface Props {
    facultySlug: string;
    subjectSlug: string;
    periodYear: number;
    periodSemester: number;
    commissionSlug: string;
  }

  let { facultySlug, subjectSlug, periodYear, periodSemester, commissionSlug }: Props = $props();
</script>

<div class="card margin-top-lg" data-test-id="empty-students-card">
  <div class="card-body text-center">
    <h4 class="card-title">{$t("commissions.no_students_message")} 👤</h4>
    <div class="margin-top-md">
      {#if commissionSlug}
        <Button
          href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/commissions/{commissionSlug}/students"
          class="btn-secondary"
          testId="empty-students-cta"
        >
          {$t("commissions.enroll_students_cta")}
        </Button>
      {:else}
        <Button
          href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/commissions"
          class="btn-secondary"
          testId="empty-commissions-cta"
        >
          {$t("commissions.define_commissions_cta")}
        </Button>
      {/if}
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