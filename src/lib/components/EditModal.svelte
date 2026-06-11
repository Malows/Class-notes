<script lang="ts">
    interface Props {
        isOpen: boolean;
        title: string;
        value: string | number;
        onSave: (value: string | number) => void;
        onClose: () => void;
    }
    let { isOpen, title, value = $bindable(), onSave, onClose }: Props = $props();
</script>

{#if isOpen}
    <div class="modal">
        <div class="card">
            <div class="card-header">
                {title}
            </div>
            <div class="card-body">
                <input type="text" bind:value={value} class="input-block">
                <div style="margin-top: 10px;">
                    <button class="paper-btn btn-primary" onclick={() => onSave(value)}>Guardar</button>
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