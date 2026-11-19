<script lang="ts">
  interface Props {
    id: string;
    label: string;
    checked: boolean;
    onToggle: () => void;
  }

  let { id, label, checked, onToggle }: Props = $props();
</script>

<label for={id} class="flex w-full cursor-pointer items-center gap-2">
  <input
    type="checkbox"
    class="checkbox checkbox-sm"
    name="subject-checks"
    {id}
    {checked}
    onchange={onToggle}
  />
  <span class="text-body-sm">{label}</span>
</label>
