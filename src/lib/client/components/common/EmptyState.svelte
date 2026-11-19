<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    /** Decorative glyph that hints at the missing resource. */
    icon?: string;
    title: string;
    description?: string;
    testId?: string;
    /** One or two actions that move the user forward. */
    actions?: Snippet;
  }

  let { icon, title, description, testId, actions }: Props = $props();
</script>

<div class="card empty-state" data-test-id={testId}>
  <div class="card-body empty-state__body">
    {#if icon}
      <p class="empty-state__icon" aria-hidden="true">{icon}</p>
    {/if}
    <h4 class="empty-state__title">{title}</h4>
    {#if description}
      <p class="empty-state__description">{description}</p>
    {/if}
    {#if actions}
      <div class="empty-state__actions">
        {@render actions()}
      </div>
    {/if}
  </div>
</div>

<style>
  .empty-state {
    margin-top: 1.5rem;
  }

  .empty-state:hover {
    transform: none;
  }

  .empty-state__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
  }

  .empty-state__icon {
    margin: 0;
    font-size: 2rem;
    line-height: 1;
  }

  .empty-state__title {
    margin: 0;
  }

  .empty-state__description {
    margin: 0;
    color: var(--muted-color);
  }

  .empty-state__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
</style>
