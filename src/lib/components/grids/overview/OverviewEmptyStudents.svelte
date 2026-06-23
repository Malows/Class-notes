<script lang="ts">
  import Button from "$lib/components/common/Button.svelte";
  import { t } from "$lib/i18n/config";

  interface Props {
    facultyId: number;
    subjectId: number;
    periodId: number;
    commissionId: number;
  }

  let { facultyId, subjectId, periodId, commissionId }: Props = $props();
</script>

<div class="card margin-top-lg" data-test-id="empty-students-card">
  <div class="card-body text-center">
    <h4 class="card-title">{$t("commissions.no_students_message")} 👤</h4>
    <div class="margin-top-md">
      {#if commissionId > 0}
        <Button
          href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/commissions/{commissionId}/students"
          class="btn-secondary"
          testId="empty-students-cta"
        >
          {$t("commissions.enroll_students_cta")}
        </Button>
      {:else}
        <Button
          href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/commissions"
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
</style>
