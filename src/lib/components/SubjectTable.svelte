<script lang="ts">
	import type { Subject } from '$lib/types';
    import Card from '$lib/components/common/Card.svelte';
    import Button from '$lib/components/common/Button.svelte';

    interface Props {
        subjects: Subject[];
        onEdit: (s: Subject) => void;
        onDelete: (id: number) => void;
    }
    let { subjects, onEdit, onDelete }: Props = $props();
</script>

<Card>
    <h4 class="card-title">Materias</h4>
    
    <!-- Desktop Table -->
    <table class="table-hover hidden md:block">
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Facultad</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {#each subjects as subject}
                <tr>
                    <td>{subject.name}</td>
                    <td>{subject.faculty_name}</td>
                    <td>
                        <Button href="/faculties/{subject.faculty_id}/subjects/{subject.id}/periods">Ver periodos</Button>
                        <Button onclick={() => onEdit(subject)}>Editar</Button>
                        <Button onclick={() => onDelete(subject.id)}>Borrar</Button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-2">
        {#each subjects as subject}
            <Card>
                <strong>{subject.name}</strong><br>
                <small>{subject.faculty_name}</small>
                <div class="flex gap-2 mt-2">
                    <Button href="/faculties/{subject.faculty_id}/subjects/{subject.id}/periods">Ver</Button>
                    <Button onclick={() => onEdit(subject)}>Editar</Button>
                    <Button onclick={() => onDelete(subject.id)}>Borrar</Button>
                </div>
            </Card>
        {/each}
    </div>
</Card>
