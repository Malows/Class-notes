<script>
  import ResponsiveTable from "./ResponsiveTable.svelte";
</script>

<ResponsiveTable items={[{ id: 1, name: "Item 1" }]}>
  {#snippet header()}
    <th>Name</th>
  {/snippet}
  {#snippet row(item)}
    <td>{item.name}</td>
  {/snippet}
</ResponsiveTable>
