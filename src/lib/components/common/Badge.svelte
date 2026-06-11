<script lang="ts">
    import type { Snippet } from 'svelte';

    let { children }: { children: Snippet } = $props();
</script>

<span class="sketch-border px-2 py-1 text-label-sm bg-surface-container">
    {@render children()}
</span>
