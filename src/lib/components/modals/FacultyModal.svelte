<script lang="ts">
  import { t } from "$lib/i18n/config";
  import type { Faculty } from "$lib/types";
  import DialogBase from "../common/DialogBase.svelte";
  import ErrorSpan from "../common/ErrorSpan.svelte";
  import { useFormValidation } from "$lib/composables/useFormValidation.svelte";
  import { CreateFacultySchema } from "$lib/schemas/dto.schema";

  interface Props {
    isOpen: boolean;
    mode: "create" | "edit";
    faculty: Faculty | null;
    onSave: (name: string, id?: number) => void;
    onClose: () => void;
  }

  let { isOpen, mode, faculty, onSave, onClose }: Props = $props();

  let name = $state("");

  const validator = useFormValidation(CreateFacultySchema);

  $effect(() => {
    if (isOpen) {
      name = mode === "edit" && faculty ? faculty.name : "";
      validator.clear();
    }
  });

  function handleSaveClick() {
    const isValid = validator.validate({ name });
    if (isValid) {
      onSave(name, faculty?.id);
    }
  }
</script>

<DialogBase
  {isOpen}
  title={mode === "create" ? $t("faculties.new_faculty") : $t("faculties.edit_title")}
  {onClose}
>
  {#snippet children()}
    <div class="form-group">
      <label for="faculty-name">{$t("faculties.faculty_name_label")}</label>
      <input
        type="text"
        id="faculty-name"
        bind:value={name}
        placeholder={$t("faculties.faculty_placeholder")}
        class="input-block"
        aria-invalid={!!validator.errors.name}
        aria-describedby={validator.errors.name ? "error-faculty-name" : undefined}
        oninput={() => {
          if (validator.errors.name) validator.errors.name = "";
        }}
        data-test-id="faculty-name-input"
      />
      <ErrorSpan
        message={validator.errors.name}
        id="error-faculty-name"
        testId="faculty-name-error"
      />
    </div>
  {/snippet}

  {#snippet footer()}
    <button class="paper-btn" onclick={onClose} data-test-id="modal-cancel-btn"
      >{$t("common.cancel")}</button
    >
    <button class="paper-btn btn-secondary" onclick={handleSaveClick} data-test-id="modal-save-btn">
      {mode === "create" ? $t("common.create") : $t("common.save")}
    </button>
  {/snippet}
</DialogBase>
