<script lang="ts">
  import { onMount, getContext } from "svelte";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import type { Period } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import PageWithAdd from "$lib/client/components/layout/PageWithAdd.svelte";
  import PeriodTable from "$lib/client/components/grids/tables/PeriodTable.svelte";
  import PeriodModal from "$lib/client/components/modals/PeriodModal.svelte";
  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";

  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);
  let loading = $state(true);
  let failed = $state(false);
  const modal = new ModalManager<Period>();

  async function loadData() {
    loading = true;
    failed = false;
    try {
      await periodsStore.load();
    } catch (e) {
      console.error(e);
      failed = true;
    } finally {
      loading = false;
    }
  }

  async function handleSave(year: number, semester: number, id?: number) {
    if (id) {
      await periodsStore.updateItem(id, year, semester);
      notificationsStore.addSuccess($t("periods.updated_success"));
    } else {
      await periodsStore.create(1, year, semester);
      notificationsStore.addSuccess($t("periods.created_success"));
    }
    modal.close();
  }

  async function handleDelete() {
    if (!modal.target) return;
    try {
      await periodsStore.deleteItem(modal.target.id);
      notificationsStore.addSuccess($t("periods.deleted_success"));
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
  <div>
    <Button href="/" testId="back-to-dashboard-btn" class="btn-small">
      {$t("layout.back_to_dashboard")}
    </Button>
  </div>

  {#if loading}
    <p>{$t("periods.loading_periods")}</p>
  {:else if failed}
    <LoadError onRetry={loadData} />
  {:else}
    <PeriodTable
      periods={periodsStore.items}
      onEdit={(p) => modal.openEdit(p)}
      onDelete={(p) => modal.openDelete(p)}
    />
  {/if}

  <PeriodModal
    isOpen={modal.isCreate || modal.isEdit}
    mode={modal.mode === "create" ? "create" : "edit"}
    period={modal.target}
    subjectId={1}
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
