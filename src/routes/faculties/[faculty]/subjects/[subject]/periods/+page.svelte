<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import type { Period } from "$lib/common/types/academic";

  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import Button from "$lib/client/components/common/Button.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import PageWithAdd from "$lib/client/components/layout/PageWithAdd.svelte";
  import PeriodModal from "$lib/client/components/modals/PeriodModal.svelte";
  import SubjectPeriodTable from "$lib/client/components/grids/tables/SubjectPeriodTable.svelte";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";
  import { scheduleDeferredDelete } from "$lib/client/utils/deferred-delete";

  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);

  const facultySlug = page.params.faculty ?? "";
  const subjectSlug = page.params.subject ?? "";
  const subjectID = $derived(subjectsStore.bySlug.get(subjectSlug)?.id);

  let loading = $state(true);
  let failed = $state(false);
  // Rows removed from the view while their server deletion waits for the undo window.
  let pendingDeletes = $state<number[]>([]);
  const visiblePeriods = $derived(
    periodsStore.items.filter((period) => !pendingDeletes.includes(period.id)),
  );

  const modal = new ModalManager<Period>();

  async function loadData() {
    loading = true;
    failed = false;
    try {
      await Promise.all([facultiesStore.load(), subjectsStore.load()]);
      const sid = subjectsStore.bySlug.get(subjectSlug)?.id;
      if (sid) {
        await periodsStore.load(sid);
      }
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
      if (subjectID === undefined) return;
      await periodsStore.create(subjectID, year, semester);
      notificationsStore.addSuccess($t("periods.created_success"));
    }
    modal.close();
  }

  async function handleDelete(pendingTarget = modal.target) {
    const target = pendingTarget;
    if (!target) return;
    if (modal.target === target) modal.close();

    pendingDeletes = [...pendingDeletes, target.id];
    scheduleDeferredDelete({
      commit: async () => {
        await periodsStore.deleteItem(target.id);
        pendingDeletes = pendingDeletes.filter((id) => id !== target.id);
      },
      restore: () => {
        pendingDeletes = pendingDeletes.filter((id) => id !== target.id);
      },
      message: $t("periods.deleted_success"),
      undoLabel: $t("common.undo"),
      onError: (error) => {
        const detail =
          error instanceof Error && error.message ? error.message : $t("common.error_generic");
        notificationsStore.addErrorAction(`${target.year} · ${target.semester}º — ${detail}`, {
          label: $t("common.retry"),
          onAction: () => void handleDelete(target),
        });
      },
    });
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("periods.manage_periods_title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageWithAdd title={$t("periods.manage_periods_title")} onAdd={() => modal.openCreate()}>
  <div class="flex flex-wrap items-center gap-2">
    <Button
      href="/faculties/{facultySlug}/subjects"
      class="btn-small"
      testId="back-to-subjects-btn"
    >
      {$t("layout.back_to_subjects")}
    </Button>
  </div>

  {#if loading}
    <p>{$t("periods.loading_periods")}</p>
  {:else if failed}
    <LoadError onRetry={loadData} />
  {:else}
    <SubjectPeriodTable
      periods={visiblePeriods}
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
    onConfirm={() => handleDelete()}
    onClose={() => modal.close()}
  />
</PageWithAdd>
