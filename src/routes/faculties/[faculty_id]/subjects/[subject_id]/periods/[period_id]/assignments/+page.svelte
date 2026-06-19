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

  const assignmentsStore = getContext<AssignmentsStore>(StoreKey.ASSIGNMENTS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);

  let loading = $state(true);

  const modal = new ModalManager<Assignment>();

  const facultyID = Number(page.params.faculty_id);
  const subjectID = Number(page.params.subject_id);
  const periodID = Number(page.params.period_id);

  async function loadData() {
    try {
      await Promise.all([periodsStore.load(subjectID), assignmentsStore.load(periodID)]);
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSave(title: string, id?: number) {
    try {
      if (id) {
        await assignmentsStore.updateItem(id, title);
      } else {
        await assignmentsStore.create(periodID, title);
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
      <AssignmentTable
        assignments={assignmentsStore.items}
        onEdit={(assignment) => modal.openEdit(assignment)}
        onDelete={(assignment) => modal.openDelete(assignment)}
      />
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
</PageWithAdd>
