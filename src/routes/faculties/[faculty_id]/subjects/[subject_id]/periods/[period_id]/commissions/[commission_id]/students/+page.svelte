<script lang="ts">
	import { onMount, getContext } from 'svelte';
	import { page } from '$app/state';
    import { StoreKey } from '$lib/types';
    import type { StudentsStore } from '$lib/stores/students.svelte';
    import StudentTable from '$lib/components/tables/StudentTable.svelte';
    import EditModal from '$lib/components/EditModal.svelte';

    const studentsStore = getContext<StudentsStore>(StoreKey.STUDENTS);

	let namesList = $state('');
	let singleName = $state('');
	let loading = $state(true);
    let editModalOpen = $state(false);
    let editingStudent = $state<any>(null);

    const facultyID = Number(page.params.faculty_id);
    const subjectID = Number(page.params.subject_id);
    const periodID = Number(page.params.period_id);
	const commissionID = Number(page.params.commission_id);

	async function loadData() {
		try {
			await studentsStore.load(commissionID);
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function saveStudents() {
		const namesToAdd: string[] = [];
		if (singleName.trim()) namesToAdd.push(singleName.trim());
		if (namesList.trim()) {
			namesList.split('\n').forEach(n => {
				if (n.trim()) namesToAdd.push(n.trim());
			});
		}

		if (namesToAdd.length === 0) return;

		try {
			await studentsStore.create(commissionID, namesToAdd);
			singleName = '';
			namesList = '';
		} catch (e) {
			alert(e);
		}
	}

    function startEdit(student: any) {
        editingStudent = student;
        editModalOpen = true;
    }

    async function saveEdit(newName: string) {
        if (!editingStudent) return;
        try {
            await studentsStore.updateItem(editingStudent.id, String(newName));
            editModalOpen = false;
        } catch (e) {
            alert(e);
        }
    }

	async function deleteStudent(id: number) {
		if (!confirm('¿Borrar alumno?')) return;
		try {
			await studentsStore.deleteItem(id);
		} catch (e) {
			alert(e);
		}
	}

	onMount(loadData);
</script>

<h2>Gestión de Alumnos</h2>
<p><a href="/faculties/{facultyID}/subjects/{subjectID}/periods/{periodID}/commissions" class="paper-btn btn-small">« Volver a Comisiones</a></p>

<div class="row">
	<div class="col-12 col">
		<div class="card">
			<div class="card-body">
				<h4 class="card-title">Carga de Alumnos</h4>
				<div class="form-group">
					<label for="names">Pegar lista (un nombre por línea):</label>
					<textarea id="names" bind:value={namesList} rows="5" class="input-block"></textarea>
				</div>
				<div class="form-group">
					<label for="single">O un solo nombre:</label>
					<input type="text" id="single" bind:value={singleName} class="input-block">
				</div>
				<button class="paper-btn btn-primary" onclick={saveStudents}>Guardar Alumnos</button>
			</div>
		</div>
	</div>
</div>

{#if loading}
	<p>Cargando alumnos...</p>
{:else}
    <StudentTable students={studentsStore.items} onEdit={startEdit} onDelete={deleteStudent} />
{/if}

<EditModal 
    isOpen={editModalOpen} 
    title="Editar Alumno" 
    value={editingStudent?.name || ''} 
    onSave={saveEdit} 
    onClose={() => editModalOpen = false} 
/>
