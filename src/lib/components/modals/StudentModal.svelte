<script lang="ts">
  import { t } from "$lib/i18n/config";
  import type { Student } from "$lib/types";
  import DialogBase from "../common/DialogBase.svelte";
  import ErrorSpan from "../common/ErrorSpan.svelte";
  import { useFormValidation } from "$lib/composables/useFormValidation.svelte";
  import { CreateStudentsSchema } from "$lib/schemas/dto.schema";

  interface Props {
    isOpen: boolean;
    mode: "create" | "edit";
    student: Student | null;
    onSave: (name: string, externalId: string, id?: number, bulkNames?: string[]) => void;
    onClose: () => void;
  }

  let { isOpen, mode, student, onSave, onClose }: Props = $props();

  let name = $state("");
  let externalId = $state("");
  let bulkNames = $state("");
  let activeTab = $state<"single" | "bulk">("single");

  const validator = useFormValidation(CreateStudentsSchema);

  $effect(() => {
    if (isOpen) {
      name = mode === "edit" && student ? student.name : "";
      externalId = mode === "edit" && student ? student.external_id : "";
      bulkNames = "";
      activeTab = "single";
      validator.clear();
    }
  });

  function handleSaveClick() {
    if (mode === "create" && activeTab === "bulk") {
      const names = bulkNames
        .split("\n")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
      const isValid = validator.validate({
        commission_id: student?.commission_id || 1,
        names,
      });
      if (isValid) {
        onSave("", "", undefined, names);
      }
    } else {
      const isValid = validator.validate({
        commission_id: student?.commission_id || 1,
        names: [name],
      });
      if (isValid) {
        onSave(name, externalId, student?.id);
      }
    }
  }
</script>

<DialogBase
  {isOpen}
  title={mode === "create" ? $t("students.new_title") : $t("students.edit_title")}
  {onClose}
>
  {#snippet children()}
    {#if mode === "create"}
      <div class="row flex-center gap-2 mb-1" style="margin-bottom: 1.5rem;">
        <button
          type="button"
          class="paper-btn btn-small {activeTab === 'single'
            ? 'btn-secondary'
            : 'btn-secondary-outline'}"
          onclick={() => {
            activeTab = "single";
            validator.clear();
          }}
        >
          {$t("students.single_name_label")}
        </button>
        <button
          type="button"
          class="paper-btn btn-small {activeTab === 'bulk'
            ? 'btn-secondary'
            : 'btn-secondary-outline'}"
          onclick={() => {
            activeTab = "bulk";
            validator.clear();
          }}
        >
          {$t("students.upload_students_title")}
        </button>
      </div>
    {/if}

    {#if mode === "edit" || activeTab === "single"}
      <div class="form-group">
        <label for="student-name">{$t("students.name_label")}</label>
        <input
          type="text"
          id="student-name"
          bind:value={name}
          placeholder={$t("students.placeholder")}
          class="input-block"
          aria-invalid={!!(validator.errors["names.0"] || validator.errors.names)}
          aria-describedby={validator.errors["names.0"] || validator.errors.names
            ? "error-student-name"
            : undefined}
          oninput={() => {
            if (validator.errors["names.0"] || validator.errors.names) {
              validator.clear();
            }
          }}
          data-test-id="student-name-input"
        />
        <ErrorSpan
          message={validator.errors["names.0"] || validator.errors.names}
          id="error-student-name"
          testId="student-name-error"
        />
      </div>
      <div class="form-group">
        <label for="student-external-id">{$t("students.external_id_label")}</label>
        <input
          type="text"
          id="student-external-id"
          bind:value={externalId}
          placeholder={$t("students.external_id_placeholder")}
          class="input-block"
          data-test-id="student-external-id-input"
        />
      </div>
    {:else}
      <div class="form-group">
        <label for="names">{$t("students.paste_list_label")}</label>
        <textarea
          id="names"
          bind:value={bulkNames}
          rows="5"
          class="input-block"
          aria-invalid={!!validator.errors.names}
          aria-describedby={validator.errors.names ? "error-student-bulk" : undefined}
          oninput={() => {
            if (validator.errors.names) validator.errors.names = "";
          }}
          data-test-id="student-bulk-textarea"
        ></textarea>
        <ErrorSpan
          message={validator.errors.names}
          id="error-student-bulk"
          testId="student-bulk-error"
        />
      </div>
    {/if}
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
