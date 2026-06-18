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
</script>

{#if href}
  <a
    {href}
    class="sketch-border bg-primary text-on-primary paper-btn {className}"
    class:sketch-shadow-hover={withHover}
    data-test-id={testId}
    {...rest}
  >
    {@render children?.()}
  </a>
{:else}
  <button
    type="button"
    class="sketch-border bg-primary text-on-primary paper-btn {className}"
    class:sketch-shadow-hover={withHover}
    {onclick}
    data-test-id={testId}
    {...rest}
  >
    {@render children?.()}
  </button>
{/if}

<style>
  a {
    line-height: 1.15;
  }
</style>
