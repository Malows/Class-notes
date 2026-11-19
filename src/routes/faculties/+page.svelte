<script lang="ts">
  import { onMount, getContext } from "svelte";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import type { Faculty } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import PageWithAdd from "$lib/client/components/layout/PageWithAdd.svelte";
  import FacultyModal from "$lib/client/components/modals/FacultyModal.svelte";
  import FacultyTable from "$lib/client/components/grids/tables/FacultyTable.svelte";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";
  import { scheduleDeferredDelete } from "$lib/client/utils/deferred-delete";

  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);

  let loading = $state(true);
  let failed = $state(false);
  // Rows removed from the view while their server deletion waits for the undo window.
  let pendingDeletes = $state<number[]>([]);
  const visibleFaculties = $derived(
    facultiesStore.items.filter((faculty) => !pendingDeletes.includes(faculty.id)),
  );
  let modal = new ModalManager<Faculty>();

  async function load() {
    loading = true;
    failed = false;
    try {
      await facultiesStore.load();
    } catch (e) {
      console.error(e);
      failed = true;
    } finally {
      loading = false;
    }
  }

  async function handleSave(name: string, id?: number) {
    try {
      if (modal.mode === "create") {
        await facultiesStore.create(name);
        notificationsStore.addSuccess($t("faculties.created_success"));
      } else if (modal.mode === "edit" && id) {
        await facultiesStore.updateItem(id, name);
        notificationsStore.addSuccess($t("faculties.updated_success"));
      }
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  function handleDelete(pendingTarget = modal.target) {
    const target = pendingTarget;
    if (!target) return;
    if (modal.target === target) modal.close();

    pendingDeletes = [...pendingDeletes, target.id];
    scheduleDeferredDelete({
      commit: async () => {
        await facultiesStore.deleteItem(target.id);
        pendingDeletes = pendingDeletes.filter((id) => id !== target.id);
      },
      restore: () => {
        pendingDeletes = pendingDeletes.filter((id) => id !== target.id);
      },
      message: $t("faculties.deleted_success"),
      undoLabel: $t("common.undo"),
      onError: (error) => {
        const detail =
          error instanceof Error && error.message ? error.message : $t("common.error_generic");
        notificationsStore.addErrorAction(`${target.name} — ${detail}`, {
          label: $t("common.retry"),
          onAction: () => void handleDelete(target),
        });
      },
    });
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
  {:else if failed}
    <LoadError onRetry={load} />
  {:else}
    <FacultyTable
      faculties={visibleFaculties}
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
    onConfirm={() => handleDelete()}
    onClose={() => modal.close()}
  />
</PageWithAdd>
