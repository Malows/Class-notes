<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import { EnrollmentEntrySchema } from "$lib/common/schemas";
  import type { Person } from "$lib/common/types/enrollment";

  import DialogBase from "../common/DialogBase.svelte";
  import Button from "../common/Button.svelte";
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
        aria-describedby={validationError ? "error-person-name" : undefined}
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
        aria-invalid={!!serverError}
        aria-describedby={serverError ? "error-person-server" : undefined}
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
      <span
        id="error-person-server"
        class="form-error-msg"
        role="alert"
        data-test-id="person-server-error"
      >
        {serverError}
      </span>
    {/if}
  {/snippet}

  {#snippet footer()}
    <Button class="btn-ghost" testId="cancel-btn" onclick={onClose}>{$t("common.cancel")}</Button>
    <Button class="btn-primary" testId="submit-btn" onclick={handleSaveClick} disabled={saving}>
      {mode === "create" ? $t("common.create") : $t("common.save")}
    </Button>
  {/snippet}
</DialogBase>
