<script lang="ts">
  import { t } from "$lib/i18n/config";
  import type { Student } from "$lib/types";

  import DialogBase from "../common/DialogBase.svelte";

  interface Props {
    isOpen: boolean;
    mode: "create" | "edit";
    student: Student | null;
    onSave: (name: string, externalId: string, id?: number) => void;
    onClose: () => void;
  }

  let { isOpen, mode, student, onSave, onClose }: Props = $props();

  let name = $state("");
  let externalId = $state("");

  $effect(() => {
    if (isOpen) {
      name = mode === "edit" && student ? student.name : "";
      externalId = mode === "edit" && student ? student.external_id : "";
    }
  });
</script>

<DialogBase
  {isOpen}
  title={mode === "create" ? $t("students.new_title") : $t("students.edit_title")}
  {onClose}
>
  {#snippet children()}
    <div class="form-group">
      <label for="student-name">{$t("students.name_label")}</label>
      <input
        type="text"
        id="student-name"
        bind:value={name}
        placeholder={$t("students.placeholder")}
        class="input-block"
        data-test-id="student-name-input"
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
  {/snippet}

  {#snippet footer()}
    <button class="paper-btn" data-test-id="cancel-btn" onclick={onClose}
      >{$t("common.cancel")}</button
    >
    <button
      class="paper-btn btn-secondary"
      data-test-id="submit-btn"
      onclick={() => onSave(name, externalId, student?.id)}
    >
      {mode === "create" ? $t("common.create") : $t("common.save")}
    </button>
  {/snippet}
</DialogBase>
