<script lang="ts">
  import type { Snippet } from "svelte";

  import { t } from "$lib/common/i18n/config";

  interface Props {
    /** The single action a row shows directly. */
    primary?: Snippet;
    /** Non-destructive actions shown inside the disclosure. */
    overflow?: Snippet;
    /** Destructive actions, rendered after a separator. */
    destructive?: Snippet;
    /** Accessible name of the row this disclosure belongs to. */
    label?: string;
    testId?: string;
  }

  let { primary, overflow, destructive, label, testId }: Props = $props();

  const disclosureLabel = $derived(
    label ? `${$t("layout.more_actions")} — ${label}` : $t("layout.more_actions"),
  );

  // Close the disclosure after picking an action so the next interaction
  // starts from the row again. An action keeps the menu container inert,
  // unlike a click handler on a non-interactive div.
  function closeOnAction(node: HTMLElement) {
    function handleClick(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest("a, button")) return;
      const details = node.closest("details");
      if (details) details.open = false;
    }

    node.addEventListener("click", handleClick);
    return {
      destroy() {
        node.removeEventListener("click", handleClick);
      },
    };
  }
</script>

<div class="row-actions">
  {#if primary}
    <div class="row-actions__primary">
      {@render primary()}
    </div>
  {/if}

  {#if overflow || destructive}
    <details class="row-actions__disclosure" data-test-id={testId}>
      <summary class="btn btn-ghost btn-sm btn-circle row-actions__summary" aria-label={disclosureLabel}>
        ⋯
      </summary>
      <div
        class="row-actions__menu"
        role="group"
        aria-label={disclosureLabel}
        use:closeOnAction
      >
        {@render overflow?.()}
        {#if overflow && destructive}
          <hr class="row-actions__separator" />
        {/if}
        {@render destructive?.()}
      </div>
    </details>
  {/if}
</div>

<style>
  .row-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .row-actions__primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .row-actions__disclosure {
    position: relative;
  }

  .row-actions__summary {
    list-style: none;
    line-height: 1;
  }

  .row-actions__summary::-webkit-details-marker {
    display: none;
  }

  .row-actions__summary::marker {
    content: "";
  }

  .row-actions__menu {
    position: absolute;
    right: 0;
    top: calc(100% + 0.35rem);
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 11rem;
    padding: 0.5rem;
    background-color: var(--color-surface-container-lowest);
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-box);
  }

  .row-actions__menu :global(.btn) {
    width: 100%;
    justify-content: flex-start;
    margin: 0;
    text-align: left;
  }

  .row-actions__separator {
    width: 100%;
    margin: 0.25rem 0;
    border: 0;
    border-top: 1px solid var(--color-outline-variant);
  }

  @media (pointer: coarse) {
    .row-actions__summary {
      min-height: 44px;
      min-width: 44px;
    }
  }
</style>
