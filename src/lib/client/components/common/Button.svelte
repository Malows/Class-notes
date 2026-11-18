<script lang="ts">
  import type { HTMLButtonAttributes, HTMLAnchorAttributes } from "svelte/elements";

  interface Props extends Omit<HTMLButtonAttributes, keyof HTMLAnchorAttributes> {
    href?: string;
    testId?: string;
    class?: string;
    withHover?: boolean;
    onclick?: (event: MouseEvent) => void;
    children?: () => any;
  }

  let {
    href,
    onclick,
    children,
    testId,
    withHover = false,
    class: className = "",
    ...rest
  }: Props = $props();

  // The migration keeps the old class vocabulary working while pages move to
  // the editorial primitives. Map complete class names so Tailwind can see
  // every generated utility.
  const legacyClassMap: Record<string, string> = {
    "btn-small": "btn-sm",
    "btn-danger": "btn-error",
    "btn-primary-outline": "btn-outline btn-primary",
    "btn-secondary-outline": "btn-outline btn-secondary",
    "btn-close": "btn-ghost btn-circle",
  };

  const classes = $derived(
    [
      "btn h-8 min-h-8 rounded-[var(--radius-field)]",
      withHover ? "transition-colors" : "",
      ...className
        .split(/\s+/)
        .filter(Boolean)
        .map((name) => legacyClassMap[name] ?? name),
    ]
      .filter(Boolean)
      .join(" "),
  );
</script>

{#if href}
  <a {href} class={classes} data-test-id={testId} {...rest}>
    {@render children?.()}
  </a>
{:else}
  <button type="button" class={classes} {onclick} data-test-id={testId} {...rest}>
    {@render children?.()}
  </button>
{/if}
