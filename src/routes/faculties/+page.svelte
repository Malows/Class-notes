<script lang="ts">
  import { onMount, getContext } from "svelte";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import type { Faculty } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import PageWithAdd from "$lib/client/components/layout/PageWithAdd.svelte";
  import FacultyModal from "$lib/client/components/modals/FacultyModal.svelte";
  import FacultyTable from "$lib/client/components/grids/tables/FacultyTable.svelte";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);

  let loading = $state(true);
  let modal = new ModalManager<Faculty>();

  async function load() {
    try {
      await facultiesStore.load();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSave(name: string, id?: number) {
    try {
      if (modal.mode === "create") {
        await facultiesStore.create(name);
        notificationsStore.addSuccess("Facultad creada con éxito");
      } else if (modal.mode === "edit" && id) {
        await facultiesStore.updateItem(id, name);
        notificationsStore.addSuccess("Facultad actualizada con éxito");
      }
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  async function handleDelete() {
    if (!modal.target) return;
    try {
      await facultiesStore.deleteItem(modal.target.id);
      notificationsStore.addSuccess("Facultad eliminada con éxito");
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  onMount(load);
</script>

<svelte:head>
  <title>{$t("faculties.title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageWithAdd title={$t("faculties.title")} onAdd={() => modal.openCreate()}>
  <div>
    <Button href="/" testId="back-to-dashboard-btn" class="btn-small">
      {$t("layout.back_to_dashboard")}
    </Button>
  </div>

  {#if loading}
    <p>{$t("faculties.loading")}</p>
  {:else}
    <FacultyTable
      faculties={facultiesStore.items}
      onEdit={(f) => modal.openEdit(f)}
      onDelete={(f) => modal.openDelete(f)}
    />
  {/if}

  <FacultyModal
    isOpen={modal.mode === "create" || modal.mode === "edit"}
    mode={modal.mode === "create" ? "create" : "edit"}
    faculty={modal.target}
    onSave={handleSave}
    onClose={() => modal.close()}
  />

  <ConfirmDialog
    isOpen={modal.mode === "delete"}
    title={$t("faculties.confirm_delete_title")}
    message={$t("faculties.confirm_delete_message", { name: modal.target?.name || "" } as never)}
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />
</PageWithAdd>
