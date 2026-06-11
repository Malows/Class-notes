<script lang="ts">
	import { onMount, getContext } from 'svelte';

    import { t } from '$lib/i18n/config';
    import { StoreKey } from '$lib/types';
    
	import CommonPage from '$lib/components/layout/CommonPage.svelte';
    import type { FacultiesStore } from '$lib/stores/faculties.svelte';
    import FacultyTable from '$lib/components/tables/FacultyTable.svelte';
    import EditModal from '$lib/components/EditModal.svelte';

    

    const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);

	let newFacultyName = $state('');
	let loading = $state(true);
    let editModalOpen = $state(false);
    let editingFaculty = $state<any>(null);

	async function load() {
		try {
			await facultiesStore.load();
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function create() {
		if (!newFacultyName) return;
		try {
			await facultiesStore.create(newFacultyName);
			newFacultyName = '';
		} catch (e) {
			alert(e);
		}
	}

    function startEdit(faculty: any) {
        editingFaculty = faculty;
        editModalOpen = true;
    }

    async function saveEdit(newName: string | number) {
        if (!editingFaculty) return;
        try {
            await facultiesStore.updateItem(editingFaculty.id, String(newName));
            editModalOpen = false;
        } catch (e) {
            alert(e);
        }
    }

    async function deleteFaculty(id: number) {
        if (!confirm($t('faculties.confirm_delete'))) return;
        try {
            await facultiesStore.deleteItem(id);
        } catch (e) {
            alert(e);
        }
    }

	onMount(load);
</script>

<CommonPage title={$t('faculties.title')}>
<div class="row">
	<div class="col-12 col">
		<div class="card">
			<div class="card-body">
				<h4 class="card-title">{$t('faculties.new_faculty')}</h4>
				<div class="form-group">
					<label for="name">{$t('faculties.faculty_name_label')}</label>
					<input type="text" id="name" bind:value={newFacultyName} placeholder={$t('faculties.faculty_placeholder')} class="input-block">
				</div>
				<button class="paper-btn btn-primary" onclick={create}>{$t('faculties.add')}</button>
			</div>
		</div>
	</div>
</div>

{#if loading}
	<p>{$t('faculties.loading')}</p>
{:else}
    <FacultyTable faculties={facultiesStore.items} onEdit={startEdit} onDelete={deleteFaculty} />
{/if}

<EditModal 
    isOpen={editModalOpen} 
    title={$t('faculties.edit_title')} 
    value={editingFaculty?.name || ''} 
    onSave={saveEdit} 
    onClose={() => editModalOpen = false} 
/>
</CommonPage>
