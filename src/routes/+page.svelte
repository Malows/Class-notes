<script lang="ts">
  import { getContext, onMount } from "svelte";

  import { StoreKey } from "$lib/common";
  import { t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";
  import EmptyState from "$lib/client/components/common/EmptyState.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import DashboardPending from "$lib/client/components/DashboardPending.svelte";
  import DashboardStats from "$lib/client/components/DashboardStats.svelte";
  import ContinueShortcut from "$lib/client/components/dashboard/ContinueShortcut.svelte";
  import PeriodPicker from "$lib/client/components/dashboard/PeriodPicker.svelte";
  import TodayCommissions from "$lib/client/components/dashboard/TodayCommissions.svelte";
  import {
    buildPeriodOptions,
    countPendingByCommission,
    pickDefaultPeriodKey,
    type CommissionRow,
    type PendingRow,
    type PeriodOption,
  } from "$lib/client/components/dashboard/dashboard-model";
  import {
    forgetLastVisit,
    readLastVisit,
    startVisitTracking,
    type AcademicRoute,
    type AcademicVisit,
  } from "$lib/client/components/dashboard/dashboard-storage";
  import CommonPage from "$lib/client/components/layout/CommonPage.svelte";
  import { overviewService } from "$lib/client/services/overview.service";
  import type { CommissionsStore } from "$lib/client/stores/commissions.svelte";
  import { metadataStore } from "$lib/client/stores/metadata.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";

  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);
  const commissionsStore = getContext<CommissionsStore>(StoreKey.COMMISSIONS);

  const ROUTE_LABEL_KEYS: Record<AcademicRoute, string> = {
    overview: "dashboard.last_visit_route_overview",
    attendance: "dashboard.last_visit_route_attendance",
    students: "dashboard.last_visit_route_students",
    correct: "dashboard.last_visit_route_correct",
    cursada: "dashboard.last_visit_route_cursada",
  };

  let loading = $state(true);
  let failed = $state(false);
  let selectedKey = $state("");
  let pendingCounts = $state<Record<number, number>>({});
  let pendingLoading = $state(false);
  let pendingFailed = $state(false);
  let pendingToken = 0;
  let lastVisit = $state<AcademicVisit | null>(null);

  const activeKey = $derived.by(() => {
    const period = metadataStore.context?.periodData;
    if (!period) {
      return null;
    }
    const semester = period.term === "Cuatrimestre II" ? 2 : 1;
    return `${period.year}-${semester}`;
  });

  const periodOptions = $derived(
    buildPeriodOptions(periodsStore.items, commissionsStore.items, activeKey),
  );

  const selectedPeriod = $derived(
    periodOptions.find((option) => option.key === selectedKey) ?? null,
  );

  function periodLabel(option: Pick<PeriodOption, "year" | "semester">): string {
    return $t("dashboard.period_option", {
      year: option.year,
      semester: option.semester,
    } as never);
  }

  const selectedPeriodLabel = $derived(selectedPeriod ? periodLabel(selectedPeriod) : "");

  const todayCommissions = $derived.by<CommissionRow[]>(() => {
    const period = selectedPeriod;
    if (!period) {
      return [];
    }

    return commissionsStore.items
      .filter((commission) => commission.period_id === period.id)
      .flatMap((commission) => {
        const subject = subjectsStore.map.get(commission.subject_id);
        if (!subject) {
          return [];
        }

        const base = `/faculties/${subject.faculty_slug}/subjects/${subject.slug}/periods/${period.year}/${period.semester}/commissions/${commission.slug}`;
        return [
          {
            id: commission.id,
            subjectId: subject.id,
            subjectName: subject.name,
            commissionName: commission.name,
            studentCount: commission.student_count,
            pendingCount: pendingCounts[commission.id] ?? 0,
            attendanceHref: `${base}/attendance`,
            overviewHref: `${base}/overview`,
          },
        ];
      })
      .sort(
        (a, b) =>
          a.subjectName.localeCompare(b.subjectName) ||
          a.commissionName.localeCompare(b.commissionName),
      );
  });

  const pendingRows = $derived.by<PendingRow[]>(() =>
    todayCommissions
      .filter((commission) => commission.pendingCount > 0)
      .map((commission) => ({
        id: commission.id,
        subjectName: commission.subjectName,
        commissionName: commission.commissionName,
        pendingCount: commission.pendingCount,
        href: commission.overviewHref,
      }))
      .sort(
        (a, b) =>
          b.pendingCount - a.pendingCount || a.subjectName.localeCompare(b.subjectName),
      ),
  );

  const resolvedVisit = $derived.by(() => {
    const visit = lastVisit;
    if (!visit) {
      return null;
    }

    const subject = subjectsStore.bySlug.get(visit.subjectSlug);
    if (!subject || subject.faculty_slug !== visit.facultySlug) {
      return null;
    }

    const period = periodsStore.items.find(
      (candidate) => candidate.year === visit.year && candidate.semester === visit.semester,
    );
    if (!period) {
      return null;
    }

    if (visit.commissionSlug) {
      const commission = commissionsStore.findInScope(
        subject.id,
        period.id,
        visit.commissionSlug,
      );
      if (!commission) {
        return null;
      }
      return { visit, subject, period, commission };
    }

    return { visit, subject, period, commission: undefined };
  });

  async function loadCore() {
    loading = true;
    failed = false;
    pendingCounts = {};
    pendingFailed = false;

    try {
      await Promise.all([periodsStore.load(), subjectsStore.load(), commissionsStore.load()]);
      selectedKey = pickDefaultPeriodKey(periodOptions) ?? "";
    } catch (e) {
      console.error(e);
      failed = true;
    } finally {
      loading = false;
    }

    if (!failed) {
      void loadPending();
    }
  }

  async function loadPending() {
    const period = selectedPeriod;
    const commissions = todayCommissions;
    const subjectIds = [...new Set(commissions.map((commission) => commission.subjectId))];

    if (!period || subjectIds.length === 0) {
      pendingCounts = {};
      pendingLoading = false;
      pendingFailed = false;
      return;
    }

    const token = ++pendingToken;
    pendingLoading = true;
    pendingFailed = false;

    try {
      const overviews = await Promise.all(
        subjectIds.map((subjectId) => overviewService.getForPeriod(subjectId, period.id)),
      );
      if (token !== pendingToken) {
        return;
      }
      pendingCounts = countPendingByCommission(
        overviews,
        new Set(commissions.map((commission) => commission.id)),
      );
    } catch (e) {
      if (token !== pendingToken) {
        return;
      }
      console.error(e);
      pendingFailed = true;
      pendingCounts = {};
    } finally {
      if (token === pendingToken) {
        pendingLoading = false;
      }
    }
  }

  async function selectPeriod(key: string) {
    if (key === selectedKey) {
      return;
    }
    selectedKey = key;
    pendingCounts = {};
    await loadPending();
  }

  function forgetVisit() {
    forgetLastVisit();
    lastVisit = null;
  }

  onMount(() => {
    lastVisit = readLastVisit();
    startVisitTracking();
    void loadCore();
  });

  // A stored route that no longer resolves is not offered. Clearing it is safe
  // only once the stores finished loading, so a failed or slow load keeps it.
  $effect(() => {
    if (loading || failed || !lastVisit) {
      return;
    }
    if (!resolvedVisit) {
      forgetVisit();
    }
  });
</script>

<CommonPage title={$t("dashboard.page_title")} lead={$t("dashboard.lead")}>
  {#if loading}
    <div class="flex flex-col gap-6" aria-busy="true" data-test-id="dashboard-loading">
      <span class="sr-only">{$t("dashboard.loading")}</span>
      <div class="h-9 w-56 rounded-[var(--radius-field)] bg-surface-container-high"></div>
      <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div class="xl:col-span-8">
          <div
            class="overflow-hidden rounded-[var(--radius-box)] border border-base-300 bg-base-100"
          >
            <div class="h-16 border-b border-base-300 bg-surface-container-low"></div>
            <div class="h-16 bg-surface-container-low"></div>
          </div>
        </div>
        <div class="xl:col-span-4">
          <div
            class="overflow-hidden rounded-[var(--radius-box)] border border-base-300 bg-base-100"
          >
            <div class="h-14 border-b border-base-300 bg-surface-container-low"></div>
            <div class="h-14 bg-surface-container-low"></div>
          </div>
        </div>
      </div>
    </div>
  {:else if failed}
    <LoadError onRetry={loadCore} />
  {:else if periodOptions.length === 0}
    <EmptyState
      title={$t("dashboard.no_periods_title")}
      description={$t("dashboard.no_periods_description")}
      testId="dashboard-no-periods"
    >
      {#snippet actions()}
        <Button href="/periods" class="btn-outline" testId="dashboard-manage-periods">
          {$t("dashboard.no_periods_action")}
        </Button>
      {/snippet}
    </EmptyState>
  {:else}
    <PeriodPicker options={periodOptions} {selectedKey} onSelect={(key) => void selectPeriod(key)} />

    <div class="grid grid-cols-1 items-start gap-6 xl:grid-cols-12">
      <div class="min-w-0 xl:col-span-8">
        <TodayCommissions commissions={todayCommissions} periodLabel={selectedPeriodLabel} />
      </div>

      <div class="flex min-w-0 flex-col gap-6 xl:col-span-4">
        {#if resolvedVisit}
          <ContinueShortcut
            href={resolvedVisit.visit.href}
            subjectName={resolvedVisit.subject.name}
            commissionName={resolvedVisit.commission?.name}
            periodLabel={periodLabel(resolvedVisit.period)}
            routeLabel={$t(ROUTE_LABEL_KEYS[resolvedVisit.visit.route])}
            onForget={forgetVisit}
          />
        {/if}

        <DashboardPending
          rows={pendingRows}
          periodLabel={selectedPeriodLabel}
          loading={pendingLoading}
          failed={pendingFailed}
          onRetry={() => void loadPending()}
        />
      </div>
    </div>

    <DashboardStats />
  {/if}
</CommonPage>
