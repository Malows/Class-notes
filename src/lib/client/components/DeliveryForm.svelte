<script lang="ts">
  import { DeliveryWorkflowStatus, type Delivery } from "$lib/common/types";
  import { locale, t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";
  import Card from "$lib/client/components/common/Card.svelte";
  import {
    formatGradeValue,
    initialDraft,
    parseGradeInput,
    type GradeErrorCode,
  } from "$lib/client/components/grading/grade-entry";

  interface Props {
    delivery: Delivery;
    onSave: (d: Delivery) => void;
    onPrev?: () => void;
    onNext?: () => void;
    onSkip?: () => void;
    gradeTestId?: string;
    approvedTestId?: string;
    rejectedTestId?: string;
    commentsTestId?: string;
    submitTestId?: string;
    deliveredTestId?: string;
    aiLevelTestId?: string;
    prevTestId?: string;
    nextTestId?: string;
    skipTestId?: string;
  }

  let {
    delivery,
    onSave,
    onPrev,
    onNext,
    onSkip,
    gradeTestId = "delivery-grade-input",
    approvedTestId = "delivery-approved-radio",
    rejectedTestId,
    commentsTestId = "delivery-comments-textarea",
    submitTestId = "delivery-submit-btn",
    deliveredTestId = "delivery-delivered-checkbox",
    aiLevelTestId = "delivery-ai-level-select",
    prevTestId = "delivery-prev-btn",
    nextTestId = "delivery-next-btn",
    skipTestId = "delivery-skip-btn",
  }: Props = $props();

  // Create a local state copy, initialized empty to avoid prop snapshot warning
  let d = $state({} as Delivery);
  let gradeInput = $state("");
  let gradeError = $state<"" | GradeErrorCode>("");
  // The values this delivery arrived with. Navigation away from a dirty draft
  // asks before dropping the edits instead of doing it silently.
  let baseline = $state({ grade: "" as number | string, status: "", ai: 0, comments: "" });
  let pendingAction = $state<"next" | "skip" | null>(null);
  let guardEl = $state<HTMLElement | null>(null);
  let guardTrigger = $state<HTMLElement | null>(null);

  /** `8` and `8,0` are the same grade: compare values, not the typed text. */
  function gradeSignature(raw: string): number | string {
    const parsed = parseGradeInput(raw);
    return "value" in parsed ? parsed.value : raw.trim();
  }

  // Sync local state when external delivery prop changes
  $effect(() => {
    const next: Delivery = {
      ...delivery,
      workflow_status: delivery.workflow_status ?? DeliveryWorkflowStatus.NOT_DICTATED,
    };
    const initialGrade = initialDraft(delivery, $locale || "es").grade;
    d = next;
    gradeInput = initialGrade;
    gradeError = "";
    baseline = {
      grade: gradeSignature(initialGrade),
      status: next.workflow_status,
      ai: Number(next.ai_level) || 0,
      comments: next.comments ?? "",
    };
    pendingAction = null;
  });

  const isDirty = $derived(
    gradeSignature(gradeInput) !== baseline.grade ||
      d.workflow_status !== baseline.status ||
      (Number(d.ai_level) || 0) !== baseline.ai ||
      (d.comments ?? "") !== baseline.comments,
  );

  // The guard takes focus so its message is announced before the buttons.
  $effect(() => {
    if (pendingAction) {
      guardEl?.focus();
    }
  });

  function requestAdvance(action: "next" | "skip", trigger?: HTMLElement | null) {
    if (!isDirty) {
      if (action === "next") onNext?.();
      else onSkip?.();
      return;
    }
    guardTrigger = trigger ?? null;
    pendingAction = action;
  }

  function cancelGuard() {
    pendingAction = null;
    guardTrigger?.focus();
  }

  function discardAndAdvance() {
    const action = pendingAction;
    pendingAction = null;
    if (action === "next") onNext?.();
    else if (action === "skip") onSkip?.();
  }

  // Use random suffix for IDs to ensure uniqueness
  const idSuffix = Math.random().toString(36).substring(2, 9);
  const gradeHintId = `grade-hint-${idSuffix}`;
  const gradeErrorId = `grade-error-${idSuffix}`;

  // Approval and rejection are different controls, so they never share a test id.
  const rejectedTestIdValue = $derived(
    rejectedTestId ?? approvedTestId.replace("approved", "rejected"),
  );

  const gradeMessage = $derived.by((): string => {
    switch (gradeError) {
      case "required":
        return $t("assignments.grading.grade_required");
      case "range":
        return $t("assignments.grading.grade_range");
      case "format":
        return $t("assignments.grading.grade_format");
      default:
        return "";
    }
  });

  const gradeDescribedBy = $derived(
    gradeError ? `${gradeHintId} ${gradeErrorId}` : gradeHintId,
  );

  function isValid(): boolean {
    const raw = gradeInput.trim();
    const hasVerdict =
      d.workflow_status === DeliveryWorkflowStatus.APPROVED ||
      d.workflow_status === DeliveryWorkflowStatus.REJECTED;

    if (raw === "") {
      gradeError = hasVerdict ? "required" : "";
      return !hasVerdict;
    }

    const parsed = parseGradeInput(raw);
    if ("error" in parsed) {
      gradeError = parsed.error;
      return false;
    }

    gradeError = "";
    return true;
  }

  function submit() {
    if (!isValid()) return;

    const parsed = parseGradeInput(gradeInput);
    const grade = "value" in parsed ? parsed.value : 0;

    onSave({
      ...d,
      grade,
      ai_level: Number(d.ai_level) || 0,
      comments: d.comments ?? "",
    });
  }

  // Enter saves from any single-line field through the form's submit event;
  // a textarea keeps Enter for new lines and uses Ctrl/Cmd+Enter to save.
  function handleTextareaKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      submit();
    }
  }
</script>

<form
  class="delivery-form"
  onsubmit={(event) => {
    event.preventDefault();
    submit();
  }}
>
  <Card>
    <div class="flex flex-col gap-4">
      <label class="flex cursor-pointer items-center gap-2 text-body-md" for="is_delivered-{idSuffix}">
        <input
          type="checkbox"
          class="checkbox checkbox-sm"
          id="is_delivered-{idSuffix}"
          checked={d.workflow_status !== DeliveryWorkflowStatus.NOT_DICTATED &&
            d.workflow_status !== DeliveryWorkflowStatus.WAITING_FOR_STUDENTS}
          onchange={(event) => {
            const checked = event.currentTarget.checked;
            d.workflow_status = checked
              ? DeliveryWorkflowStatus.WAITING_FOR_CORRECTION
              : DeliveryWorkflowStatus.WAITING_FOR_STUDENTS;
          }}
          data-test-id={deliveredTestId}
        />
        <span>{$t("assignments.delivered_label")}</span>
      </label>

      <hr />

      <fieldset class="m-0 flex flex-col gap-2 p-0">
        <legend class="mb-1 text-label-md text-on-surface-variant">{$t("assignments.result_label")}</legend>
        <label class="flex cursor-pointer items-center gap-2 text-body-md" for="approved-yes-{idSuffix}">
          <input
            type="radio"
            class="radio radio-sm"
            id="approved-yes-{idSuffix}"
            name="approved-{idSuffix}"
            value={true}
            checked={d.workflow_status === DeliveryWorkflowStatus.APPROVED}
            onchange={() => {
              d.workflow_status = DeliveryWorkflowStatus.APPROVED;
            }}
            data-test-id={approvedTestId}
          />
          <span>{$t("assignments.approved_label")}</span>
        </label>
        <label class="flex cursor-pointer items-center gap-2 text-body-md" for="approved-no-{idSuffix}">
          <input
            type="radio"
            class="radio radio-sm"
            id="approved-no-{idSuffix}"
            name="approved-{idSuffix}"
            value={false}
            checked={d.workflow_status === DeliveryWorkflowStatus.REJECTED}
            onchange={() => {
              d.workflow_status = DeliveryWorkflowStatus.REJECTED;
            }}
            data-test-id={rejectedTestIdValue}
          />
          <span>{$t("assignments.rejected_label")}</span>
        </label>
      </fieldset>

      <div class="flex flex-col gap-1">
        <label class="text-label-md text-on-surface-variant" for="grade-{idSuffix}">{$t("assignments.grade_label")}</label>
        <input
          type="text"
          id="grade-{idSuffix}"
          class="tnum"
          class:is-invalid={gradeError !== ""}
          inputmode="decimal"
          autocomplete="off"
          maxlength="4"
          placeholder="—"
          bind:value={gradeInput}
          aria-invalid={gradeError !== "" ? "true" : undefined}
          aria-describedby={gradeDescribedBy}
          oninput={() => {
            gradeError = "";
          }}
          onkeydown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
            }
          }}
          data-test-id={gradeTestId}
        />
        <p id={gradeHintId} class="m-0 text-body-sm text-on-surface-variant">
          {$t("assignments.grading.grade_scale_hint")}
        </p>
        {#if gradeError}
          <p id={gradeErrorId} class="form-error-msg" role="alert" data-test-id="delivery-grade-error">
            {gradeMessage}
          </p>
        {/if}
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-label-md text-on-surface-variant" for="ai_level-{idSuffix}">{$t("assignments.ai_usage_label")}</label>
        <select id="ai_level-{idSuffix}" bind:value={d.ai_level} data-test-id={aiLevelTestId}>
          <option value={0}>{$t("assignments.ai_none")}</option>
          <option value={1}>{$t("assignments.ai_suspicion")}</option>
          <option value={2}>{$t("assignments.ai_certainty")}</option>
        </select>
      </div>

      <div class="flex flex-col gap-1">
        <label class="text-label-md text-on-surface-variant" for="comments-{idSuffix}"
          >{$t("assignments.comments_label")}</label
        >
        <textarea
          id="comments-{idSuffix}"
          bind:value={d.comments}
          rows="3"
          onkeydown={handleTextareaKeydown}
          data-test-id={commentsTestId}
        ></textarea>
      </div>

      <hr />

      {#if pendingAction}
        <div
          class="delivery-form__guard"
          role="alert"
          tabindex="-1"
          bind:this={guardEl}
          data-test-id="delivery-unsaved-guard"
        >
          <p class="delivery-form__guard-text">{$t("assignments.unsaved_changes")}</p>
          <div class="flex flex-wrap items-center gap-2">
            <Button
              class="btn-error"
              onclick={discardAndAdvance}
              testId="delivery-guard-discard"
            >
              {$t("assignments.discard_and_continue")}
            </Button>
            <Button
              class="btn-ghost"
              onclick={cancelGuard}
              testId="delivery-guard-cancel"
            >
              {$t("assignments.keep_editing")}
            </Button>
          </div>
        </div>
      {/if}

      <div class="flex flex-wrap items-center gap-2">
        {#if onPrev}
          <Button class="btn-ghost" onclick={onPrev} testId={prevTestId}>{$t("assignments.previous")}</Button>
        {/if}
        {#if onNext}
          <Button
            class="btn-ghost"
            onclick={(event) => requestAdvance("next", event.currentTarget as HTMLElement | null)}
            testId={nextTestId}>{$t("assignments.next")}</Button
          >
        {/if}
        {#if onSkip}
          <Button
            class="btn-ghost"
            onclick={(event) => requestAdvance("skip", event.currentTarget as HTMLElement | null)}
            testId={skipTestId}>{$t("assignments.skip")}</Button
          >
        {/if}
        <button type="submit" class="btn btn-primary ml-auto" data-test-id={submitTestId}>
          {$t("assignments.save")}
        </button>
      </div>
    </div>
  </Card>
</form>

<style>
  .delivery-form {
    width: 100%;
    max-width: 40rem;
    margin-inline: auto;
  }

  .delivery-form :global(input.is-invalid),
  .delivery-form :global(select.is-invalid) {
    border-color: var(--color-error);
  }

  .delivery-form__guard {
    display: grid;
    gap: 0.5rem;
    padding: 0.75rem;
    border: 1px solid color-mix(in srgb, var(--color-error) 40%, var(--color-outline));
    border-radius: var(--radius-box);
    background-color: color-mix(
      in srgb,
      var(--color-error) 6%,
      var(--color-surface-container-lowest)
    );
  }

  .delivery-form__guard:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .delivery-form__guard-text {
    margin: 0;
    color: var(--color-on-surface);
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }
</style>
