<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import type { Subject } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import GuardWrapper from "$lib/client/components/GuardWrapper.svelte";
  import PageWithAdd from "$lib/client/components/layout/PageWithAdd.svelte";
  import SubjectModal from "$lib/client/components/modals/SubjectModal.svelte";
  import SubjectTable from "$lib/client/components/grids/tables/SubjectTable.svelte";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";
  import { scheduleDeferredDelete } from "$lib/client/utils/deferred-delete";

  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);

  const facultySlug = page.params.faculty ?? "";
  const facultyID = $derived(facultiesStore.bySlug.get(facultySlug)?.id);
  const subjectsOfFaculty = $derived(
    facultyID !== undefined ? (subjectsStore.byFaculty.get(facultyID) ?? []) : [],
  );

  let loading = $state(true);
  let failed = $state(false);
  // Rows removed from the view while their server deletion waits for the undo window.
  let pendingDeletes = $state<number[]>([]);
  const visibleSubjects = $derived(
    subjectsOfFaculty.filter((subject) => !pendingDeletes.includes(subject.id)),
  );

  const modal = new ModalManager<Subject>();

  async function load() {
    loading = true;
    failed = false;
    try {
      await Promise.all([facultiesStore.load(), subjectsStore.load()]);
    } catch (e) {
      console.error(e);
      failed = true;
    } finally {
      loading = false;
    }
  }

  async function handleSave(name: string, id?: number) {
    try {
      if (modal.isCreate) {
        if (facultyID === undefined) return;
        await subjectsStore.create(facultyID, name);
        notificationsStore.addSuccess($t("subjects.created_success"));
      } else if (modal.isEdit && id) {
        await subjectsStore.updateItem(id, name);
        notificationsStore.addSuccess($t("subjects.updated_success"));
      }
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  async function handleDelete(pendingTarget = modal.target) {
    const target = pendingTarget;
    if (!target) return;
    if (modal.target === target) modal.close();

    pendingDeletes = [...pendingDeletes, target.id];
    scheduleDeferredDelete({
      commit: async () => {
        await subjectsStore.deleteItem(target.id);
        pendingDeletes = pendingDeletes.filter((id) => id !== target.id);
      },
      restore: () => {
        pendingDeletes = pendingDeletes.filter((id) => id !== target.id);
      },
      message: $t("subjects.deleted_success"),
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
  <title>{$t("subjects.title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageWithAdd title={$t("subjects.title")} onAdd={() => modal.openCreate()}>
  <div>
    <Button href="/faculties" class="btn-small">
      {$t("faculties.back_to_faculties")}
    </Button>
  </div>

  {#if loading}
    <p>{$t("subjects.loading")}</p>
  {:else if failed}
    <LoadError onRetry={load} />
  {:else}
    <GuardWrapper
      condition={facultiesStore.bySlug.has(facultySlug)}
      message={$t("faculties.not_found_message")}
      linkHref="/faculties"
      linkText={$t("faculties.back_to_faculties")}
    >
      <SubjectTable
        subjects={visibleSubjects}
        onEdit={(s) => modal.openEdit(s)}
        onDelete={(s) => modal.openDelete(s)}
      />
    </GuardWrapper>
  {/if}

  <SubjectModal
    isOpen={modal.isCreate || modal.isEdit}
    mode={modal.mode === "create" ? "create" : "edit"}
    subject={modal.target}
    onSave={handleSave}
    onClose={() => modal.close()}
  />

  <ConfirmDialog
    isOpen={modal.isDelete}
    title={$t("subjects.confirm_delete_title")}
    message={$t("subjects.confirm_delete_message", { name: modal.target?.name || "" } as never)}
    onConfirm={() => handleDelete()}
    onClose={() => modal.close()}
  />
</PageWithAdd>
