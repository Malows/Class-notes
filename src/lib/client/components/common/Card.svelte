<script lang="ts">
  import type { Snippet } from "svelte";

  let { children, class: className }: { children: Snippet; class?: string } = $props();
</script>

<div
  class="card rounded-[var(--radius-box)] border border-base-300 bg-base-100 {className}"
>
  <div class="card-body gap-3 p-4">
    {@render children()}
  </div>
</div>
