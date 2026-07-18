<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import { useFormValidation } from "$lib/client/composables/useFormValidation.svelte";
  import { CreatePeriodSchema } from "$lib/common/schemas";
  import type { Period } from "$lib/common/types/academic";

  import DialogBase from "../common/DialogBase.svelte";
  import ErrorSpan from "../common/ErrorSpan.svelte";

  interface Props {
    isOpen: boolean;
    mode: "create" | "edit";
    period: Period | null;
    subjectId?: number;
    onSave: (year: number, semester: number, id?: number) => void;
    onClose: () => void;
  }
  let { isOpen, mode, period, subjectId, onSave, onClose }: Props = $props();

  let year = $state(new Date().getFullYear());
  let semester = $state(1);
  let serverError = $state<string | undefined>();

  const validator = useFormValidation(CreatePeriodSchema);

  $effect(() => {
    if (isOpen) {
      year = mode === "edit" && period ? period.year : new Date().getFullYear();
      semester = mode === "edit" && period ? period.semester : 1;
      validator.clear();
      serverError = undefined;
    }
  });

  async function handleSaveClick() {
    serverError = undefined;
    const isValid = validator.validate({
      subject_id: subjectId ?? period?.subject_id ?? 1,
      year: Number(year),
      semester: Number(semester),
    });
    if (isValid) {
      try {
        await onSave(Number(year), Number(semester), period?.id);
      } catch (e: any) {
        if (e.message && e.message.includes("already exists")) {
          serverError = "periods.error_already_exists";
        } else {
          serverError = e.message;
        }
        // A11y: Shift focus programmatically to the error span so screen readers announce it
        setTimeout(() => {
          document.getElementById("error-period-server")?.focus();
        }, 0);
      }
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
        testId="error-period-semester"
      />
    </div>

    <!-- Tabindex -1 allows focus shifts on span for screen-reader alert speech -->
    <div tabindex="-1" id="error-period-server" style="outline: none;">
      <ErrorSpan message={serverError} id="server-period-error-span" testId="period-server-error" />
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
