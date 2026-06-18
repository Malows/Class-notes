<script lang="ts">
  import { t } from "$lib/i18n/config";
  import type { Snippet } from "svelte";

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
    <button data-test-id="add-btn" class="paper-btn btn-primary-outline" onclick={onAdd}>
      + {$t(addLabelKey)}
    </button>
  {/snippet}

  {@render children()}
</CommonPage>
