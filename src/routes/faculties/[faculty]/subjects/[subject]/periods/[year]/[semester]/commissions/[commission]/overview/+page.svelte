<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import type { OverviewData } from "$lib/common";

  import Button from "$lib/client/components/common/Button.svelte";
  import OverviewGrid from "$lib/client/components/grids/overview/OverviewGrid.svelte";
  import OverviewLegend from "$lib/client/components/grids/overview/OverviewLegend.svelte";
  import type { CommissionsStore } from "$lib/client/stores/commissions.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import { overviewService } from "$lib/client/services/overview.service";

  const commissionsStore = getContext<CommissionsStore>(StoreKey.COMMISSIONS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);
  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);

  const facultySlug = page.params.faculty ?? "";
  const subjectSlug = page.params.subject ?? "";
  const commissionSlug = page.params.commission;
  const periodYear = Number(page.params.year);
  const periodSemester = Number(page.params.semester);

  const subjectID = $derived(subjectsStore.bySlug.get(subjectSlug)?.id);
  const periodID = $derived(
    periodsStore.items.find((p) => p.year === periodYear && p.semester === periodSemester)?.id,
  );
  const commissionID = $derived(
    subjectID !== undefined && periodID !== undefined && commissionSlug
      ? commissionsStore.findInScope(subjectID, periodID, commissionSlug)?.id
      : undefined,
  );

  let data = $state<OverviewData | null>(null);
  let loading = $state(true);

  async function loadData() {
    try {
      await Promise.all([facultiesStore.load(), subjectsStore.load()]);
      const sid = subjectsStore.bySlug.get(subjectSlug)?.id;
      if (sid) await periodsStore.load(sid);
      await commissionsStore.load();
      if (commissionID !== undefined) {
        data = await overviewService.get(commissionID);
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
  <title>{$t("commissions.commission_overview_title")} - {$t("layout.brand")}</title>
</svelte:head>

<h2>{$t("commissions.commission_overview_title")}</h2>
<Button
  href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/commissions"
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
      {facultySlug}
      {subjectSlug}
      {periodYear}
      {periodSemester}
      commissionSlug={commissionSlug ?? ""}
    />
  </div>
{:else}
  <p>{$t("commissions.not_found_message")}</p>
{/if}
<OverviewLegend />