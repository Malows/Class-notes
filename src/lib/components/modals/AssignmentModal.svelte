<script lang="ts">
  import { t } from "$lib/i18n/config";
  import type { Assignment } from "$lib/types";
  import DialogBase from "../common/DialogBase.svelte";

  interface Props {
    isOpen: boolean;
    mode: "create" | "edit";
    assignment: Assignment | null;
    onSave: (title: string, subtitle?: string, workflow_status?: string, id?: number) => void;
    onClose: () => void;
  }

  let { isOpen, mode, assignment, onSave, onClose }: Props = $props();

  let title = $state("");
  let subtitle = $state("");
  let workflowStatus = $state("NOT_DICTATED");

  $effect(() => {
    if (isOpen) {
      title = mode === "edit" && assignment ? assignment.title : "";
      subtitle =
        mode === "edit" && assignment && "subtitle" in assignment
          ? (assignment.subtitle ?? "")
          : "";
      workflowStatus =
        mode === "edit" && assignment && "workflow_status" in assignment
          ? (assignment.workflow_status ?? "NOT_DICTATED")
          : "NOT_DICTATED";
    }
  });
</script>

<DialogBase
  {isOpen}
  title={mode === "create" ? $t("assignments.new_title") : $t("assignments.edit_title")}
  {onClose}
>
  {#snippet children()}
    {#if mode === "create"}
      <div
        class="alert alert-warning margin-bottom-small padding-small"
        data-test-id="assignment-warning-alert"
      >
        <p style="margin: 0; font-weight: bold;">{$t("assignments.warning_alert")}</p>
      </div>
    {/if}
    <div class="form-group">
      <label for="assignment-title">{$t("assignments.title_label")}</label>
      <input
        type="text"
        id="assignment-title"
        bind:value={title}
        placeholder={$t("assignments.placeholder")}
        class="input-block"
        data-test-id="assignment-title-input"
      />
    </div>
    <div class="form-group">
      <label for="assignment-subtitle">{$t("assignments.subtitle_label")}</label>
      <input
        type="text"
        id="assignment-subtitle"
        bind:value={subtitle}
        placeholder={$t("assignments.subtitle_placeholder")}
        class="input-block"
        data-test-id="assignment-subtitle-input"
      />
    </div>
    <div class="form-group">
      <label for="workflow-status">{$t("assignments.workflow_status_label")}</label>
      <select
        id="workflow-status"
        bind:value={workflowStatus}
        class="input-block"
        data-test-id="assignment-workflow-select"
      >
        <option value="NOT_DICTATED">{$t("assignments.workflow_status.not_dictated")}</option>
        <option value="WAITING_FOR_STUDENTS"
          >{$t("assignments.workflow_status.waiting_for_students")}</option
        >
        <option value="WAITING_FOR_CORRECTION"
          >{$t("assignments.workflow_status.waiting_for_correction")}</option
        >
      </select>
    </div>
  {/snippet}

  {#snippet footer()}
    <button class="paper-btn" onclick={onClose} data-test-id="modal-cancel-btn">
      {$t("common.cancel")}
    </button>
    <button
      class="paper-btn btn-secondary"
      onclick={() => onSave(title, subtitle, workflowStatus, assignment?.id)}
      data-test-id="modal-save-btn"
    >
      {mode === "create" ? $t("common.create") : $t("common.save")}
    </button>
  {/snippet}
</DialogBase>
