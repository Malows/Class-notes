<script lang="ts">
  import { useNavigationGuard } from "../useNavigationGuard.svelte";

  interface Props {
    isDirty: () => boolean;
    save: () => Promise<boolean>;
  }

  let { isDirty, save }: Props = $props();

  const guard = useNavigationGuard({ isDirty: () => isDirty(), save: () => save() });
</script>

<div data-test-id="guard-open">{guard.open ? "open" : "closed"}</div>
<div data-test-id="guard-saving">{guard.saving ? "saving" : "idle"}</div>
<button type="button" data-test-id="guard-stay" onclick={guard.stay}>stay</button>
<button type="button" data-test-id="guard-discard" onclick={guard.discardAndLeave}>discard</button>
<button type="button" data-test-id="guard-save" onclick={() => void guard.saveAndLeave()}>save</button>
