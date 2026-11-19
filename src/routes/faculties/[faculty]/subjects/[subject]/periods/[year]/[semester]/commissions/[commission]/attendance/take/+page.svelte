<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import { AttendanceStatus } from "$lib/common/types/attendance";

  import TakeAttendanceCard from "$lib/client/components/attendance/TakeAttendanceCard.svelte";
  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import PageHeader from "$lib/client/components/layout/PageHeader.svelte";
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
  let currentIndex = $state(0);
  let done = $state(false);

  interface SingleUndoEntry {
    kind: "single";
    enrollmentId: number;
    previous: AttendanceStatus | null;
    wrote: boolean;
  }

  interface BulkUndoEntry {
    kind: "bulk";
    entries: Array<{ enrollmentId: number; previous: AttendanceStatus | null }>;
  }

  type UndoEntry = SingleUndoEntry | BulkUndoEntry;

  let undoStack = $state<UndoEntry[]>([]);
  let confirmingBulk = $state(false);

  const facultySlug = page.params.faculty ?? "";
  const subjectSlug = page.params.subject ?? "";
  const commissionSlug = page.params.commission;
  const periodYear = Number(page.params.year);
  const periodSemester = Number(page.params.semester);
  const assignmentId = Number(page.url.searchParams.get("assignment_id"));

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

  const rows = $derived(attendanceStore.grid?.rows ?? []);
  const currentRow = $derived(rows[currentIndex] ?? null);
  const currentStatus = $derived(
    currentRow?.cells.find((cell) => cell.assignment_id === assignmentId)?.status ?? null,
  );
  const assignmentTitle = $derived(
    attendanceStore.grid?.assignments.find((item) => item.id === assignmentId)?.title ?? "",
  );

  const totals = $derived.by(() => {
    let present = 0;
    let absent = 0;
    let unmarked = 0;

    for (const row of rows) {
      const status = row.cells.find((cell) => cell.assignment_id === assignmentId)?.status ?? null;
      if (status === AttendanceStatus.PRESENT) present += 1;
      else if (status === AttendanceStatus.ABSENT) absent += 1;
      else unmarked += 1;
    }

    return { present, absent, unmarked };
  });

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

  function advance() {
    if (currentIndex >= rows.length - 1) {
      done = true;
    } else {
      currentIndex += 1;
    }
  }

  async function decide(decision: "present" | "absent" | "skip") {
    const row = currentRow;
    if (!row || commissionID === undefined || done) return;

    const previous =
      row.cells.find((cell) => cell.assignment_id === assignmentId)?.status ?? null;

    try {
      if (decision === "skip") {
        undoStack = [
          ...undoStack,
          { kind: "single", enrollmentId: row.enrollment_id, previous, wrote: false },
        ];
      } else {
        const status = decision === "present" ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT;
        await attendanceStore.mark(assignmentId, row.enrollment_id, status);
        undoStack = [
          ...undoStack,
          { kind: "single", enrollmentId: row.enrollment_id, previous, wrote: true },
        ];
      }
      advance();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  async function restore(enrollmentId: number, previous: AttendanceStatus | null) {
    if (previous === null) {
      await attendanceStore.unmark(assignmentId, enrollmentId);
    } else {
      await attendanceStore.mark(assignmentId, enrollmentId, previous);
    }
  }

  async function undo() {
    const last = undoStack.at(-1);
    if (!last || commissionID === undefined) return;

    try {
      if (last.kind === "bulk") {
        for (const entry of last.entries) {
          await restore(entry.enrollmentId, entry.previous);
        }
      } else if (last.wrote) {
        await restore(last.enrollmentId, last.previous);
      }

      undoStack = undoStack.slice(0, -1);
      done = false;

      const targetId = last.kind === "bulk" ? last.entries[0]?.enrollmentId : last.enrollmentId;
      const index = targetId === undefined
        ? -1
        : rows.findIndex((row) => row.enrollment_id === targetId);
      if (index >= 0) {
        currentIndex = index;
      }
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  async function markAllPresent() {
    // Snapshot every previous state before the server write so one undo can put
    // the whole column back exactly as it was.
    const snapshot = rows.map((row) => ({
      enrollmentId: row.enrollment_id,
      previous: row.cells.find((cell) => cell.assignment_id === assignmentId)?.status ?? null,
    }));

    try {
      await attendanceStore.bulkMarkPresent(assignmentId);
      undoStack = [...undoStack, { kind: "bulk", entries: snapshot }];
      notificationsStore.addSuccess($t("attendance.take_all_present"));
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  function requestMarkAllPresent() {
    if (rows.length === 0) return;
    confirmingBulk = true;
  }

  function handleKeydown(event: KeyboardEvent) {
    // The confirm dialog owns the keyboard while it is open: shortcuts behind a
    // modal would change the column the teacher is being asked about.
    if (done || confirmingBulk) return;

    const isUndo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z";
    if (isUndo || event.key === "Backspace") {
      event.preventDefault();
      void undo();
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      void decide("present");
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      void decide("absent");
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      void decide("skip");
    }
  }

  onMount(loadData);
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
  <title>{$t("attendance.take_title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageHeader title={`${$t("attendance.take_title")}${assignmentTitle ? ` · ${assignmentTitle}` : ""}`} />

{#if loading}
  <p>{$t("attendance.loading")}</p>
{:else if commissionID === undefined || !attendanceStore.grid}
  <p>{$t("commissions.not_found_message")}</p>
{:else if rows.length === 0}
  <p data-test-id="take-empty">{$t("attendance.empty_students")}</p>
{:else if done}
  <section data-test-id="take-report">
    <h2>{$t("attendance.take_done_title")}</h2>
    <p data-test-id="take-result-present">
      {$t("attendance.take_result_present", { count: totals.present } as never)}
    </p>
    <p data-test-id="take-result-absent">
      {$t("attendance.take_result_absent", { count: totals.absent } as never)}
    </p>
    <p data-test-id="take-result-unmarked">
      {$t("attendance.take_result_unmarked", { count: totals.unmarked } as never)}
    </p>

    <div class="take-report-actions">
      <button
        type="button"
        class="btn btn-ghost"
        onclick={() => {
          done = false;
          currentIndex = 0;
        }}
        data-test-id="take-review"
      >
        {$t("attendance.take_title")}
      </button>
      <a href="{baseUrl}/attendance" class="btn btn-ghost btn-sm" data-test-id="take-back">
        {$t("attendance.take_back")}
      </a>
    </div>
  </section>
{:else if currentRow}
  <TakeAttendanceCard
    studentName={currentRow.name}
    legajo={currentRow.legajo}
    commissionName={currentRow.commission_name}
    status={currentStatus}
    current={currentIndex}
    total={rows.length}
    onDecide={decide}
    onUndo={undo}
    canUndo={undoStack.length > 0}
  />

  <div class="take-toolbar">
    <button
      type="button"
      class="btn btn-ghost btn-sm"
      onclick={requestMarkAllPresent}
      data-test-id="take-all-present"
    >
      {$t("attendance.take_all_present")}
    </button>
    <button
      type="button"
      class="btn btn-primary btn-sm"
      onclick={() => {
        done = true;
      }}
      data-test-id="take-finish"
    >
      {$t("attendance.take_finish")}
    </button>
    <a
      href="{baseUrl}/attendance"
      class="btn btn-ghost btn-sm"
      data-test-id="take-back-toolbar">{$t("attendance.take_back")}</a
    >
  </div>
{/if}

<ConfirmDialog
  isOpen={confirmingBulk}
  title={$t("attendance.take_all_present_title")}
  message={$t("attendance.take_all_present_message", { count: rows.length } as never)}
  confirmText={$t("attendance.take_all_present_confirm", { count: rows.length } as never)}
  tone="neutral"
  onConfirm={() => {
    confirmingBulk = false;
    void markAllPresent();
  }}
  onClose={() => {
    confirmingBulk = false;
  }}
/>

<style>
  .take-toolbar,
  .take-report-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1rem;
  }
</style>
