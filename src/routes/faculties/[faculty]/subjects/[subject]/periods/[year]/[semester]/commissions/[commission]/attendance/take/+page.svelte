<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import { AttendanceStatus } from "$lib/common/types/attendance";
  import type { CursadaRoster } from "$lib/common/types/enrollment";

  import DialogBase from "$lib/client/components/common/DialogBase.svelte";
  import TakeAttendanceCard from "$lib/client/components/attendance/TakeAttendanceCard.svelte";
  import type { AttendanceStore } from "$lib/client/stores/attendance.svelte";
  import type { CommissionsStore } from "$lib/client/stores/commissions.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import { enrollmentService } from "$lib/client/services/enrollment.service";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  const attendanceStore = getContext<AttendanceStore>(StoreKey.ATTENDANCE);
  const commissionsStore = getContext<CommissionsStore>(StoreKey.COMMISSIONS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);
  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);

  let loading = $state(true);
  let currentIndex = $state(0);
  let done = $state(false);
  let guestOpen = $state(false);
  let guestSearch = $state("");
  let cursadaRoster = $state<CursadaRoster | null>(null);

  interface UndoEntry {
    enrollmentId: number;
    previous: AttendanceStatus | null;
    wrote: boolean;
  }

  let undoStack = $state<UndoEntry[]>([]);

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

  const rows = $derived((attendanceStore.grid?.rows ?? []).filter((row) => !row.is_guest));
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

  const availableGuests = $derived.by(() => {
    if (!cursadaRoster) return [];
    const inGrid = new Set((attendanceStore.grid?.rows ?? []).map((row) => row.enrollment_id));
    const term = guestSearch.trim().toLowerCase();

    return cursadaRoster.students.filter((student) => {
      if (inGrid.has(student.enrollment_id)) return false;
      if (!term) return true;
      return (
        student.name.toLowerCase().includes(term) ||
        (student.legajo ?? "").toLowerCase().includes(term)
      );
    });
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
        undoStack = [...undoStack, { enrollmentId: row.enrollment_id, previous, wrote: false }];
      } else {
        const status = decision === "present" ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT;
        await attendanceStore.mark(assignmentId, row.enrollment_id, status, commissionID);
        undoStack = [...undoStack, { enrollmentId: row.enrollment_id, previous, wrote: true }];
      }
      advance();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  async function undo() {
    const last = undoStack.at(-1);
    if (!last || commissionID === undefined) return;

    try {
      if (last.wrote) {
        if (last.previous === null) {
          await attendanceStore.unmark(assignmentId, last.enrollmentId);
        } else {
          await attendanceStore.mark(
            assignmentId,
            last.enrollmentId,
            last.previous,
            commissionID,
          );
        }
      }

      undoStack = undoStack.slice(0, -1);
      done = false;

      const index = rows.findIndex((row) => row.enrollment_id === last.enrollmentId);
      if (index >= 0) {
        currentIndex = index;
      }
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  async function markAllPresent() {
    if (commissionID === undefined) return;
    try {
      await attendanceStore.bulkMarkPresent(assignmentId, commissionID);
      notificationsStore.addSuccess($t("attendance.take_all_present"));
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (done) return;

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

  async function openGuests() {
    guestOpen = true;
    if (cursadaRoster || !attendanceStore.grid) return;

    try {
      const grid = attendanceStore.grid;
      cursadaRoster = await enrollmentService.getCursadaRoster(
        grid.subject.id,
        grid.period.id,
      );
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  async function addGuest(enrollmentId: number) {
    if (commissionID === undefined) return;
    try {
      await attendanceStore.mark(assignmentId, enrollmentId, AttendanceStatus.PRESENT, commissionID);
      await attendanceStore.loadCommission(commissionID);
      notificationsStore.addSuccess($t("attendance.guest"));
      guestOpen = false;
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  onMount(loadData);
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
  <title>{$t("attendance.take_title")} - {$t("layout.brand")}</title>
</svelte:head>

<h2>
  {$t("attendance.take_title")}
  {#if assignmentTitle}· {assignmentTitle}{/if}
</h2>

{#if loading}
  <p>{$t("attendance.loading")}</p>
{:else if commissionID === undefined || !attendanceStore.grid}
  <p>{$t("commissions.not_found_message")}</p>
{:else if rows.length === 0}
  <p data-test-id="take-empty">{$t("attendance.empty_students")}</p>
{:else if done}
  <section data-test-id="take-report">
    <h3>{$t("attendance.take_done_title")}</h3>
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
        class="paper-btn"
        onclick={() => {
          done = false;
          currentIndex = 0;
        }}
        data-test-id="take-review"
      >
        {$t("attendance.take_title")}
      </button>
      <button type="button" class="paper-btn" onclick={openGuests} data-test-id="take-add-guest">
        {$t("attendance.take_add_guest")}
      </button>
      <a href="{baseUrl}/attendance" class="paper-btn btn-small" data-test-id="take-back">
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
    <button type="button" class="paper-btn btn-small" onclick={markAllPresent} data-test-id="take-all-present">
      {$t("attendance.take_all_present")}
    </button>
    <button
      type="button"
      class="paper-btn btn-small"
      onclick={() => {
        done = true;
      }}
      data-test-id="take-finish"
    >
      {$t("attendance.take_finish")}
    </button>
    <a href="{baseUrl}/attendance" class="paper-btn btn-small">{$t("attendance.take_back")}</a>
  </div>
{/if}

<DialogBase
  isOpen={guestOpen}
  title={$t("attendance.guest_title")}
  onClose={() => (guestOpen = false)}
>
  {#snippet children()}
    <div class="form-group">
      <label for="guest-search">{$t("attendance.guest_search")}</label>
      <input
        type="search"
        id="guest-search"
        bind:value={guestSearch}
        class="input-block"
        data-test-id="guest-search-input"
      />
    </div>

    {#if availableGuests.length === 0}
      <p data-test-id="guest-empty">{$t("attendance.guest_empty")}</p>
    {:else}
      <ul class="guest-list" data-test-id="guest-list">
        {#each availableGuests as student (student.enrollment_id)}
          <li>
            <button
              type="button"
              class="paper-btn btn-small"
              onclick={() => addGuest(student.enrollment_id)}
              data-test-id="guest-option-{student.enrollment_id}"
            >
              {student.name}{student.legajo ? ` · ${student.legajo}` : ""} · {student.commission_name ?? "—"}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  {/snippet}

  {#snippet footer()}
    <button class="paper-btn" onclick={() => (guestOpen = false)}>
      {$t("attendance.guest_close")}
    </button>
  {/snippet}
</DialogBase>

<style>
  .take-toolbar,
  .take-report-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    margin-top: 1rem;
  }

  .guest-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    max-height: 40vh;
    overflow-y: auto;
  }
</style>
