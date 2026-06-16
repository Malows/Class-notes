<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { page } from '$app/state';

	import { t } from '$lib/i18n/config';
	import { StoreKey } from '$lib/types';
	import type { PeriodsStore } from '$lib/stores/periods.svelte';

	import PeriodTable from '$lib/components/tables/PeriodTable.svelte';
	import PeriodEditModal from '$lib/components/modals/PeriodEditModal.svelte';

	const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);


	let newYear = $state(new Date().getFullYear());
	let newSemester = $state(1);
	let loading = $state(true);
    let editModalOpen = $state(false);
    let editingPeriod = $state<any>(null);

    const facultyID = Number(page.params.faculty_id);
	const subjectID = Number(page.params.subject_id);

	async function loadData() {
		try {
			await periodsStore.load(subjectID);
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function createPeriod() {
		try {
			await periodsStore.create(subjectID, Number(newYear), Number(newSemester));
		} catch (e) {
			alert(e);
		}
	}

    function startEdit(period: any) {
        editingPeriod = period;
        editModalOpen = true;
    }

    async function saveEdit(id: number, year: number, semester: number) {
        try {
            await periodsStore.updateItem(id, year, semester);
            editModalOpen = false;
        } catch (e) {
            alert(e);
        }
    }

    async function deletePeriod(id: number) {
        if (!confirm($t('periods.confirm_delete'))) return;
        try {
            await periodsStore.deleteItem(id);
        } catch (e) {
            alert(e);
        }
    }

	onMount(loadData);
</script>

<h2>{$t('periods.manage_periods_title')}</h2>
<p><a href="/faculties/{facultyID}/subjects" class="paper-btn btn-small">{$t('layout.back_to_subjects')}</a></p>

<div class="row">
	<div class="col-12 col">
		<div class="card">
			<div class="card-body">
				<h4 class="card-title">{$t('periods.new_period_card_title')}</h4>
				<div class="row">
					<div class="col-6 col">
						<div class="form-group">
							<label for="year">{$t('periods.year_label')}:</label>
							<input type="number" id="year" bind:value={newYear} class="input-block">
						</div>
					</div>
					<div class="col-6 col">
						<div class="form-group">
							<label for="semester">{$t('periods.semester_label')}:</label>
							<select id="semester" bind:value={newSemester} class="input-block">
								<option value={1}>{$t('periods.first_semester')}</option>
								<option value={2}>{$t('periods.second_semester')}</option>
							</select>
						</div>
					</div>
				</div>
				<button class="paper-btn btn-primary" onclick={createPeriod}>{$t('periods.create_period')}</button>
			</div>
		</div>
	</div>
</div>

{#if loading}
	<p>{$t('periods.loading_periods')}</p>
{:else}
	<PeriodTable 
        periods={periodsStore.items} 
        facultyId={facultyID} 
        subjectId={subjectID} 
        onEdit={startEdit} 
        onDelete={deletePeriod} 
    />
{/if}

<PeriodEditModal 
    isOpen={editModalOpen} 
    period={editingPeriod} 
    onSave={saveEdit} 
    onClose={() => editModalOpen = false} 
/>
