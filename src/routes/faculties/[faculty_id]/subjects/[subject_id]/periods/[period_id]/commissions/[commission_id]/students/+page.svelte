<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/i18n/config";
  import { StoreKey } from "$lib/types";
  import { ModalManager } from "$lib/composables/useModal.svelte";
  import type { Student } from "$lib/types";
  import type { StudentsStore } from "$lib/stores/students.svelte";

  import StudentTable from "$lib/components/grids/tables/StudentTable.svelte";
  import StudentModal from "$lib/components/modals/StudentModal.svelte";
  import ConfirmDialog from "$lib/components/common/ConfirmDialog.svelte";
  import PageWithAdd from "$lib/components/layout/PageWithAdd.svelte";
  import { notificationsStore } from "$lib/stores/notifications.svelte";

  const studentsStore = getContext<StudentsStore>(StoreKey.STUDENTS);

  let loading = $state(true);

  const modal = new ModalManager<Student>();

  const facultyID = Number(page.params.faculty_id);
  const subjectID = Number(page.params.subject_id);
  const periodID = Number(page.params.period_id);
  const commissionID = Number(page.params.commission_id);

  async function loadData() {
    try {
      await studentsStore.load(commissionID);
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSave(name: string, externalId: string, id?: number, bulkNames?: string[]) {
    try {
      if (bulkNames) {
        await studentsStore.create(commissionID, bulkNames);
        notificationsStore.addSuccess("Alumnos cargados con éxito");
      } else if (id) {
        await studentsStore.updateItem(id, name);
        notificationsStore.addSuccess("Alumno actualizado con éxito");
      } else {
        await studentsStore.create(commissionID, [name]);
        notificationsStore.addSuccess("Alumno creado con éxito");
      }
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  async function handleDelete() {
    if (!modal.target) return;
    try {
      await studentsStore.deleteItem(modal.target.id);
      notificationsStore.addSuccess("Alumno eliminado con éxito");
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("students.manage_students_title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageWithAdd title={$t("students.manage_students_title")} onAdd={() => modal.openCreate()}>
  <p>
    <a
      href="/faculties/{facultyID}/subjects/{subjectID}/periods/{periodID}/commissions"
      class="paper-btn btn-small">{$t("layout.back_to_commissions")}</a
    >
  </p>

  {#if loading}
    <p>{$t("students.loading_students")}</p>
  {:else}
    <StudentTable
      students={studentsStore.items}
      onEdit={(student) => modal.openEdit(student)}
      onDelete={(student) => modal.openDelete(student)}
    />
  {/if}

  <StudentModal
    isOpen={modal.isCreate || modal.isEdit}
    mode={modal.mode === "create" ? "create" : "edit"}
    student={modal.target}
    onSave={handleSave}
    onClose={() => modal.close()}
  />

  <ConfirmDialog
    isOpen={modal.isDelete}
    title={$t("students.confirm_delete_title")}
    message={$t("students.confirm_delete_message", { name: modal.target?.name || "" })}
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />
</PageWithAdd>
