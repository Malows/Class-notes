<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import type { Period } from "$lib/common/types/academic";

  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import PageWithAdd from "$lib/client/components/layout/PageWithAdd.svelte";
  import PeriodModal from "$lib/client/components/modals/PeriodModal.svelte";
  import SubjectPeriodTable from "$lib/client/components/grids/tables/SubjectPeriodTable.svelte";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);

  const facultySlug = page.params.faculty ?? "";
  const subjectSlug = page.params.subject ?? "";
  const subjectID = $derived(subjectsStore.bySlug.get(subjectSlug)?.id);

  let loading = $state(true);

  const modal = new ModalManager<Period>();

  async function loadData() {
    try {
      await Promise.all([facultiesStore.load(), subjectsStore.load()]);
      const sid = subjectsStore.bySlug.get(subjectSlug)?.id;
      if (sid) {
        await periodsStore.load(sid);
      }
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
      if (subjectID === undefined) return;
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
    <a href="/faculties/{facultySlug}/subjects" class="paper-btn btn-small"
      >{$t("layout.back_to_subjects")}</a
    >
  </p>

  {#if loading}
    <p>{$t("periods.loading_periods")}</p>
  {:else}
    <SubjectPeriodTable
      periods={periodsStore.items}
      {facultySlug}
      {subjectSlug}
      onEdit={(p) => modal.openEdit(p)}
      onDelete={(p) => modal.openDelete(p)}
    />
  {/if}

  <PeriodModal
    isOpen={modal.isCreate || modal.isEdit}
    mode={modal.mode === "create" ? "create" : "edit"}
    period={modal.target}
    subjectId={subjectID ?? 0}
    onSave={handleSave}
    onClose={() => modal.close()}
  />

  <ConfirmDialog
    isOpen={modal.isDelete}
    title={$t("periods.confirm_delete_title")}
    message={$t("periods.confirm_delete_message", {
      year: modal.target?.year || "",
      semester: modal.target?.semester || "",
    } as never)}
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />
</PageWithAdd>
