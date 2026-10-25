<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import { AttendanceStatus } from "$lib/common/types/attendance";

  import AttendanceGrid from "$lib/client/components/grids/attendance/AttendanceGrid.svelte";
  import type { AttendanceStore } from "$lib/client/stores/attendance.svelte";
  import type { CommissionsStore } from "$lib/client/stores/commissions.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  const attendanceStore = getContext<AttendanceStore>(StoreKey.ATTENDANCE);
  const commissionsStore = getContext<CommissionsStore>(StoreKey.COMMISSIONS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);
  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);

  let loading = $state(true);

  const facultySlug = page.params.faculty ?? "";
  const subjectSlug = page.params.subject ?? "";
  const commissionSlug = page.params.commission;
  const periodYear = Number(page.params.year);
  const periodSemester = Number(page.params.semester);

  const subjectID = $derived(subjectsStore.bySlug.get(subjectSlug)?.id);
  const period = $derived(
    periodsStore.items.find((p) => p.year === periodYear && p.semester === periodSemester),
  );
  const periodID = $derived(period?.id);
  const commissionID = $derived(
    subjectID !== undefined && periodID !== undefined && commissionSlug
      ? commissionsStore.findInScope(subjectID, periodID, commissionSlug)?.id
      : undefined,
  );

  const baseUrl = `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${periodYear}/${periodSemester}/commissions/${commissionSlug ?? ""}`;

  const takeHref = (assignmentId: number) =>
    commissionSlug ? `${baseUrl}/attendance/take?assignment_id=${assignmentId}` : null;

  async function loadData() {
    try {
      await Promise.all([facultiesStore.load(), subjectsStore.load()]);
      const sid = subjectsStore.bySlug.get(subjectSlug)?.id;
      if (sid) await periodsStore.load(sid);
      await commissionsStore.load();
      if (commissionID !== undefined) {
        await attendanceStore.loadCommission(commissionID);
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleCycle(
    assignmentId: number,
    enrollmentId: number,
    current: AttendanceStatus | null,
  ) {
    const next =
      current === null
        ? AttendanceStatus.PRESENT
        : current === AttendanceStatus.PRESENT
          ? AttendanceStatus.ABSENT
          : null;

    try {
      if (next === null) {
        await attendanceStore.unmark(assignmentId, enrollmentId);
      } else {
        await attendanceStore.mark(assignmentId, enrollmentId, next);
      }
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("attendance.commission_title")} - {$t("layout.brand")}</title>
</svelte:head>

<h2>{$t("attendance.commission_title")}</h2>
<p>
  <a href="{baseUrl}/overview" class="paper-btn btn-small">{$t("attendance.back_to_commission")}</a>
</p>

{#if loading}
  <p>{$t("attendance.loading")}</p>
{:else if commissionID === undefined}
  <p>{$t("commissions.not_found_message")}</p>
{:else if attendanceStore.grid}
  <AttendanceGrid
    grid={attendanceStore.grid}
    canEdit
    {takeHref}
    onCycleCell={handleCycle}
  />
{:else}
  <p>{$t("commissions.not_found_message")}</p>
{/if}
