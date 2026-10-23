<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import { EnrollmentEntrySchema } from "$lib/common/schemas";
  import type { Person } from "$lib/common/types/enrollment";

  import DialogBase from "../common/DialogBase.svelte";
  import ErrorSpan from "../common/ErrorSpan.svelte";

  interface Props {
    isOpen: boolean;
    mode: "create" | "edit";
    person: Person | null;
    onSave: (name: string, legajo: string) => Promise<void> | void;
    onClose: () => void;
  }

  let { isOpen, mode, person, onSave, onClose }: Props = $props();

  let name = $state("");
  let legajo = $state("");
  let validationError = $state("");
  let serverError = $state("");
  let saving = $state(false);

  $effect(() => {
    if (isOpen) {
      name = mode === "edit" && person ? person.name : "";
      legajo = mode === "edit" && person ? (person.legajo ?? "") : "";
      validationError = "";
      serverError = "";
      saving = false;
    }
  });

  async function handleSaveClick() {
    validationError = "";
    serverError = "";

    const parsed = EnrollmentEntrySchema.safeParse({ name, legajo });
    if (!parsed.success) {
      validationError = parsed.error.issues[0]?.message ?? "";
      return;
    }

    saving = true;
    try {
      await onSave(name.trim(), legajo.trim());
    } catch (e: any) {
      serverError = e?.message || String(e);
    } finally {
      saving = false;
    }
  }
</script>

<DialogBase
  {isOpen}
  title={mode === "create" ? $t("persons.new_title") : $t("persons.edit_title")}
  {onClose}
>
  {#snippet children()}
    <div class="form-group">
      <label for="person-name">{$t("persons.name_label")}</label>
      <input
        type="text"
        id="person-name"
        bind:value={name}
        placeholder={$t("persons.name_placeholder")}
        class="input-block"
        aria-invalid={!!validationError}
        oninput={() => (validationError = "")}
        data-test-id="person-name-input"
      />
    </div>

    <div class="form-group">
      <label for="person-legajo">{$t("persons.legajo_label")}</label>
      <input
        type="text"
        id="person-legajo"
        bind:value={legajo}
        placeholder={$t("persons.legajo_placeholder")}
        class="input-block"
        oninput={() => (serverError = "")}
        data-test-id="person-legajo-input"
      />
    </div>

    <ErrorSpan
      message={validationError}
      id="error-person-name"
      testId="person-validation-error"
    />

    {#if serverError}
      <span class="text-danger form-error-msg" role="alert" data-test-id="person-server-error">
        {serverError}
      </span>
    {/if}
  {/snippet}

  {#snippet footer()}
    <button class="paper-btn" data-test-id="cancel-btn" onclick={onClose}>
      {$t("common.cancel")}
    </button>
    <button
      class="paper-btn btn-secondary"
      data-test-id="submit-btn"
      onclick={handleSaveClick}
      disabled={saving}
    >
      {mode === "create" ? $t("common.create") : $t("common.save")}
    </button>
  {/snippet}
</DialogBase>

<style>
  .form-error-msg {
    display: block;
    margin-top: 0.25rem;
    font-weight: bold;
    font-size: 0.9em;
  }
</style>
