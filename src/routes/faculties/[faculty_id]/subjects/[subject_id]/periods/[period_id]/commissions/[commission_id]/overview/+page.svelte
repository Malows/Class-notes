<script lang="ts">
  import { page } from "$app/state";
  import Button from "$lib/components/common/Button.svelte";
  import OverviewGrid from "$lib/components/grids/overview/OverviewGrid.svelte";
  import OverviewLegend from "$lib/components/grids/overview/OverviewLegend.svelte";
  import { t } from "$lib/i18n/config";
  import { overviewService } from "$lib/services/overview.service";
  import type { OverviewData } from "$lib/types";
  import { onMount } from "svelte";

  let data = $state<OverviewData | null>(null);
  let loading = $state(true);

  const facultyId = Number(page.params.faculty_id);
  const subjectId = Number(page.params.subject_id);
  const periodId = Number(page.params.period_id);
  const commissionId = Number(page.params.commission_id);

  async function loadData() {
    try {
      data = await overviewService.get(commissionId);
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("commissions.commission_overview_title")} - {$t("layout.brand")}</title>
</svelte:head>

<h2>{$t("commissions.commission_overview_title")}</h2>
<Button
  href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/commissions"
  class="btn-small"
>
  {$t("layout.back_to_commissions")}
</Button>

{#if loading}
  <p>{$t("commissions.loading_info")}</p>
{:else if data}
  <div style="overflow-x: auto;">
    <OverviewGrid
      assignments={data.assignments}
      grid={data.grid}
      {facultyId}
      {subjectId}
      {periodId}
      {commissionId}
    />
  </div>
{/if}
<OverviewLegend />
