<script>
  import Button from "./Button.svelte";
  let { href, onclick, children } = $props();
</script>

<Button {href} {onclick}>
  {#snippet children()}
    {children}
  {/snippet}
</Button>
