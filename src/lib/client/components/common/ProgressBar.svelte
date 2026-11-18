<script lang="ts">
  type Tone = "primary" | "success" | "warning" | "error";

  let {
    value,
    max = 100,
    tone = "primary",
    marker,
    label,
  }: { value: number; max?: number; tone?: Tone; marker?: number; label?: string } = $props();

  const percent = $derived(Math.max(0, Math.min(100, (value / max) * 100)));
  const markerPercent = $derived(marker !== undefined ? (marker / max) * 100 : null);

  const toneClass: Record<Tone, string> = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
  };
</script>

<div
  class="relative h-1.5 w-full overflow-hidden rounded-full bg-base-200"
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max}
  aria-label={label}
>
  <div class="h-full rounded-full {toneClass[tone]}" style="width: {percent}%"></div>
  {#if markerPercent !== null}
    <span
      class="absolute top-0 h-full w-px bg-base-content"
      style="left: {markerPercent}%"
      aria-hidden="true"
    ></span>
  {/if}
</div>
