<script lang="ts">
  import { t } from "$lib/i18n/config";
  import type { Period } from "$lib/types";
  import DialogBase from "../common/DialogBase.svelte";
  import ErrorSpan from "../common/ErrorSpan.svelte";
  import { useFormValidation } from "$lib/composables/useFormValidation.svelte";
  import { CreatePeriodSchema } from "$lib/schemas/dto.schema";

  interface Props {
    isOpen: boolean;
    mode: "create" | "edit";
    period: Period | null;
    onSave: (year: number, semester: number, id?: number) => void;
    onClose: () => void;
  }
  let { isOpen, mode, period, onSave, onClose }: Props = $props();

  let year = $state(new Date().getFullYear());
  let semester = $state(1);

  const validator = useFormValidation(CreatePeriodSchema);

  $effect(() => {
    if (isOpen) {
      year = mode === "edit" && period ? period.year : new Date().getFullYear();
      semester = mode === "edit" && period ? period.semester : 1;
      validator.clear();
    }
  });

  function handleSaveClick() {
    const isValid = validator.validate({
      subject_id: period?.subject_id || 1, // Satisfies schema requirements
      year: Number(year),
      semester: Number(semester),
    });
    if (isValid) {
      onSave(Number(year), Number(semester), period?.id);
    }
  }
</script>

<DialogBase
  {isOpen}
  title={mode === "create" ? $t("periods.new_title") : $t("periods.edit_title")}
  {onClose}
>
  {#snippet children()}
    <div class="form-group">
      <label for="edit-year">{$t("periods.year_label")}</label>
      <input
        type="number"
        id="edit-year"
        bind:value={year}
        class="input-block"
        aria-invalid={!!validator.errors.year}
        aria-describedby={validator.errors.year ? "error-period-year" : undefined}
        oninput={() => {
          if (validator.errors.year) validator.errors.year = "";
        }}
        data-test-id="period-year-input"
      />
      <ErrorSpan
        message={validator.errors.year}
        id="error-period-year"
        testId="period-year-error"
      />
    </div>
    <div class="form-group">
      <label for="edit-semester">{$t("periods.semester_label")}</label>
      <select
        id="edit-semester"
        bind:value={semester}
        class="input-block"
        aria-invalid={!!validator.errors.semester}
        aria-describedby={validator.errors.semester ? "error-period-semester" : undefined}
        onchange={() => {
          if (validator.errors.semester) validator.errors.semester = "";
        }}
        data-test-id="period-semester-select"
      >
        <option value={1}>1º {$t("periods.semester")}</option>
        <option value={2}>2º {$t("periods.semester")}</option>
      </select>
      <ErrorSpan
        message={validator.errors.semester}
        id="error-period-semester"
        testId="period-semester-error"
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
