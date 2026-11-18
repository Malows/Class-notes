<script lang="ts">
  import type { Snippet } from "svelte";

  type Tone = "neutral" | "primary" | "success" | "warning" | "error" | "info" | "pending";

  let {
    tone = "neutral",
    dot = false,
    class: className = "",
    testId,
    children,
  }: { tone?: Tone; dot?: boolean; class?: string; testId?: string; children: Snippet } = $props();

  const toneClass: Record<Tone, string> = {
    neutral: "border-base-300 bg-base-200 text-base-content/80",
    primary: "border-primary/30 bg-primary/10 text-primary",
    success: "border-success/30 bg-success/10 text-success",
    warning: "border-warning/30 bg-warning/10 text-warning",
    error: "border-error/30 bg-error/10 text-error",
    info: "border-info/30 bg-info/10 text-info",
    pending: "border-base-300 bg-base-200 text-base-content/70",
  };
</script>

<span
  class="inline-flex items-center gap-1.5 rounded-[var(--radius-selector)] border px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] {toneClass[
    tone
  ]} {className}"
  data-test-id={testId}
>
  {#if dot}
    <span class="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true"></span>
  {/if}
  {@render children()}
</span>
