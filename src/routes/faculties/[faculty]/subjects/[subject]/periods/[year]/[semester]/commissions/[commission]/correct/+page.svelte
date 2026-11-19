<script lang="ts">
  import { getContext, untrack } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  import type { Delivery, EnrollmentWithPerson, Assignment } from "$lib/common";
  import { StoreKey } from "$lib/common";
  import { t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";
  import DeliveryForm from "$lib/client/components/DeliveryForm.svelte";
  import GradeSheet from "$lib/client/components/grading/GradeSheet.svelte";
  import EmptyState from "$lib/client/components/common/EmptyState.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import PageHeader from "$lib/client/components/layout/PageHeader.svelte";
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
  // The detailed form works on one delivery; the sheet works on the whole set.
  let delivery = $state<Delivery | null>(null);
  let deliveries = $state<Delivery[]>([]);
  let currentIndex = $state(0);
  let loading = $state(true);
  let failed = $state(false);

  const facultySlug = $derived(page.params.faculty ?? "");
  const subjectSlug = $derived(page.params.subject ?? "");
  const commissionSlug = $derived(page.params.commission);
  const periodYear = $derived(Number(page.params.year));
  const periodSemester = $derived(Number(page.params.semester));

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

  // A missing or malformed assignment_id must not silently render nothing:
  // `Number(null)` is 0 and `Number("abc")` is NaN, neither of which matches a TP.
  const assignmentIDParam = $derived(page.url.searchParams.get("assignment_id"));
  const assignmentID = $derived(assignmentIDParam === null ? Number.NaN : Number(assignmentIDParam));
  const hasAssignmentContext = $derived(Number.isInteger(assignmentID) && assignmentID > 0);

  const enrollmentIDParam = $derived(page.url.searchParams.get("enrollment_id"));
  const initialEnrollmentID = $derived(
    enrollmentIDParam === null ? Number.NaN : Number(enrollmentIDParam),
  );
  const mode = $derived(page.url.searchParams.get("mode") || "all");

  // A row link (or `mode=single`) opens the detailed form for one student.
  // The assignment header opens the commission-level grading sheet.
  const hasEnrollmentContext = $derived(
    Number.isInteger(initialEnrollmentID) && initialEnrollmentID > 0,
  );
  const singleMode = $derived(hasEnrollmentContext || mode === "single");

  const baseUrl = $derived(
    `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${periodYear}/${periodSemester}/commissions/${commissionSlug ?? ""}`,
  );
  const sheetHref = $derived(`${baseUrl}/correct?assignment_id=${assignmentID}`);
  const singleHref = (enrollmentId: number) =>
    `${baseUrl}/correct?assignment_id=${assignmentID}&enrollment_id=${enrollmentId}&mode=single`;

  const currentEnrollment = $derived(enrollments[currentIndex]);
  const canSkip = $derived(currentIndex < enrollments.length - 1);
  const canGoNext = $derived(currentIndex < enrollments.length - 1);

  async function loadData() {
    loading = true;
    failed = false;
    delivery = null;
    deliveries = [];
    currentIndex = 0;
    try {
      await Promise.all([facultiesStore.load(), subjectsStore.load()]);
      const sid = subjectsStore.bySlug.get(subjectSlug)?.id;
      if (sid) await periodsStore.load(sid);
      await commissionsStore.load();
      if (commissionID === undefined || subjectPeriodID === undefined) return;

      enrollments = await enrollmentsStore.load(commissionID).then(() => enrollmentsStore.items);

      if (hasEnrollmentContext) {
        const index = enrollments.findIndex((item) => item.id === initialEnrollmentID);
        if (index !== -1) currentIndex = index;
      }

      if (!hasAssignmentContext) {
        assignment = null;
        delivery = null;
        deliveries = [];
        return;
      }

      const allAssignments = await assignmentService.getAll(subjectPeriodID);
      assignment = allAssignments.find((a) => a.id === assignmentID) || null;
      if (!assignment) {
        delivery = null;
        deliveries = [];
        return;
      }

      if (singleMode) {
        await loadDelivery();
      } else {
        const byCommission = await correctionService.get(commissionID);
        deliveries = byCommission.filter((item) => item.assignment_id === assignmentID);
      }
    } catch (e) {
      console.error(e);
      failed = true;
    } finally {
      loading = false;
    }
  }

  async function loadDelivery() {
    if (!hasAssignmentContext) {
      delivery = null;
      return;
    }
    const enrollment = enrollments[currentIndex];
    if (!enrollment) {
      delivery = null;
      return;
    }
    delivery = (await correctionService.getOne(assignmentID, enrollment.id)) ?? null;
  }

  async function saveDelivery(d: Delivery) {
    try {
      await correctionService.save(d);
      notificationsStore.addSuccess($t("common.correction_saved"));
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

  async function saveSheetRow(d: Delivery) {
    await correctionService.save(d);
  }

  function next() {
    if (currentIndex < enrollments.length - 1) {
      currentIndex++;
      loadDelivery();
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

  // The sheet and the detailed form live on the same route: a link that
  // changes only the query string must reload this view instead of keeping
  // the previous one on screen.
  let loadedSearch: string | null = null;
  $effect(() => {
    const search = page.url.search;
    untrack(() => {
      if (search === loadedSearch) return;
      loadedSearch = search;
      void loadData();
    });
  });
</script>

<svelte:head>
  <title>
    {assignment ? `${$t("layout.correct")} ${assignment.title}` : $t("layout.correct")} - {$t(
      "layout.brand",
    )}
  </title>
</svelte:head>

<PageHeader
  title={assignment ? `${$t("layout.correct")} ${assignment.title}` : $t("layout.correct")}
>
  {#snippet secondary()}
    <Button href={`${baseUrl}/overview`} class="btn-ghost" testId="correction-back-btn">
      {$t("assignments.back_to_overview")}
    </Button>
    {#if !loading && assignment && singleMode}
      <Button href={sheetHref} class="btn-ghost" testId="correction-sheet-link">
        {$t("assignments.grading.sheet_link")}
      </Button>
    {/if}
  {/snippet}
</PageHeader>

{#if !loading && currentEnrollment && singleMode}
  <p class="mt-4 text-body-md text-on-surface-variant">
    {$t("layout.student")}: {currentEnrollment.name || "..."} ({currentIndex + 1}
    {$t("common.of")}
    {enrollments.length})
  </p>
{/if}

{#if loading}
  <p>{$t("common.loading")}</p>
{:else if failed}
  <LoadError onRetry={loadData} />
{:else if commissionID === undefined}
  <p>{$t("commissions.not_found_message")}</p>
{:else if !hasAssignmentContext || !assignment}
  <EmptyState
    icon="📝"
    title={$t("assignments.correction_assignment_missing_title")}
    description={$t("assignments.correction_assignment_missing_message")}
    testId="correction-assignment-missing"
  >
    {#snippet actions()}
      <Button href={`${baseUrl}/overview`} class="btn-ghost" testId="correction-empty-back-btn">
        {$t("assignments.back_to_overview")}
      </Button>
    {/snippet}
  </EmptyState>
{:else if enrollments.length === 0}
  <EmptyState
    icon="👥"
    title={$t("assignments.correction_no_students_title")}
    description={$t("assignments.correction_no_students_message")}
    testId="correction-no-students"
  >
    {#snippet actions()}
      <Button href={`${baseUrl}/students`} class="btn-primary" testId="correction-students-btn">
        {$t("assignments.back_to_students")}
      </Button>
      <Button href={`${baseUrl}/overview`} class="btn-ghost" testId="correction-empty-back-btn">
        {$t("assignments.back_to_overview")}
      </Button>
    {/snippet}
  </EmptyState>
{:else if !singleMode}
  <div class="mt-6">
    <GradeSheet
      {assignment}
      {enrollments}
      {deliveries}
      onSave={saveSheetRow}
      detailHref={singleHref}
    />
  </div>
{:else if !delivery}
  <EmptyState
    icon="📄"
    title={$t("assignments.correction_delivery_missing_title")}
    description={$t("assignments.correction_delivery_missing_message")}
    testId="correction-delivery-missing"
  >
    {#snippet actions()}
      {#if canSkip}
        <Button class="btn-primary" onclick={skip} testId="correction-skip-btn">
          {$t("assignments.skip")}
        </Button>
      {/if}
      <Button href={`${baseUrl}/overview`} class="btn-ghost" testId="correction-empty-back-btn">
        {$t("assignments.back_to_overview")}
      </Button>
    {/snippet}
  </EmptyState>
{:else}
  <div class="mt-6">
    <DeliveryForm
      {delivery}
      onSave={saveDelivery}
      onPrev={currentIndex > 0 ? prev : undefined}
      onNext={canGoNext ? next : undefined}
      onSkip={skip}
    />
  </div>
{/if}
