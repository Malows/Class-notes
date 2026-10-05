<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import type { Subject } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import GuardWrapper from "$lib/client/components/GuardWrapper.svelte";
  import PageWithAdd from "$lib/client/components/layout/PageWithAdd.svelte";
  import SubjectModal from "$lib/client/components/modals/SubjectModal.svelte";
  import SubjectTable from "$lib/client/components/grids/tables/SubjectTable.svelte";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);

  const facultySlug = page.params.faculty ?? "";
  const facultyID = $derived(facultiesStore.bySlug.get(facultySlug)?.id);
  const subjectsOfFaculty = $derived(
    facultyID !== undefined ? (subjectsStore.byFaculty.get(facultyID) ?? []) : [],
  );

  let loading = $state(true);

  const modal = new ModalManager<Subject>();

  async function load() {
    try {
      await Promise.all([facultiesStore.load(), subjectsStore.load()]);
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSave(name: string, id?: number) {
    try {
      if (modal.isCreate) {
        if (facultyID === undefined) return;
        await subjectsStore.create(facultyID, name);
        notificationsStore.addSuccess("Materia creada con éxito");
      } else if (modal.isEdit && id) {
        await subjectsStore.updateItem(id, name);
        notificationsStore.addSuccess("Materia actualizada con éxito");
      }
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  async function handleDelete() {
    if (!modal.target) return;
    try {
      await subjectsStore.deleteItem(modal.target.id);
      notificationsStore.addSuccess("Materia eliminada con éxito");
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
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

  <GuardWrapper
    condition={facultiesStore.bySlug.has(facultySlug)}
    message={$t("faculties.not_found_message")}
    linkHref="/faculties"
    linkText={$t("faculties.back_to_faculties")}
  >
    {#if loading}
      <p>{$t("subjects.loading")}</p>
    {:else}
      <SubjectTable
        subjects={subjectsOfFaculty}
        onEdit={(s) => modal.openEdit(s)}
        onDelete={(s) => modal.openDelete(s)}
      />
    {/if}
  </GuardWrapper>

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
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />
</PageWithAdd>
