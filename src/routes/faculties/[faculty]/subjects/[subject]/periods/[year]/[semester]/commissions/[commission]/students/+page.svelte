<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import type { Student } from "$lib/common/types/student";
  import type { CommissionsStore } from "$lib/client/stores/commissions.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import type { StudentsStore } from "$lib/client/stores/students.svelte";

  import StudentTable from "$lib/client/components/grids/tables/StudentTable.svelte";
  import StudentModal from "$lib/client/components/modals/StudentModal.svelte";
  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import PageWithAdd from "$lib/client/components/layout/PageWithAdd.svelte";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  const studentsStore = getContext<StudentsStore>(StoreKey.STUDENTS);
  const commissionsStore = getContext<CommissionsStore>(StoreKey.COMMISSIONS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);
  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);

  let loading = $state(true);

  const modal = new ModalManager<Student>();

  const facultySlug = page.params.faculty ?? "";
  const subjectSlug = page.params.subject ?? "";
  const commissionSlug = page.params.commission;
  const periodYear = Number(page.params.year);
  const periodSemester = Number(page.params.semester);

  const subjectID = $derived(subjectsStore.bySlug.get(subjectSlug)?.id);
  const periodID = $derived(
    periodsStore.items.find((p) => p.year === periodYear && p.semester === periodSemester)?.id,
  );
  const commissionID = $derived(
    subjectID !== undefined && periodID !== undefined && commissionSlug
      ? commissionsStore.findInScope(subjectID, periodID, commissionSlug)?.id
      : undefined,
  );

  async function loadData() {
    try {
      await Promise.all([facultiesStore.load(), subjectsStore.load()]);
      const sid = subjectsStore.bySlug.get(subjectSlug)?.id;
      if (sid) await periodsStore.load(sid);
      await commissionsStore.load();
      if (commissionID !== undefined) {
        await studentsStore.load(commissionID);
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSave(name: string, externalId: string, id?: number, bulkNames?: string[]) {
    try {
      if (commissionID === undefined) return;
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
      href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/commissions"
      class="paper-btn btn-small">{$t("layout.back_to_commissions")}</a
    >
  </p>

  {#if loading}
    <p>{$t("students.loading_students")}</p>
  {:else if commissionID === undefined}
    <p>{$t("commissions.not_found_message")}</p>
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
    message={$t("students.confirm_delete_message", { name: modal.target?.name || "" } as never)}
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />
</PageWithAdd>