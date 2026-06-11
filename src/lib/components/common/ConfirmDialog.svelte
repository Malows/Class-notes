<script lang="ts">
    import DialogBase from './DialogBase.svelte';

    interface Props {
        isOpen: boolean;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
        onClose: () => void;
    }

    let { 
        isOpen, 
        title, 
        message, 
        confirmText = 'Confirm', 
        cancelText = 'Cancel', 
        onConfirm, 
        onClose 
    }: Props = $props();
</script>

<DialogBase {isOpen} {title} {onClose}>
    {#snippet children()}
        <p>{message}</p>
    {/snippet}
    
    {#snippet footer()}
        <button class="paper-btn" onclick={onClose}>{cancelText}</button>
        <button class="btn-danger" onclick={onConfirm}>{confirmText}</button>
    {/snippet}
</DialogBase>
