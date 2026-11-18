<script lang="ts">
  import { onMount } from "svelte";

  import { APPROVAL_RATE_THRESHOLD } from "$lib/common/constants";
  import { t } from "$lib/common/i18n/config";

  import Card from "$lib/client/components/common/Card.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import StatItem from "$lib/client/components/common/StatItem.svelte";
  import { overviewService } from "$lib/client/services/overview.service";

  let stats = $state<any>(null);
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

<Card>
  <h2 class="card-title">{$t("dashboard.title")}</h2>

  {#if loading}
    <p>{$t("dashboard.loading")}</p>
  {:else if failed}
    <LoadError onRetry={load} />
  {:else if !stats}
    <p>{$t("dashboard.no_data")}</p>
  {:else}
    <div class="grid grid-cols-2 gap-4">
      <StatItem
        label={$t("dashboard.total_students")}
        value={stats.totalStudents}
        data-test-id="total-students-stat"
      />
      <StatItem
        label={$t("dashboard.subjects")}
        value={stats.totalSubjects}
        data-test-id="total-subjects-stat"
      />
      <StatItem
        label={$t("dashboard.approval_rate")}
        value={`${stats.approvalRate}%`}
        badge={stats.approvalRate > APPROVAL_RATE_THRESHOLD ? "success" : "warning"}
        data-test-id="approval-rate-stat"
      />
      <StatItem
        label={$t("dashboard.deliveries")}
        value={stats.totalDeliveries}
        data-test-id="total-deliveries-stat"
      />
    </div>
  {/if}
</Card>
