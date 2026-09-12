<script lang="ts">
  interface Props {
    id: string;
    label: string;
    checked: boolean;
    onToggle: () => void;
  }

  let { id, label, checked, onToggle }: Props = $props();
</script>

<label for={id} class="paper-check row gap-2 items-center checkbox-input">
  <input
    type="checkbox"
    name="subject-checks"
    {id}
    {checked}
    onchange={onToggle}
  />
  <span>{label}</span>
</label>

<style>
  .checkbox-input {
    width: 100%;
  }
</style>
