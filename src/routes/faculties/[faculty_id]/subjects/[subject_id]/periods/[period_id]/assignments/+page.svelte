<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { page } from '$app/state';
    
    import { t } from '$lib/i18n/config';
    import { StoreKey } from '$lib/types';
    import type { AssignmentsStore } from '$lib/stores/assignments.svelte';
    import AssignmentTable from '$lib/components/tables/AssignmentTable.svelte';
    import AssignmentModal from '$lib/components/modals/AssignmentModal.svelte';

    const assignmentsStore = getContext<AssignmentsStore>(StoreKey.ASSIGNMENTS);

	let newTitle = $state('');
	let loading = $state(true);
    let editModalOpen = $state(false);
    let editingAssignment = $state<any>(null);

    const facultyID = Number(page.params.faculty_id);
    const subjectID = Number(page.params.subject_id);
	const periodID = Number(page.params.period_id);

	async function loadData() {
		try {
			await assignmentsStore.load(periodID);
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function createAssignment() {
		if (!newTitle) return;
		try {
			await assignmentsStore.create(periodID, newTitle);
			newTitle = '';
		} catch (e) {
			alert(e);
		}
	}

    function startEdit(assignment: any) {
        editingAssignment = assignment;
        editModalOpen = true;
    }

    async function saveEdit(newTitle: string) {
        if (!editingAssignment) return;
        try {
            await assignmentsStore.updateItem(editingAssignment.id, String(newTitle));
            editModalOpen = false;
        } catch (e) {
            alert(e);
        }
    }

	async function deleteAssignment(id: number) {
		if (!confirm($t('assignments.confirm_delete'))) return;
		try {
			await assignmentsStore.deleteItem(id);
		} catch (e) {
			alert(e);
		}
	}

	onMount(loadData);
</script>

<h2>{$t('assignments.manage_assignments_title')}</h2>
<p><a href="/faculties/{facultyID}/subjects/{subjectID}/periods" class="paper-btn btn-small">{$t('layout.back_to_periods')}</a></p>

<div class="row">
	<div class="col-12 col">
		<div class="card">
			<div class="card-body">
				<h4 class="card-title">{$t('assignments.new_title')}</h4>
				<div class="form-group">
					<label for="title">{$t('assignments.title_label')}:</label>
					<input type="text" id="title" bind:value={newTitle} placeholder={$t('assignments.placeholder')} class="input-block">
				</div>
				<button class="paper-btn btn-primary" onclick={createAssignment}>{$t('assignments.add_assignment')}</button>
			</div>
		</div>
	</div>
</div>

{#if loading}
	<p>{$t('assignments.loading_assignments')}</p>
{:else}
    <AssignmentTable
		assignments={assignmentsStore.items}
		onEdit={startEdit}
		onDelete={deleteAssignment}
	/>
{/if}

<AssignmentModal 
    isOpen={editModalOpen} 
    mode="edit" 
    assignment={editingAssignment} 
    onSave={(title) => saveEdit(title)} 
    onClose={() => editModalOpen = false} 
/>
