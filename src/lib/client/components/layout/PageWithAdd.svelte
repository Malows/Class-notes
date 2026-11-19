<script lang="ts">
  import type { Snippet } from "svelte";

  import { t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";

  import CommonPage from "./CommonPage.svelte";

  let {
    title,
    addLabelKey = "common.add",
    onAdd,
    children,
  } = $props<{
    title: string;
    addLabelKey?: string;
    onAdd: () => void;
    children: () => Snippet;
  }>();
</script>

<CommonPage {title}>
  {#snippet extra()}
    <Button class="btn-primary" testId="add-btn" onclick={onAdd}>
      <span class="material-symbols-outlined text-[18px]" aria-hidden="true">add</span>
      {$t(addLabelKey)}
    </Button>
  {/snippet}

  {@render children()}
</CommonPage>
