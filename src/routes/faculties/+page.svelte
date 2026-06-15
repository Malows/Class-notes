<script lang="ts">
	import { onMount, getContext } from 'svelte';
    
    import { t } from '$lib/i18n/config';
    import { StoreKey } from '$lib/types';
    import type { Faculty, ModalMode } from '$lib/types';
    import type { FacultiesStore } from '$lib/stores/faculties.svelte';
	
    import PageWithAdd from '$lib/components/layout/PageWithAdd.svelte';
    import FacultyTable from '$lib/components/tables/FacultyTable.svelte';
    import FacultyModal from '$lib/components/modals/FacultyModal.svelte';
    import ConfirmDialog from '$lib/components/common/ConfirmDialog.svelte';

    const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);

	let loading = $state(true);
    let modalMode = $state<ModalMode>(null);
    let activeFaculty = $state<Faculty | null>(null);

	async function load() {
		try {
			await facultiesStore.load();
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

    async function handleSave(name: string, id?: number) {
        try {
            if (modalMode === 'create') {
                await facultiesStore.create(name);
            } else if (modalMode === 'edit' && id) {
                await facultiesStore.updateItem(id, name);
            }
            modalMode = null;
            activeFaculty = null;
        } catch (e) {
            alert(e);
        }
    }

    async function handleDelete() {
        if (!activeFaculty) return;
        try {
            await facultiesStore.deleteItem(activeFaculty.id);
            modalMode = null;
            activeFaculty = null;
        } catch (e) {
            alert(e);
        }
    }

    function openCreate() {
        modalMode = 'create';
        activeFaculty = null;
    }

    function openEdit(faculty: Faculty) {
        modalMode = 'edit';
        activeFaculty = faculty;
    }

    function openDelete(faculty: Faculty) {
        modalMode = 'delete';
        activeFaculty = faculty;
    }

	onMount(load);
</script>

<PageWithAdd title={$t('faculties.title')} onAdd={openCreate}>
    {#if loading}
        <p>{$t('faculties.loading')}</p>
    {:else}
        <FacultyTable faculties={facultiesStore.items} onEdit={openEdit} onDelete={openDelete} />
    {/if}

    <FacultyModal 
        isOpen={modalMode === 'create' || modalMode === 'edit'}
        mode={modalMode === 'create' ? 'create' : 'edit'}
        faculty={activeFaculty}
        onSave={handleSave}
        onClose={() => modalMode = null}
    />

    <ConfirmDialog 
        isOpen={modalMode === 'delete'}
        title={$t('faculties.confirm_delete_title')}
        message={$t('faculties.confirm_delete_message', { name: activeFaculty?.name || '' })}
        onConfirm={handleDelete}
        onClose={() => modalMode = null}
    />
</PageWithAdd>
