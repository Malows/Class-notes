<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/i18n/config";
  import { StoreKey } from "$lib/types";
  import { ModalManager } from "$lib/composables/useModal.svelte";
  import type { Commission } from "$lib/types";
  import type { CommissionsStore } from "$lib/stores/commissions.svelte";
  import type { PeriodsStore } from "$lib/stores/periods.svelte";
  import GuardWrapper from "$lib/components/GuardWrapper.svelte";
  import CommissionTable from "$lib/components/grids/tables/CommissionTable.svelte";
  import CommissionModal from "$lib/components/modals/CommissionModal.svelte";
  import ConfirmDialog from "$lib/components/common/ConfirmDialog.svelte";
  import PageWithAdd from "$lib/components/layout/PageWithAdd.svelte";

  const commissionsStore = getContext<CommissionsStore>(StoreKey.COMMISSIONS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);

  let loading = $state(true);

  const modal = new ModalManager<Commission>();

  const facultyID = Number(page.params.faculty_id);
  const subjectID = Number(page.params.subject_id);
  const periodID = Number(page.params.period_id);

  async function loadData() {
    try {
      await Promise.all([periodsStore.load(subjectID), commissionsStore.load()]);
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSave(name: string, id?: number) {
    try {
      if (id) {
        await commissionsStore.updateItem(id, name);
      } else {
        await commissionsStore.create(periodID, name);
      }
      modal.close();
    } catch (e) {
      alert(e);
    }
  }

  async function handleDelete() {
    if (!modal.target) return;
    try {
      await commissionsStore.deleteItem(modal.target.id);
      modal.close();
    } catch (e) {
      alert(e);
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("commissions.manage_commissions_title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageWithAdd title={$t("commissions.manage_commissions_title")} onAdd={() => modal.openCreate()}>
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
      <p>{$t("commissions.loading_commissions")}</p>
    {:else}
      <CommissionTable
        commissions={commissionsStore.items.filter((c) => c.period_id === periodID)}
        facultyId={facultyID}
        subjectId={subjectID}
        periodId={periodID}
        onEdit={(commission) => modal.openEdit(commission)}
        onDelete={(commission) => modal.openDelete(commission)}
      />
    {/if}
  </GuardWrapper>

  <CommissionModal
    isOpen={modal.isCreate || modal.isEdit}
    mode={modal.mode === "create" ? "create" : "edit"}
    commission={modal.target}
    onSave={handleSave}
    onClose={() => modal.close()}
  />

  <ConfirmDialog
    isOpen={modal.isDelete}
    title={$t("commissions.confirm_delete_title")}
    message={$t("commissions.confirm_delete_message", { name: modal.target?.name || "" })}
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />
</PageWithAdd>
