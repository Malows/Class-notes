<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import type { OverviewData } from "$lib/common";
  import type { AttendanceGrid } from "$lib/common/types/attendance";

  import Button from "$lib/client/components/common/Button.svelte";
  import CommissionSummary from "$lib/client/components/grids/summary/CommissionSummary.svelte";
  import OverviewGrid from "$lib/client/components/grids/overview/OverviewGrid.svelte";
  import OverviewLegend from "$lib/client/components/grids/overview/OverviewLegend.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import PageHeader from "$lib/client/components/layout/PageHeader.svelte";
  import type { AttendanceStore } from "$lib/client/stores/attendance.svelte";
  import type { CommissionsStore } from "$lib/client/stores/commissions.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import { overviewService } from "$lib/client/services/overview.service";

  const attendanceStore = getContext<AttendanceStore>(StoreKey.ATTENDANCE);
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
  let failed = $state(false);

  // Attendance is an independent, secondary read: the grade aggregates must
  // survive its failure and arrive before it does.
  let attendanceGrid = $state<AttendanceGrid | null>(null);
  let attendanceLoading = $state(true);
  let attendanceFailed = $state(false);
  let attendanceRequest = 0;

  const baseUrl = `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${periodYear}/${periodSemester}/commissions/${commissionSlug ?? ""}`;
  const assignmentsHref = `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${periodYear}/${periodSemester}/assignments`;

  async function loadAttendance() {
    const commissionId = commissionID;
    const request = ++attendanceRequest;

    if (commissionId === undefined) {
      attendanceGrid = null;
      attendanceLoading = false;
      attendanceFailed = false;
      return;
    }

    attendanceLoading = true;
    attendanceFailed = false;
    attendanceGrid = null;

    try {
      await attendanceStore.loadCommission(commissionId);
      if (request !== attendanceRequest) return;
      attendanceGrid = attendanceStore.grid;
    } catch (e) {
      console.error(e);
      if (request !== attendanceRequest) return;
      attendanceGrid = null;
      attendanceFailed = true;
    } finally {
      if (request === attendanceRequest) attendanceLoading = false;
    }
  }

  async function loadData() {
    loading = true;
    failed = false;
    try {
      await Promise.all([facultiesStore.load(), subjectsStore.load()]);
      const sid = subjectsStore.bySlug.get(subjectSlug)?.id;
      if (sid) await periodsStore.load(sid);
      await commissionsStore.load();
      if (commissionID !== undefined) {
        data = await overviewService.get(commissionID);
        // Fire after the overview resolves so grades paint first.
        void loadAttendance();
      }
    } catch (e) {
      console.error(e);
      failed = true;
    } finally {
      loading = false;
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("commissions.commission_overview_title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageHeader title={$t("commissions.commission_overview_title")}>
  {#snippet secondary()}
    <Button
      href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/commissions"
      class="btn-small"
    >
      {$t("layout.back_to_commissions")}
    </Button>
  {/snippet}
</PageHeader>

{#if loading}
  <p>{$t("commissions.loading_info")}</p>
{:else if failed}
  <LoadError onRetry={loadData} />
{:else if data}
  <div class="min-w-0">
    <div class="mb-6">
      <CommissionSummary
        assignments={data.assignments}
        grid={data.grid}
        {attendanceGrid}
        {attendanceLoading}
        {attendanceFailed}
        onRetryAttendance={loadAttendance}
        commissionBaseHref={baseUrl}
        {assignmentsHref}
      />
    </div>
    <OverviewGrid
      assignments={data.assignments}
      grid={data.grid}
      {facultySlug}
      {subjectSlug}
      {periodYear}
      {periodSemester}
      commissionSlug={commissionSlug ?? ""}
      commissions={commissionsStore.items}
    />
  </div>
{:else}
  <p>{$t("commissions.not_found_message")}</p>
{/if}
<OverviewLegend />