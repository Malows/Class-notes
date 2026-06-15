<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children, class: className }: { children: Snippet, class?: string } = $props();
</script>

<div class="sketch-border sketch-shadow p-stack-md bg-surface-container-lowest {className}">
    {@render children()}
</div>

<style>
    div {
        padding: 1rem 0.5rem;
    }
</style>
