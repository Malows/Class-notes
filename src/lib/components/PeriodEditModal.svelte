<script lang="ts">
    import type { Period } from '$lib/types';
    interface Props {
        isOpen: boolean;
        period: Period | null;
        onSave: (id: number, year: number, semester: number) => void;
        onClose: () => void;
    }
    let { isOpen, period, onSave, onClose }: Props = $props();
    
    let year = $state(new Date().getFullYear());
    let semester = $state(1);

    $effect(() => {
        if (period) {
            year = period.year;
            semester = period.semester;
        }
    });
</script>

{#if isOpen && period}
    <div class="modal">
        <div class="card">
            <div class="card-header">
                Editar Periodo
            </div>
            <div class="card-body">
                <div class="form-group">
                    <label for="edit-year">Año:</label>
                    <input type="number" id="edit-year" bind:value={year} class="input-block">
                </div>
                <div class="form-group">
                    <label for="edit-semester">Cuatrimestre:</label>
                    <select id="edit-semester" bind:value={semester} class="input-block">
                        <option value={1}>1º Cuatrimestre</option>
                        <option value={2}>2º Cuatrimestre</option>
                    </select>
                </div>
                <div style="margin-top: 10px;">
                    <button class="paper-btn btn-primary" onclick={() => onSave(period.id, Number(year), Number(semester))}>Guardar</button>
                    <button class="paper-btn" onclick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
</style>
