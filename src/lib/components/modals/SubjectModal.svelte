<script lang="ts">
  import { t } from "$lib/i18n/config";
  import type { Subject } from "$lib/types";
  import DialogBase from "../common/DialogBase.svelte";
  import ErrorSpan from "../common/ErrorSpan.svelte";
  import { useFormValidation } from "$lib/composables/useFormValidation.svelte";
  import { CreateSubjectSchema } from "$lib/schemas/dto.schema";

  interface Props {
    isOpen: boolean;
    mode: "create" | "edit";
    subject: Subject | null;
    onSave: (name: string, id?: number) => void;
    onClose: () => void;
  }

  let { isOpen, mode, subject, onSave, onClose }: Props = $props();

  let name = $state("");

  const validator = useFormValidation(CreateSubjectSchema);

  $effect(() => {
    if (isOpen) {
      name = mode === "edit" && subject ? subject.name : "";
      validator.clear();
    }
  });

  function handleSaveClick() {
    const isValid = validator.validate({
      faculty_id: subject?.faculty_id || 1, // Satisfies schema requirements
      name,
    });
    if (isValid) {
      onSave(name, subject?.id);
    }
  }
</script>

<DialogBase
  {isOpen}
  title={mode === "create" ? $t("subjects.new_title") : $t("subjects.edit_title")}
  {onClose}
>
  {#snippet children()}
    <div class="form-group">
      <label for="subject-name">{$t("subjects.name_label")}</label>
      <input
        type="text"
        id="subject-name"
        bind:value={name}
        placeholder={$t("subjects.placeholder")}
        class="input-block"
        aria-invalid={!!validator.errors.name}
        aria-describedby={validator.errors.name ? "error-subject-name" : undefined}
        oninput={() => {
          if (validator.errors.name) validator.errors.name = "";
        }}
        data-test-id="subject-name-input"
      />
      <ErrorSpan
        message={validator.errors.name}
        id="error-subject-name"
        testId="subject-name-error"
      />
    </div>
  {/snippet}

  {#snippet footer()}
    <button class="paper-btn" data-test-id="cancel-btn" onclick={onClose}
      >{$t("common.cancel")}</button
    >
    <button class="paper-btn btn-secondary" data-test-id="submit-btn" onclick={handleSaveClick}>
      {mode === "create" ? $t("common.create") : $t("common.save")}
    </button>
  {/snippet}
</DialogBase>
