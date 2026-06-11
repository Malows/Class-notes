<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { page } from '$app/state';
    import { StoreKey } from '$lib/types';
    import type { CommissionsStore } from '$lib/stores/commissions.svelte';
    import type { PeriodsStore } from '$lib/stores/periods.svelte';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
	import CommissionTable from '$lib/components/tables/CommissionTable.svelte';
    import EditModal from '$lib/components/EditModal.svelte';

    const commissionsStore = getContext<CommissionsStore>(StoreKey.COMMISSIONS);
    const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);

	let newCommissionName = $state('');
	let loading = $state(true);
    let editModalOpen = $state(false);
    let editingCommission = $state<any>(null);

    const facultyID = Number(page.params.faculty_id);
    const subjectID = Number(page.params.subject_id);
	const periodID = Number(page.params.period_id);

	async function loadData() {
		try {
			await Promise.all([
                periodsStore.load(subjectID),
                commissionsStore.load()
            ]);
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
			newCommissionName = '';
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
        if (!confirm('¿Borrar comisión?')) return;
        try {
            await commissionsStore.deleteItem(id);
        } catch (e) {
            alert(e);
        }
    }

	onMount(loadData);
</script>

<h2>Comisiones del Periodo</h2>
<p><a href="/faculties/{facultyID}/subjects/{subjectID}/periods" class="paper-btn btn-small">« Volver a Periodos</a></p>

<GuardWrapper 
    condition={periodsStore.items.some(p => p.id === periodID)} 
    message="El periodo seleccionado no existe o no pudo ser cargado." 
    linkHref="/faculties/{facultyID}/subjects/{subjectID}/periods" 
    linkText="Volver a periodos"
>
    <div class="row">
        <div class="col-12 col">
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title">Nueva Comisión</h4>
                    <div class="form-group">
                        <label for="name">Nombre de la Comisión:</label>
                        <input type="text" id="name" bind:value={newCommissionName} placeholder="Ej: Comisión A" class="input-block">
                    </div>
                    <button class="paper-btn btn-primary" onclick={createCommission}>Crear Comisión</button>
                </div>
            </div>
        </div>
    </div>

    {#if loading}
        <p>Cargando comisiones...</p>
    {:else}
        <CommissionTable 
            commissions={commissionsStore.items.filter(c => c.period_id === periodID)} 
            facultyId={facultyID}
            subjectId={subjectID}
            periodId={periodID}
            onEdit={startEdit} 
            onDelete={deleteCommission} 
        />
    {/if}
</GuardWrapper>

<EditModal 
    isOpen={editModalOpen} 
    title="Editar Comisión" 
    value={editingCommission?.name || ''} 
    onSave={saveEdit} 
    onClose={() => editModalOpen = false} 
/>
