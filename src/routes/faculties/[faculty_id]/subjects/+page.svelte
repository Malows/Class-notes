<script lang="ts">
	import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { facultiesStore } from '$lib/stores/faculties.svelte';
    import { subjectsStore } from '$lib/stores/subjects.svelte';
	import GuardWrapper from '$lib/components/GuardWrapper.svelte';
    import SubjectTable from '$lib/components/SubjectTable.svelte';
    import SubjectModal from '$lib/components/modals/SubjectModal.svelte';

	let newSubjectName = $state('');
	let loading = $state(true);
    let editModalOpen = $state(false);
    let editingSubject = $state<any>(null);

    const facultyID = Number(page.params.faculty_id);

	async function loadData() {
		try {
			await Promise.all([
				facultiesStore.load(),
				subjectsStore.load()
			]);
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function createSubject() {
		if (!newSubjectName) return;
		try {
			await subjectsStore.create(facultyID, newSubjectName);
			newSubjectName = '';
		} catch (e) {
			alert(e);
		}
	}

    function startEdit(subject: any) {
        editingSubject = subject;
        editModalOpen = true;
    }

    async function saveEdit(newName: string) {
        if (!editingSubject) return;
        try {
            await subjectsStore.updateItem(editingSubject.id, newName);
            editModalOpen = false;
        } catch (e) {
            alert(e);
        }
    }

    async function deleteSubject(id: number) {
        if (!confirm('¿Borrar materia?')) return;
        try {
            await subjectsStore.deleteItem(id);
        } catch (e) {
            alert(e);
        }
    }

	onMount(loadData);
</script>

<h2>Gestión de Materias</h2>

<GuardWrapper 
    condition={facultiesStore.items.some(f => f.id === facultyID)} 
    message="La facultad seleccionada no existe o no pudo ser cargada." 
    linkHref="/faculties" 
    linkText="Volver a facultades"
>
    <div class="row">
        <div class="col-12 col">
            <div class="card">
                <div class="card-body">
                    <h4 class="card-title">Nueva Materia</h4>
                    <div class="form-group">
                        <label for="name">Nombre de la Materia:</label>
                        <input type="text" id="name" bind:value={newSubjectName} placeholder="Ej: Análisis Matemático I" class="input-block">
                    </div>
                    <button class="paper-btn btn-primary" onclick={createSubject}>Agregar</button>
                </div>
            </div>
        </div>
    </div>

    {#if loading}
        <p>Cargando materias...</p>
    {:else}
        <SubjectTable subjects={subjectsStore.items.filter(s => s.faculty_id === facultyID)} onEdit={startEdit} onDelete={deleteSubject} />
    {/if}
</GuardWrapper>

<SubjectModal 
    isOpen={editModalOpen} 
    mode="edit" 
    subject={editingSubject} 
    onSave={(name) => saveEdit(name)} 
    onClose={() => editModalOpen = false} 
/>
