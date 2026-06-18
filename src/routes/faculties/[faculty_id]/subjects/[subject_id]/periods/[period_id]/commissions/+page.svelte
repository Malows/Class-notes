<script lang="ts">
  import { page } from "$app/state";
  import GuardWrapper from "$lib/components/GuardWrapper.svelte";
  import CommissionModal from "$lib/components/modals/CommissionModal.svelte";
  import CommissionTable from "$lib/components/tables/CommissionTable.svelte";
  import { t } from "$lib/i18n/config";
  import type { CommissionsStore } from "$lib/stores/commissions.svelte";
  import type { PeriodsStore } from "$lib/stores/periods.svelte";
  import { StoreKey } from "$lib/types";
  import { onMount, getContext } from "svelte";

  const commissionsStore = getContext<CommissionsStore>(StoreKey.COMMISSIONS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);

  let newCommissionName = $state("");
  let loading = $state(true);
  let editModalOpen = $state(false);
  let editingCommission = $state<any>(null);

  const facultyID = Number(page.params.faculty_id);
  const subjectID = Number(page.params.subject_id);
  const periodID = Number(page.params.period_id);

  async function loadData() {
    try {
      await Promise.all([periodsStore.load(subjectID), commissionsStore.load()]);
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function createCommission() {
    if (!newCommissionName) return;
    try {
      await commissionsStore.create(periodID, newCommissionName);
      newCommissionName = "";
    } catch (e) {
      alert(e);
    }
  }

  function startEdit(commission: any) {
    editingCommission = commission;
    editModalOpen = true;
  }

  async function saveEdit(newName: string) {
    if (!editingCommission) return;
    try {
      // Nota: commissionsStore actualiza en memoria, pero el servicio podría necesitar recarga para refrescar datos
      await commissionsStore.updateItem(editingCommission.id, String(newName));
      editModalOpen = false;
    } catch (e) {
      alert(e);
    }
  }

  async function deleteCommission(id: number) {
    if (!confirm($t("commissions.confirm_delete"))) return;
    try {
      await commissionsStore.deleteItem(id);
    } catch (e) {
      alert(e);
    }
  }

  onMount(loadData);
</script>

<h2>{$t("commissions.manage_commissions_title")}</h2>
<p>
  <a href="/faculties/{facultyID}/subjects/{subjectID}/periods" class="paper-btn btn-small"
    >{$t("layout.back_to_periods")}</a
  >
</p>

<GuardWrapper
  condition={periodsStore.items.some((p) => p.id === periodID)}
  message={$t("periods.period_not_found")}
  linkHref="/faculties/{facultyID}/subjects/{subjectID}/periods"
  linkText={$t("layout.back_to_periods")}
>
  <div class="row">
    <div class="col-12 col">
      <div class="card">
        <div class="card-body">
          <h4 class="card-title">{$t("commissions.new_title")}</h4>
          <div class="form-group">
            <label for="name">{$t("commissions.name_label")}:</label>
            <input
              type="text"
              id="name"
              bind:value={newCommissionName}
              placeholder={$t("commissions.placeholder")}
              class="input-block"
            />
          </div>
          <button class="paper-btn btn-primary" onclick={createCommission}
            >{$t("commissions.create_commission")}</button
          >
        </div>
      </div>
    </div>
  </div>

  {#if loading}
    <p>{$t("commissions.loading_commissions")}</p>
  {:else}
    <CommissionTable
      commissions={commissionsStore.items.filter((c) => c.period_id === periodID)}
      facultyId={facultyID}
      subjectId={subjectID}
      periodId={periodID}
      onEdit={startEdit}
      onDelete={(commission) => deleteCommission(commission.id)}
    />
  {/if}
</GuardWrapper>

<CommissionModal
  isOpen={editModalOpen}
  mode="edit"
  commission={editingCommission}
  onSave={(name) => saveEdit(name)}
  onClose={() => (editModalOpen = false)}
/>
