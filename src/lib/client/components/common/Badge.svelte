<script lang="ts">
  import type { Snippet } from "svelte";

  let { children, class: className = "" }: { children: Snippet; class?: string } = $props();
</script>

<span
  class="badge badge-sm rounded-[var(--radius-selector)] border-base-300 bg-base-200 font-sans text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-base-content/80 {className}"
>
  {@render children()}
</span>
