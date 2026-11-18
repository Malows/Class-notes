<script lang="ts">
  import type { Snippet } from "svelte";

  import Button from "$lib/client/components/common/Button.svelte";
  import Card from "$lib/client/components/common/Card.svelte";

  interface Props {
    condition: boolean;
    message: string;
    linkHref: string;
    linkText: string;
    children?: Snippet;
  }
  let { condition, message, linkHref, linkText, children }: Props = $props();
</script>

{#if condition}
  {@render children?.()}
{:else}
  <Card>
    <p class="m-0 text-body-md text-on-surface-variant">{message}</p>
    <Button href={linkHref} class="btn-primary mt-3">{linkText}</Button>
  </Card>
{/if}
