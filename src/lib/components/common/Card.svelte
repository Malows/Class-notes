<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children }: { children: Snippet } = $props();
</script>

<div class="sketch-border sketch-shadow p-stack-md bg-surface-container-lowest">
    {@render children()}
</div>

<style>
    div {
        padding: 1rem 0.5rem;
    }
</style>
