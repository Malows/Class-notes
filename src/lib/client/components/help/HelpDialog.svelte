<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";
  import DialogBase from "$lib/client/components/common/DialogBase.svelte";

  let isOpen = $state(false);

  function close() {
    isOpen = false;
  }
</script>

<!--
  A help surface that sits in the shell and never navigates: the teacher keeps
  the grid, the take card or the form behind the dialog. The trigger is a
  drawn question mark rather than an icon-font ligature, so it survives a
  subset build of Material Symbols.
-->
<button
  type="button"
  class="btn btn-ghost btn-sm btn-circle"
  onclick={() => (isOpen = true)}
  aria-label={$t("help.trigger")}
  aria-haspopup="dialog"
  aria-expanded={isOpen}
  data-test-id="help-trigger"
>
  <span class="help-trigger__glyph" aria-hidden="true">?</span>
</button>

<DialogBase isOpen={isOpen} title={$t("help.title")} onClose={close}>
  <div class="help" data-test-id="help-content">
    <section class="help__section">
      <h3 class="help__heading">{$t("help.attendance_title")}</h3>
      <p class="help__text">{$t("help.attendance_body")}</p>
    </section>

    <section class="help__section">
      <h3 class="help__heading">{$t("help.shortcuts_title")}</h3>
      <ul class="help__shortcuts">
        <li class="help__shortcut">
          <kbd class="help__key">→</kbd>
          <span>{$t("help.shortcut_present")}</span>
        </li>
        <li class="help__shortcut">
          <kbd class="help__key">←</kbd>
          <span>{$t("help.shortcut_absent")}</span>
        </li>
        <li class="help__shortcut">
          <kbd class="help__key">↑</kbd>
          <span>{$t("help.shortcut_skip")}</span>
        </li>
        <li class="help__shortcut">
          <kbd class="help__key">Ctrl+Z</kbd>
          <span>{$t("help.shortcut_undo")}</span>
        </li>
      </ul>
    </section>

    <section class="help__section">
      <h3 class="help__heading">{$t("help.summary_title")}</h3>
      <p class="help__text">{$t("help.summary_body")}</p>
    </section>

    <section class="help__section">
      <h3 class="help__heading">{$t("help.ai_title")}</h3>
      <p class="help__text">{$t("help.ai_body")}</p>
    </section>

    <section class="help__section">
      <h3 class="help__heading">{$t("help.roster_title")}</h3>
      <p class="help__text">{$t("help.roster_body")}</p>
    </section>
  </div>

  {#snippet footer()}
    <Button class="btn-ghost" testId="help-close-btn" onclick={close}>{$t("help.close")}</Button>
  {/snippet}
</DialogBase>

<style>
  .help-trigger__glyph {
    font-family: var(--font-sans);
    font-size: 0.9375rem;
    font-weight: 600;
    line-height: 1;
  }

  .help {
    display: grid;
    gap: 0.875rem;
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 0.25rem;
  }

  .help__section {
    display: grid;
    gap: 0.25rem;
  }

  .help__heading {
    margin: 0;
    font-size: var(--text-headline-sm);
    line-height: 1.5rem;
  }

  .help__text {
    margin: 0;
    font-size: 0.8125rem;
    line-height: 1.25rem;
    color: var(--color-on-surface-variant);
  }

  .help__shortcuts {
    display: grid;
    gap: 0.375rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .help__shortcut {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8125rem;
    line-height: 1.25rem;
    color: var(--color-on-surface-variant);
  }

  .help__key {
    display: inline-flex;
    min-width: 1.75rem;
    height: 1.5rem;
    align-items: center;
    justify-content: center;
    padding: 0 0.3125rem;
    border: 1px solid var(--color-outline);
    border-radius: var(--radius-field);
    background-color: var(--color-surface-container-low);
    color: var(--color-on-surface);
    font-family: var(--font-sans);
    font-size: 0.8125rem;
    font-weight: 600;
    line-height: 1;
  }

  @media (pointer: coarse) {
    .help__key {
      min-width: 2rem;
      height: 2rem;
    }
  }
</style>
