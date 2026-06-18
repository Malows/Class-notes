<script lang="ts">
  import { t } from "$lib/i18n/config";
  import type { Student } from "$lib/types";

  import DialogBase from "../common/DialogBase.svelte";

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

  $effect(() => {
    if (isOpen) {
      name = mode === "edit" && student ? student.name : "";
      externalId = mode === "edit" && student ? student.external_id : "";
      bulkNames = "";
      activeTab = "single";
    }
  });

  function handleSaveClick() {
    if (mode === "create" && activeTab === "bulk") {
      const names = bulkNames
        .split("\n")
        .map((n) => n.trim())
        .filter((n) => n.length > 0);
      onSave("", "", undefined, names);
    } else {
      onSave(name, externalId, student?.id);
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
          class="paper-btn btn-small {activeTab === 'single' ? 'btn-secondary' : 'btn-secondary-outline'}" 
          onclick={() => activeTab = "single"}
        >
          {$t("students.single_name_label")}
        </button>
        <button 
          type="button" 
          class="paper-btn btn-small {activeTab === 'bulk' ? 'btn-secondary' : 'btn-secondary-outline'}" 
          onclick={() => activeTab = "bulk"}
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
    {:else}
      <div class="form-group">
        <label for="names">{$t("students.paste_list_label")}</label>
        <textarea
          id="names"
          bind:value={bulkNames}
          rows="5"
          class="input-block"
          data-test-id="student-bulk-textarea"
        ></textarea>
      </div>
    {/if}
  {/snippet}

  {#snippet footer()}
    <button class="paper-btn" data-test-id="cancel-btn" onclick={onClose}
      >{$t("common.cancel")}</button
    >
    <button
      class="paper-btn btn-secondary"
      data-test-id="submit-btn"
      onclick={handleSaveClick}
    >
      {mode === "create" ? $t("common.create") : $t("common.save")}
    </button>
  {/snippet}
</DialogBase>
