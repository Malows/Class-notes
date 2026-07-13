<script>
  import Card from "./Card.svelte";
</script>

<Card>
  {#snippet children()}
    Card Content
  {/snippet}
</Card>
