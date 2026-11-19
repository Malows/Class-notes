<script lang="ts">
  import { onMount } from "svelte";

  import { t } from "$lib/common/i18n/config";
  import type { GlobalStats } from "$lib/common/types/dashboard";

  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import StatItem from "$lib/client/components/common/StatItem.svelte";
  import { overviewService } from "$lib/client/services/overview.service";

  let stats = $state<GlobalStats | null>(null);
  let loading = $state(true);
  let failed = $state(false);

  async function load() {
    loading = true;
    failed = false;
    try {
      stats = await overviewService.getGlobalStats();
    } catch (e) {
      console.error(e);
      failed = true;
    } finally {
      loading = false;
    }
  }

  onMount(load);
</script>

<section
  class="border-t border-base-300 pt-4"
  aria-labelledby="stats-title"
  data-test-id="dashboard-stats"
>
  <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
    <h2 id="stats-title" class="m-0 font-serif text-headline-sm">
      {$t("dashboard.stats_title")}
    </h2>
    <p class="m-0 text-body-sm text-on-surface-variant">{$t("dashboard.stats_scope")}</p>
  </div>

  {#if loading}
    <p class="m-0 mt-3 text-body-md text-on-surface-variant" role="status">
      {$t("dashboard.stats_loading")}
    </p>
  {:else if failed}
    <div class="mt-3">
      <LoadError onRetry={load} />
    </div>
  {:else if !stats}
    <p class="m-0 mt-3 text-body-md text-on-surface-variant">
      {$t("dashboard.stats_no_data")}
    </p>
  {:else}
    <div class="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 md:grid-cols-4">
      <StatItem
        label={$t("dashboard.stats_enrollments")}
        value={stats.totalStudents}
        data-test-id="stats-enrollments"
      />
      <StatItem
        label={$t("dashboard.stats_subjects")}
        value={stats.totalSubjects}
        data-test-id="stats-subjects"
      />
      <StatItem
        label={$t("dashboard.stats_approval_rate")}
        value={`${stats.approvalRate}%`}
        data-test-id="stats-approval-rate"
      />
      <StatItem
        label={$t("dashboard.stats_deliveries")}
        value={stats.totalDeliveries}
        data-test-id="stats-deliveries"
      />
    </div>
  {/if}
</section>
