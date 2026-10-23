<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import type { EnrollmentInput, EnrollmentWithPerson } from "$lib/common/types/enrollment";
  import type { CommissionsStore } from "$lib/client/stores/commissions.svelte";
  import type { EnrollmentsStore } from "$lib/client/stores/enrollments.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";

  import StudentTable from "$lib/client/components/grids/tables/StudentTable.svelte";
  import EnrollmentModal from "$lib/client/components/modals/EnrollmentModal.svelte";
  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import PageWithAdd from "$lib/client/components/layout/PageWithAdd.svelte";
  import { personService } from "$lib/client/services/person.service";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  const enrollmentsStore = getContext<EnrollmentsStore>(StoreKey.ENROLLMENTS);
  const commissionsStore = getContext<CommissionsStore>(StoreKey.COMMISSIONS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);
  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);

  let loading = $state(true);

  const modal = new ModalManager<EnrollmentWithPerson>();

  const facultySlug = page.params.faculty ?? "";
  const subjectSlug = page.params.subject ?? "";
  const commissionSlug = page.params.commission;
  const periodYear = Number(page.params.year);
  const periodSemester = Number(page.params.semester);

  const subjectID = $derived(subjectsStore.bySlug.get(subjectSlug)?.id);
  const period = $derived(
    periodsStore.items.find((p) => p.year === periodYear && p.semester === periodSemester),
  );
  const periodID = $derived(period?.id);
  const subjectPeriodID = $derived(period?.subject_period_id);
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
        await enrollmentsStore.load(commissionID);
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleCreate(entries: EnrollmentInput[]) {
    try {
      if (commissionID === undefined || subjectPeriodID === undefined) return;

      const report = await enrollmentsStore.register(subjectPeriodID, entries, commissionID);
      notificationsStore.addSuccess(
        $t("enrollments.register_success", {
          created: report.created,
          reused: report.reused,
        } as never),
      );
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }


  async function handleDelete() {
    if (!modal.target) return;
    try {
      await enrollmentsStore.deleteItem(modal.target.id);
      notificationsStore.addSuccess("Alumno quitado de la comisión");
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("enrollments.manage_title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageWithAdd title={$t("enrollments.manage_title")} onAdd={() => modal.openCreate()}>
  <p>
    <a
      href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/commissions"
      class="paper-btn btn-small">{$t("layout.back_to_commissions")}</a
    >
  </p>

  {#if loading}
    <p>{$t("enrollments.loading")}</p>
  {:else if commissionID === undefined}
    <p>{$t("commissions.not_found_message")}</p>
  {:else}
    <StudentTable
      enrollments={enrollmentsStore.items}
      onDelete={(enrollment) => modal.openDelete(enrollment)}
    />
  {/if}

  <EnrollmentModal
    isOpen={modal.isCreate}
    searchPersons={(query) => personService.search(query)}
    onCreate={handleCreate}
    onClose={() => modal.close()}
  />

  <ConfirmDialog
    isOpen={modal.isDelete}
    title={$t("enrollments.remove_confirm_title")}
    message={$t("enrollments.remove_confirm_message", {
      name: modal.target?.name || "",
    } as never)}
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />
</PageWithAdd>
