<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  import type { Delivery, EnrollmentWithPerson, Assignment } from "$lib/common";
  import { StoreKey } from "$lib/common";
  import { t } from "$lib/common/i18n/config";

  import DeliveryForm from "$lib/client/components/DeliveryForm.svelte";
  import type { CommissionsStore } from "$lib/client/stores/commissions.svelte";
  import type { EnrollmentsStore } from "$lib/client/stores/enrollments.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import { assignmentService } from "$lib/client/services/assignment.service";
  import { correctionService } from "$lib/client/services/correction.service";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  const enrollmentsStore = getContext<EnrollmentsStore>(StoreKey.ENROLLMENTS);
  const commissionsStore = getContext<CommissionsStore>(StoreKey.COMMISSIONS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);
  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);

  let enrollments = $state<EnrollmentWithPerson[]>([]);
  let assignment = $state<Assignment | null>(null);
  let delivery = $state<Delivery | null>(null);
  let currentIndex = $state(0);
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
  const subjectPeriodID = $derived(period?.subject_period_id);
  const commissionID = $derived(
    subjectID !== undefined && periodID !== undefined && commissionSlug
      ? commissionsStore.findInScope(subjectID, periodID, commissionSlug)?.id
      : undefined,
  );

  const assignmentID = Number(page.url.searchParams.get("assignment_id"));
  const initialEnrollmentID = Number(page.url.searchParams.get("enrollment_id"));
  const mode = page.url.searchParams.get("mode") || "all";

  const baseUrl = `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${periodYear}/${periodSemester}/commissions/${commissionSlug ?? ""}`;

  async function loadData() {
    try {
      await Promise.all([facultiesStore.load(), subjectsStore.load()]);
      const sid = subjectsStore.bySlug.get(subjectSlug)?.id;
      if (sid) await periodsStore.load(sid);
      await commissionsStore.load();
      if (commissionID === undefined || subjectPeriodID === undefined) return;

      enrollments = await enrollmentsStore.load(commissionID).then(() => enrollmentsStore.items);

      if (initialEnrollmentID) {
        currentIndex = enrollments.findIndex((item) => item.id === initialEnrollmentID);
        if (currentIndex === -1) currentIndex = 0;
      }

      const allAssignments = await assignmentService.getAll(subjectPeriodID);
      assignment = allAssignments.find((a) => a.id === assignmentID) || null;

      await loadDelivery();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function loadDelivery() {
    if (assignmentID === 0) return;
    const enrollment = enrollments[currentIndex];
    if (!enrollment) return;
    delivery = await correctionService.getOne(assignmentID, enrollment.id);
  }

  async function saveDelivery(d: Delivery) {
    try {
      await correctionService.save(d);
      notificationsStore.addSuccess("Corrección guardada con éxito");
      if (mode === "single" || currentIndex === enrollments.length - 1) {
        goto(`${baseUrl}/overview`);
      } else {
        currentIndex++;
        await loadDelivery();
      }
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  function skip() {
    if (currentIndex < enrollments.length - 1) {
      currentIndex++;
      loadDelivery();
    } else {
      goto(`${baseUrl}/overview`);
    }
  }

  function prev() {
    if (currentIndex > 0) {
      currentIndex--;
      loadDelivery();
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("layout.correct")} - {$t("layout.brand")}</title>
</svelte:head>

<h2>{$t("layout.correct")} {assignment?.title || "TP"}</h2>
<p>
  {$t("layout.student")}: {enrollments[currentIndex]?.name || "..."} ({currentIndex + 1}
  {$t("common.of")}
  {enrollments.length})
</p>

{#if loading}
  <p>{$t("common.loading")}</p>
{:else if commissionID === undefined}
  <p>{$t("commissions.not_found_message")}</p>
{:else if delivery}
  <DeliveryForm
    {delivery}
    onSave={saveDelivery}
    onPrev={currentIndex > 0 ? prev : undefined}
    onSkip={skip}
  />
{/if}
