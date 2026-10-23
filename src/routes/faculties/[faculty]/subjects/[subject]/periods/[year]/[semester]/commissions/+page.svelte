<script lang="ts">
  import { onMount, getContext } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";
  import type { Commission } from "$lib/common/types/academic";

  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import type { CommissionsStore } from "$lib/client/stores/commissions.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import GuardWrapper from "$lib/client/components/GuardWrapper.svelte";
  import Button from "$lib/client/components/common/Button.svelte";
  import CommissionTable from "$lib/client/components/grids/tables/CommissionTable.svelte";
  import CommissionModal from "$lib/client/components/modals/CommissionModal.svelte";
  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import PageWithAdd from "$lib/client/components/layout/PageWithAdd.svelte";
  import type { EnrollmentsStore } from "$lib/client/stores/enrollments.svelte";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  const commissionsStore = getContext<CommissionsStore>(StoreKey.COMMISSIONS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);
  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);
  const enrollmentsStore = getContext<EnrollmentsStore>(StoreKey.ENROLLMENTS);

  let loading = $state(true);

  const modal = new ModalManager<Commission>();

  const facultySlug = page.params.faculty ?? "";
  const subjectSlug = page.params.subject ?? "";
  const periodYear = Number(page.params.year);
  const periodSemester = Number(page.params.semester);
  const subjectID = $derived(subjectsStore.bySlug.get(subjectSlug)?.id);
  const period = $derived(
    periodsStore.items.find((p) => p.year === periodYear && p.semester === periodSemester),
  );
  const periodID = $derived(period?.id);
  const subjectPeriodID = $derived(period?.subject_period_id);

  const cursadaCommissions = $derived(
    commissionsStore.items.filter((c) => c.period_id === periodID && c.subject_id === subjectID),
  );

  let pendingTargets = $state<Record<number, number>>({});

  async function assignPending(enrollmentId: number) {
    const target = pendingTargets[enrollmentId];
    if (!target) return;

    try {
      await enrollmentsStore.assignCommission(enrollmentId, target);
      notificationsStore.addSuccess("Alumno asignado con éxito");
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  async function loadData() {
    try {
      await Promise.all([facultiesStore.load(), subjectsStore.load()]);
      const sid = subjectsStore.bySlug.get(subjectSlug)?.id;
      if (sid) await periodsStore.load(sid);
      await commissionsStore.load();
      if (subjectPeriodID !== undefined) {
        await enrollmentsStore.loadPending(subjectPeriodID);
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSave(name: string, id?: number) {
    try {
      if (id) {
        await commissionsStore.updateItem(id, name);
        notificationsStore.addSuccess("Comisión actualizada con éxito");
      } else {
        if (subjectID === undefined || periodID === undefined) return;
        await commissionsStore.create(subjectID, periodID, name);
        notificationsStore.addSuccess("Comisión creada con éxito");
      }
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  async function handleDelete() {
    if (!modal.target) return;
    try {
      await commissionsStore.deleteItem(modal.target.id);
      notificationsStore.addSuccess("Comisión eliminada con éxito");
      modal.close();
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("commissions.manage_commissions_title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageWithAdd title={$t("commissions.manage_commissions_title")} onAdd={() => modal.openCreate()}>
  <p>
    <a href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods" class="paper-btn btn-small"
      >{$t("layout.back_to_periods")}</a
    >
  </p>

  <GuardWrapper
    condition={periodsStore.items.some(
      (p) => p.year === periodYear && p.semester === periodSemester,
    )}
    message={$t("periods.period_not_found")}
    linkHref="/faculties/{facultySlug}/subjects/{subjectSlug}/periods"
    linkText={$t("layout.back_to_periods")}
  >
    {#if loading}
      <p>{$t("commissions.loading_commissions")}</p>
    {:else}
      <CommissionTable
        commissions={cursadaCommissions}
        {facultySlug}
        {subjectSlug}
        {periodYear}
        {periodSemester}
        onEdit={(commission) => modal.openEdit(commission)}
        onDelete={(commission) => modal.openDelete(commission)}
      />

      {#if enrollmentsStore.pending.length > 0}
        <section class="pending-enrollments" data-test-id="pending-enrollments">
          <h3>
            {$t("enrollments.pending_title")}
            ({enrollmentsStore.pending.length})
          </h3>
          <p class="text-small">{$t("enrollments.pending_count", {
            count: enrollmentsStore.pending.length,
          } as never)}</p>
          <ul>
            {#each enrollmentsStore.pending as enrollment (enrollment.id)}
              <li class="pending-enrollments__row">
                <span class="pending-enrollments__name" data-test-id="pending-name-{enrollment.id}">
                  {enrollment.name}{enrollment.legajo ? ` · ${enrollment.legajo}` : ""}
                </span>
                <select
                  bind:value={pendingTargets[enrollment.id]}
                  aria-label={$t("enrollments.assign_commission_label")}
                  data-test-id="pending-target-{enrollment.id}"
                >
                  <option value={0}>{$t("enrollments.assign_commission_label")}...</option>
                  {#each cursadaCommissions as commission (commission.id)}
                    <option value={commission.id}>{commission.name}</option>
                  {/each}
                </select>
                <Button
                  testId="pending-assign-{enrollment.id}"
                  onclick={() => assignPending(enrollment.id)}
                  withHover
                >
                  {$t("enrollments.assign_btn")}
                </Button>
              </li>
            {/each}
          </ul>
        </section>
      {/if}
    {/if}
  </GuardWrapper>

  <CommissionModal
    isOpen={modal.isCreate || modal.isEdit}
    mode={modal.mode === "create" ? "create" : "edit"}
    commission={modal.target}
    subjectId={subjectID ?? 0}
    periodId={periodID ?? 0}
    onSave={handleSave}
    onClose={() => modal.close()}
  />

  <ConfirmDialog
    isOpen={modal.isDelete}
    title={$t("commissions.confirm_delete_title")}
    message={$t("commissions.confirm_delete_message", { name: modal.target?.name || "" } as never)}
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />
</PageWithAdd>
<style>
  .pending-enrollments {
    margin-top: 1.5rem;
  }

  .pending-enrollments ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .pending-enrollments__row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .pending-enrollments__name {
    flex: 1 1 12rem;
  }
</style>
