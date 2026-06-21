<script lang="ts">
  import { page } from "$app/state";
  import ConfirmDialog from "$lib/components/common/ConfirmDialog.svelte";
  import PageWithAdd from "$lib/components/layout/PageWithAdd.svelte";
  import PeriodModal from "$lib/components/modals/PeriodModal.svelte";
  import PeriodTable from "$lib/components/grids/tables/PeriodTable.svelte";
  import { ModalManager } from "$lib/composables/useModal.svelte";
  import { t } from "$lib/i18n/config";
  import type { PeriodsStore } from "$lib/stores/periods.svelte";
  import { StoreKey } from "$lib/types";
  import type { Period } from "$lib/types";
  import { onMount, getContext } from "svelte";
  import { notificationsStore } from "$lib/stores/notifications.svelte";

  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);

  let loading = $state(true);

  const modal = new ModalManager<Period>();

  const facultyID = Number(page.params.faculty_id);
  const subjectID = Number(page.params.subject_id);

  async function loadData() {
    try {
      await periodsStore.load(subjectID);
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSave(year: number, semester: number, id?: number) {
    if (id) {
      await periodsStore.updateItem(id, year, semester);
      notificationsStore.addSuccess("Período actualizado con éxito");
    } else {
      await periodsStore.create(subjectID, year, semester);
      notificationsStore.addSuccess("Período creado con éxito");
    }
    modal.close();
  }

  async function handleDelete() {
    if (!modal.target) return;
    try {
      await periodsStore.deleteItem(modal.target.id);
      notificationsStore.addSuccess("Período eliminado con éxito");
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("periods.manage_periods_title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageWithAdd title={$t("periods.manage_periods_title")} onAdd={() => modal.openCreate()}>
  <p>
    <a href="/faculties/{facultyID}/subjects" class="paper-btn btn-small"
      >{$t("layout.back_to_subjects")}</a
    >
  </p>

  {#if loading}
    <p>{$t("periods.loading_periods")}</p>
  {:else}
    <PeriodTable
      periods={periodsStore.items}
      facultyId={facultyID}
      subjectId={subjectID}
      onEdit={(p) => modal.openEdit(p)}
      onDelete={(p) => modal.openDelete(p)}
    />
  {/if}

  <PeriodModal
    isOpen={modal.isCreate || modal.isEdit}
    mode={modal.mode === "create" ? "create" : "edit"}
    period={modal.target}
    onSave={handleSave}
    onClose={() => modal.close()}
  />

  <ConfirmDialog
    isOpen={modal.isDelete}
    title={$t("periods.confirm_delete_title")}
    message={$t("periods.confirm_delete_message", {
      year: modal.target?.year || "",
      semester: modal.target?.semester || "",
    })}
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />
</PageWithAdd>
