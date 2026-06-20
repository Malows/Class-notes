<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/i18n/config";
  import { StoreKey } from "$lib/types";
  import { ModalManager } from "$lib/composables/useModal.svelte";
  import type { Assignment } from "$lib/types";
  import type { AssignmentsStore } from "$lib/stores/assignments.svelte";
  import type { PeriodsStore } from "$lib/stores/periods.svelte";
  import GuardWrapper from "$lib/components/GuardWrapper.svelte";
  import AssignmentTable from "$lib/components/grids/tables/AssignmentTable.svelte";
  import AssignmentModal from "$lib/components/modals/AssignmentModal.svelte";
  import ConfirmDialog from "$lib/components/common/ConfirmDialog.svelte";
  import PageWithAdd from "$lib/components/layout/PageWithAdd.svelte";
  import DialogBase from "$lib/components/common/DialogBase.svelte";

  const assignmentsStore = getContext<AssignmentsStore>(StoreKey.ASSIGNMENTS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);

  let loading = $state(true);

  const modal = new ModalManager<Assignment>();

  const facultyID = Number(page.params.faculty_id);
  const subjectID = Number(page.params.subject_id);
  const periodID = Number(page.params.period_id);

  // Status transition state
  let isAdvanceModalOpen = $state(false);
  let advanceTarget = $state<Assignment | null>(null);

  // Copy period state
  let isCopyModalOpen = $state(false);

  const currentPeriod = $derived(periodsStore.items.find((p) => p.id === periodID));

  const previousPeriod = $derived.by(() => {
    if (!currentPeriod) return null;
    const candidates = periodsStore.items.filter((p) => {
      if (p.id === periodID) return false;
      if (p.year < currentPeriod.year) return true;
      if (p.year === currentPeriod.year && p.semester < currentPeriod.semester) return true;
      return false;
    });
    candidates.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.semester - a.semester;
    });
    return candidates[0] || null;
  });

  async function loadData() {
    try {
      await Promise.all([periodsStore.load(subjectID), assignmentsStore.load(periodID)]);
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSave(
    title: string,
    subtitle?: string,
    workflowStatus?: string,
    id?: number,
  ) {
    try {
      if (id) {
        await assignmentsStore.updateItem(id, title, subtitle);
      } else {
        await assignmentsStore.create(periodID, title, subtitle, workflowStatus);
      }
      modal.close();
    } catch (e) {
      alert(e);
    }
  }

  async function handleDelete() {
    if (!modal.target) return;
    try {
      await assignmentsStore.deleteItem(modal.target.id);
      modal.close();
    } catch (e) {
      alert(e);
    }
  }

  function handleBulkUpdate(assignment: Assignment) {
    advanceTarget = assignment;
    isAdvanceModalOpen = true;
  }

  function getNextStatus(current: string | undefined): string | null {
    if (!current || current === "NOT_DICTATED") return "WAITING_FOR_STUDENTS";
    if (current === "WAITING_FOR_STUDENTS") return "WAITING_FOR_CORRECTION";
    return null;
  }

  async function confirmAdvanceStatus() {
    if (!advanceTarget) return;
    const next = getNextStatus(advanceTarget.workflow_status);
    if (!next) return;
    try {
      await assignmentsStore.updateStatus(advanceTarget.id, next);
      isAdvanceModalOpen = false;
      advanceTarget = null;
    } catch (e) {
      alert(e);
    }
  }

  async function confirmCopy() {
    if (!previousPeriod) return;
    try {
      await assignmentsStore.copy(previousPeriod.id, periodID);
      isCopyModalOpen = false;
    } catch (e) {
      alert(e);
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("assignments.manage_assignments_title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageWithAdd title={$t("assignments.manage_assignments_title")} onAdd={() => modal.openCreate()}>
  <p>
    <a href="/faculties/{facultyID}/subjects/{subjectID}/periods" class="paper-btn btn-small"
      >{$t("layout.back_to_periods")}</a
    >
  </p>

  <GuardWrapper
    condition={periodsStore.items.some((p) => p.id === periodID)}
    message={$t("periods.period_not_found")}
    linkHref="/faculties/{facultyID}/subjects/{subjectID}/periods"
    linkText={$t("layout.back_to_periods")}
  >
    {#if loading}
      <p>{$t("assignments.loading_assignments")}</p>
    {:else}
      {#if assignmentsStore.items.length === 0}
        <div class="card margin-top-small">
          <div class="card-body text-center">
            <p>
              {$t("assignments.loading_assignments") === "Cargando TPs..."
                ? "No hay trabajos prácticos definidos para este período."
                : "No assignments defined for this period."}
            </p>
            {#if previousPeriod}
              <button
                class="paper-btn btn-secondary"
                onclick={() => {
                  isCopyModalOpen = true;
                }}
                data-test-id="copy-assignments-btn"
              >
                {$t("assignments.copy_previous_btn")}
              </button>
            {/if}
          </div>
        </div>
      {:else}
        <AssignmentTable
          assignments={assignmentsStore.items}
          onEdit={(assignment) => modal.openEdit(assignment)}
          onDelete={(assignment) => modal.openDelete(assignment)}
          onBulkUpdate={handleBulkUpdate}
        />
      {/if}
    {/if}
  </GuardWrapper>

  <AssignmentModal
    isOpen={modal.isCreate || modal.isEdit}
    mode={modal.mode === "create" ? "create" : "edit"}
    assignment={modal.target}
    onSave={handleSave}
    onClose={() => modal.close()}
  />

  <ConfirmDialog
    isOpen={modal.isDelete}
    title={$t("assignments.confirm_delete_title")}
    message={$t("assignments.confirm_delete_message", { title: modal.target?.title || "" })}
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />

  <DialogBase
    isOpen={isAdvanceModalOpen}
    title={$t("assignments.advance_status_title")}
    onClose={() => {
      isAdvanceModalOpen = false;
    }}
  >
    {#snippet children()}
      <p>
        {$t("assignments.advance_status_message", {
          current: advanceTarget?.workflow_status
            ? $t(`assignments.workflow_status.${advanceTarget.workflow_status.toLowerCase()}`)
            : "",
          next: advanceTarget
            ? $t(
                `assignments.workflow_status.${getNextStatus(advanceTarget.workflow_status)?.toLowerCase() || ""}`,
              )
            : "",
        })}
      </p>
    {/snippet}
    {#snippet footer()}
      <button
        class="paper-btn"
        onclick={() => {
          isAdvanceModalOpen = false;
        }}
      >
        {$t("common.cancel")}
      </button>
      <button
        class="paper-btn btn-secondary"
        onclick={confirmAdvanceStatus}
        data-test-id="confirm-advance-btn"
      >
        {$t("common.save")}
      </button>
    {/snippet}
  </DialogBase>

  <DialogBase
    isOpen={isCopyModalOpen}
    title={$t("assignments.copy_previous_title")}
    onClose={() => {
      isCopyModalOpen = false;
    }}
  >
    {#snippet children()}
      <p>{$t("assignments.copy_previous_message")}</p>
    {/snippet}
    {#snippet footer()}
      <button
        class="paper-btn"
        onclick={() => {
          isCopyModalOpen = false;
        }}
      >
        {$t("common.cancel")}
      </button>
      <button class="paper-btn btn-secondary" onclick={confirmCopy} data-test-id="confirm-copy-btn">
        {$t("common.save")}
      </button>
    {/snippet}
  </DialogBase>
</PageWithAdd>
