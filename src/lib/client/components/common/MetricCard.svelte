<script lang="ts">
  let {
    label,
    value,
    sublabel,
    icon,
    class: className = "",
  }: {
    label: string;
    value: string | number;
    sublabel?: string;
    icon?: string;
    class?: string;
  } = $props();
</script>

<div class="rounded-[var(--radius-box)] border border-base-300 bg-base-100 p-4 {className}">
  <div class="flex items-center justify-between gap-2">
    <p class="m-0 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-on-surface-variant">
      {label}
    </p>
    {#if icon}
      <span class="material-symbols-outlined text-[18px] text-on-surface-variant" aria-hidden="true"
        >{icon}</span
      >
    {/if}
  </div>
  <p class="mt-1 mb-0 font-sans text-headline-md font-medium tnum text-base-content">{value}</p>
  {#if sublabel}
    <p class="m-0 text-body-sm text-on-surface-variant">{sublabel}</p>
  {/if}
</div>
