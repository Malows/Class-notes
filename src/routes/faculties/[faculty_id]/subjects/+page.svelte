<script lang="ts">
  import { page } from "$app/state";
  import Button from "$lib/components/common/Button.svelte";
  import ConfirmDialog from "$lib/components/common/ConfirmDialog.svelte";
  import GuardWrapper from "$lib/components/GuardWrapper.svelte";
  import PageWithAdd from "$lib/components/layout/PageWithAdd.svelte";
  import SubjectModal from "$lib/components/modals/SubjectModal.svelte";
  import SubjectTable from "$lib/components/grids/tables/SubjectTable.svelte";
  import { ModalManager } from "$lib/composables/useModal.svelte";
  import { t } from "$lib/i18n/config";
  import { FacultiesStore } from "$lib/stores/faculties.svelte";
  import { SubjectsStore } from "$lib/stores/subjects.svelte";
  import { StoreKey } from "$lib/types";
  import type { Subject } from "$lib/types";
  import { onMount, getContext } from "svelte";
  import { notificationsStore } from "$lib/stores/notifications.svelte";

  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);
  const facultyID = Number(page.params.faculty_id);

  let loading = $state(true);

  const modal = new ModalManager<Subject>();

  async function load() {
    try {
      const p = [];

      if (!facultiesStore.map.has(facultyID)) {
        p.push(facultiesStore.load());
      }
      if (!subjectsStore.map.has(facultyID)) {
        p.push(subjectsStore.load());
      }
      if (p.length > 0) {
        await Promise.all(p);
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSave(name: string, id?: number) {
    try {
      if (modal.isCreate) {
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
    condition={facultiesStore.map.has(facultyID)}
    message={$t("faculties.not_found_message")}
    linkHref="/faculties"
    linkText={$t("faculties.back_to_faculties")}
  >
    {#if loading}
      <p>{$t("subjects.loading")}</p>
    {:else}
      <SubjectTable
        subjects={subjectsStore.byFaculty.get(facultyID) || []}
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
    message={$t("subjects.confirm_delete_message", {
      name: modal.target?.name || "",
    })}
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />
</PageWithAdd>
