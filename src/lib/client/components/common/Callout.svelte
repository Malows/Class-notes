<script lang="ts">
  import type { Snippet } from "svelte";

  type Tone = "info" | "warning" | "error";

  let {
    tone = "info",
    title,
    children,
  }: { tone?: Tone; title?: string; children: Snippet } = $props();

  const toneClass: Record<Tone, string> = {
    info: "border-info/30 bg-info/10 text-info",
    warning: "border-warning/30 bg-warning/10 text-warning",
    error: "border-error/30 bg-error/10 text-error",
  };
</script>

<div class="rounded-[var(--radius-box)] border px-3 py-2 text-body-sm {toneClass[tone]}">
  {#if title}
    <p class="m-0 font-medium">{title}</p>
  {/if}
  {@render children()}
</div>
