<script lang="ts">
  let {
    name,
    size = "md",
  }: { name: string; size?: "sm" | "md" | "lg" } = $props();

  const initials = $derived(
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join(""),
  );

  const sizeClass = {
    sm: "h-8 w-8 text-label-sm",
    md: "h-9 w-9 text-label-md",
    lg: "h-12 w-12 text-title-md",
  } as const;
</script>

<span
  class="inline-flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary {sizeClass[
    size
  ]}"
  aria-hidden="true"
>
  {initials}
</span>
