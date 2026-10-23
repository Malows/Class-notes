<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import type { OverviewData } from "$lib/common";

  import Button from "$lib/client/components/common/Button.svelte";
  import OverviewGrid from "$lib/client/components/grids/overview/OverviewGrid.svelte";
  import OverviewLegend from "$lib/client/components/grids/overview/OverviewLegend.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import { overviewService } from "$lib/client/services/overview.service";

  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);

  const facultySlug = page.params.faculty ?? "";
  const subjectSlug = page.params.subject ?? "";
  const periodYear = Number(page.params.year);
  const periodSemester = Number(page.params.semester);

  let data = $state<OverviewData | null>(null);
  let loading = $state(true);

  async function loadData() {
    try {
      await Promise.all([facultiesStore.load(), subjectsStore.load()]);
      const sid = subjectsStore.bySlug.get(subjectSlug)?.id;
      if (sid) {
        await periodsStore.load(sid);
      }
      const pid = periodsStore.items.find(
        (p) => p.year === periodYear && p.semester === periodSemester,
      )?.id;
      if (pid && sid) {
        data = await overviewService.getForPeriod(sid, pid);
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("periods.period_overview_title")} - {$t("layout.brand")}</title>
</svelte:head>

<h2>{$t("periods.period_overview_title")}</h2>
<Button
  href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods"
  class="btn-small"
  testId="back-to-periods-btn"
>
  {$t("layout.back_to_periods")}
</Button>

{#if loading}
  <p>{$t("commissions.loading_info")}</p>
{:else if data}
  <div style="overflow-x: auto; margin-top: 1rem;">
    <OverviewGrid
      assignments={data.assignments}
      grid={data.grid}
      {facultySlug}
      {subjectSlug}
      periodYear={periodYear}
      periodSemester={periodSemester}
      commissionSlug=""
    />
  </div>
{:else}
  <p>{$t("periods.period_not_found")}</p>
{/if}
<OverviewLegend />