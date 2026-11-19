<script lang="ts">
  import { untrack } from "svelte";

  import { locale, t } from "$lib/common/i18n/config";
  import type { Assignment } from "$lib/common/types/academic";
  import type { EnrollmentWithPerson } from "$lib/common/types/enrollment";
  import {
    DeliveryWorkflowStatus,
    type Delivery,
  } from "$lib/common/types/student";

  import {
    buildGradeRows,
    countCorrected,
    deliveryFromRow,
    firstErrorField,
    isCorrected,
    isRowDirty,
    validateGradeRow,
    type GradeErrorCode,
    type GradeRow,
  } from "./grade-entry";

  interface Props {
    assignment: Assignment;
    enrollments: EnrollmentWithPerson[];
    deliveries: Delivery[];
    onSave: (delivery: Delivery) => Promise<void>;
    detailHref: (enrollmentId: number) => string;
  }

  let { assignment, enrollments, deliveries, onSave, detailHref }: Props = $props();

  // The sheet is mounted only once the page has the roster and the delivery
  // rows, so the drafts are built once: an effect would clobber typing.
  let rows = $state<GradeRow[]>(
    untrack(() => buildGradeRows(enrollments, deliveries, $locale || "es")),
  );
  let announcement = $state("");
  let sheetEl = $state<HTMLElement | null>(null);

  const corrected = $derived(countCorrected(rows));
  const total = $derived(rows.length);

  const ARROW_FIELDS = ["grade", "result", "ai", "comments"] as const;
  type ArrowField = (typeof ARROW_FIELDS)[number];

  function isArrowField(field: string | undefined): field is ArrowField {
    return field !== undefined && (ARROW_FIELDS as readonly string[]).includes(field);
  }

  const gradeErrorId = (row: GradeRow) => `grade-error-${row.enrollment_id}`;
  const verdictErrorId = (row: GradeRow) => `verdict-error-${row.enrollment_id}`;

  function gradeMessage(code: GradeErrorCode): string {
    switch (code) {
      case "required":
        return $t("assignments.grading.grade_required");
      case "range":
        return $t("assignments.grading.grade_range");
      case "format":
      default:
        return $t("assignments.grading.grade_format");
    }
  }

  function hasMessages(row: GradeRow): boolean {
    return (
      row.errors.grade !== undefined ||
      row.errors.verdict !== undefined ||
      row.saveError !== ""
    );
  }

  function focusField(rowIndex: number, field: ArrowField) {
    const target = sheetEl?.querySelector<HTMLElement>(
      `[data-grade-row="${rowIndex}"] [data-field="${field}"]`,
    );
    target?.focus();
  }

  /** Arrow keys only leave a comment field when the caret has nowhere left to go. */
  function caretAtEdge(target: HTMLElement, direction: 1 | -1): boolean {
    if (!(target instanceof HTMLInputElement) || target.type === "number") return true;
    const start = target.selectionStart ?? 0;
    const end = target.selectionEnd ?? 0;
    return direction === 1 ? start === end && end === target.value.length : start === end && start === 0;
  }

  async function commit(row: GradeRow): Promise<"saved" | "noop" | "invalid" | "failed"> {
    row.saveError = "";
    if (row.saving) return "noop";

    // An untouched row has nothing to persist: Enter on it simply advances.
    if (!isRowDirty(row)) {
      row.errors = {};
      return "noop";
    }

    const errors = validateGradeRow(row);
    row.errors = errors;
    if (errors.grade !== undefined || errors.verdict !== undefined) return "invalid";

    row.saving = true;
    try {
      await onSave(deliveryFromRow(row, assignment.id));
      const status = row.draft.verdict || row.workflow_status;
      row.workflow_status = status;
      row.saved_status = isCorrected(status) ? status : null;
      row.saved = { ...row.draft };
      row.has_sheet = true;
      row.errors = {};
      announcement = $t("assignments.grading.saved_announcement", {
        name: row.name,
        corrected: countCorrected(rows),
        total: rows.length,
      } as never);
      return "saved";
    } catch {
      row.saveError = $t("assignments.grading.save_error");
      return "failed";
    } finally {
      row.saving = false;
    }
  }

  /** Read by the page's unsaved-changes guard. */
  export function getIsDirty(): boolean {
    return rows.some((row) => isRowDirty(row));
  }

  /** Saves every dirty row; false when one is invalid or the save fails. */
  export async function saveAllDirty(): Promise<boolean> {
    for (const row of rows.filter((item) => isRowDirty(item))) {
      const outcome = await commit(row);
      if (outcome === "invalid" || outcome === "failed") return false;
    }
    return true;
  }

  async function saveAndAdvance(row: GradeRow, index: number) {
    const outcome = await commit(row);
    if (outcome === "invalid") {
      const field = firstErrorField(row.errors);
      if (field === "grade") focusField(index, "grade");
      else if (field === "verdict") focusField(index, "result");
      return;
    }
    if (outcome === "failed") return;

    if (index < rows.length - 1) focusField(index + 1, "grade");
  }

  function handleKeydown(event: KeyboardEvent) {
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const rowEl = target.closest<HTMLElement>("[data-grade-row]");
    const field = target.dataset.field;
    if (!rowEl || field === undefined) return;

    const index = Number(rowEl.dataset.gradeRow);
    const row = rows[index];
    if (!row) return;

    if (event.key === "Enter" && isArrowField(field)) {
      event.preventDefault();
      void saveAndAdvance(row, index);
      return;
    }

    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    if (!isArrowField(field)) return;

    const direction = event.key === "ArrowRight" ? 1 : -1;
    if (field === "comments" && !caretAtEdge(target, direction)) return;

    event.preventDefault();
    let nextField = ARROW_FIELDS.indexOf(field) + direction;
    let nextRow = index;

    if (nextField < 0) {
      nextRow = index - 1;
      nextField = ARROW_FIELDS.length - 1;
    } else if (nextField >= ARROW_FIELDS.length) {
      nextRow = index + 1;
      nextField = 0;
    }

    if (nextRow < 0 || nextRow >= rows.length) return;
    focusField(nextRow, ARROW_FIELDS[nextField]);
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<section class="grade-sheet" aria-labelledby="grade-sheet-title" bind:this={sheetEl}>
  <div class="grade-sheet__bar">
    <div class="grade-sheet__bar-top">
      <h2 id="grade-sheet-title" class="grade-sheet__title">
        {$t("assignments.grading.title")}
      </h2>
      <p class="grade-sheet__progress tnum" data-test-id="grade-sheet-progress">
        {$t("assignments.grading.progress", { corrected, total } as never)}
      </p>
    </div>
    <p class="grade-sheet__hint">{$t("assignments.grading.keyboard_hint")}</p>
  </div>

  <p class="sr-only" aria-live="polite" data-test-id="grade-sheet-announcement">{announcement}</p>

  <table class="grade-sheet__table">
    <caption class="sr-only">
      {$t("assignments.grading.caption", { title: assignment.title } as never)}
    </caption>
    <colgroup>
      <col class="grade-sheet__col-student" />
      <col class="grade-sheet__col-grade" />
      <col class="grade-sheet__col-result" />
      <col class="grade-sheet__col-ai" />
      <col class="grade-sheet__col-comments" />
      <col class="grade-sheet__col-save" />
    </colgroup>
    <thead>
      <tr>
        <th scope="col">{$t("assignments.grading.column_student")}</th>
        <th scope="col" class="grade-sheet__num">
          {$t("assignments.grading.column_grade")}
        </th>
        <th scope="col">{$t("assignments.grading.column_result")}</th>
        <th scope="col">{$t("assignments.grading.column_ai")}</th>
        <th scope="col">{$t("assignments.grading.column_comments")}</th>
        <th scope="col">
          <span class="sr-only">{$t("assignments.grading.column_save")}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row, index (row.enrollment_id)}
        <tr
          class="grade-sheet__row"
          data-grade-row={index}
          class:is-saving={row.saving}
          data-test-id="grade-row-{row.enrollment_id}"
        >
          <th scope="row" class="grade-sheet__student">
            <a
              class="link-editorial grade-sheet__name"
              href={detailHref(row.enrollment_id)}
              title={$t("assignments.grading.detail_link", { name: row.name } as never)}
              data-test-id="grade-detail-{row.enrollment_id}"
            >
              {row.name}
            </a>
            <span class="grade-sheet__legajo">
              {row.legajo ?? $t("assignments.grading.no_legajo")}
            </span>
            {#if !row.has_sheet}
              <span
                class="grade-sheet__no-sheet"
                title={$t("assignments.grading.missing_sheet_title")}
                data-test-id="grade-no-sheet-{row.enrollment_id}"
              >
                {$t("assignments.grading.missing_sheet")}
              </span>
            {/if}
          </th>

          <td class="grade-sheet__cell grade-sheet__cell--grade" data-label={$t("assignments.grading.column_grade")}>
            <label class="sr-only" for="grade-{row.enrollment_id}">
              {$t("assignments.grading.grade_for", { name: row.name } as never)}
            </label>
            <input
              id="grade-{row.enrollment_id}"
              class="grade-sheet__input tnum"
              class:is-invalid={row.errors.grade !== undefined}
              type="text"
              inputmode="decimal"
              autocomplete="off"
              maxlength="4"
              placeholder="—"
              data-field="grade"
              data-test-id="grade-input-{row.enrollment_id}"
              aria-invalid={row.errors.grade !== undefined ? "true" : undefined}
              aria-describedby={row.errors.grade !== undefined
                ? gradeErrorId(row)
                : undefined}
              bind:value={row.draft.grade}
              oninput={() => {
                row.errors.grade = undefined;
              }}
            />
          </td>

          <td class="grade-sheet__cell grade-sheet__cell--result" data-label={$t("assignments.grading.column_result")}>
            <label class="sr-only" for="result-{row.enrollment_id}">
              {$t("assignments.grading.result_for", { name: row.name } as never)}
            </label>
            <select
              id="result-{row.enrollment_id}"
              class="grade-sheet__select"
              class:is-invalid={row.errors.verdict !== undefined}
              data-field="result"
              data-test-id="grade-result-{row.enrollment_id}"
              aria-invalid={row.errors.verdict !== undefined ? "true" : undefined}
              aria-describedby={row.errors.verdict !== undefined
                ? verdictErrorId(row)
                : undefined}
              bind:value={row.draft.verdict}
              onchange={() => {
                row.errors.verdict = undefined;
              }}
            >
              <option value="" disabled>{$t("assignments.grading.result_pending")}</option>
              <option value={DeliveryWorkflowStatus.APPROVED}>
                {$t("assignments.grading.result_approved")}
              </option>
              <option value={DeliveryWorkflowStatus.REJECTED}>
                {$t("assignments.grading.result_rejected")}
              </option>
            </select>
          </td>

          <td class="grade-sheet__cell grade-sheet__cell--ai" data-label={$t("assignments.grading.column_ai")}>
            <label class="sr-only" for="ai-{row.enrollment_id}">
              {$t("assignments.grading.ai_for", { name: row.name } as never)}
            </label>
            <select
              id="ai-{row.enrollment_id}"
              class="grade-sheet__select"
              data-field="ai"
              data-test-id="grade-ai-{row.enrollment_id}"
              bind:value={row.draft.ai_level}
            >
              <option value={0}>{$t("assignments.grading.ai_none")}</option>
              <option value={1}>{$t("assignments.grading.ai_suspicion")}</option>
              <option value={2}>{$t("assignments.grading.ai_certainty")}</option>
            </select>
          </td>

          <td
            class="grade-sheet__cell grade-sheet__cell--comments"
            data-label={$t("assignments.grading.column_comments")}
          >
            <label class="sr-only" for="comments-{row.enrollment_id}">
              {$t("assignments.grading.comments_for", { name: row.name } as never)}
            </label>
            <input
              id="comments-{row.enrollment_id}"
              class="grade-sheet__input"
              type="text"
              autocomplete="off"
              placeholder={$t("assignments.grading.comment_placeholder")}
              data-field="comments"
              data-test-id="grade-comments-{row.enrollment_id}"
              bind:value={row.draft.comments}
              oninput={() => {
                row.saveError = "";
              }}
            />
          </td>

          <td class="grade-sheet__cell grade-sheet__cell--save">
            <button
              type="button"
              class="grade-sheet__save"
              class:is-dirty={isRowDirty(row)}
              data-field="save"
              data-test-id="grade-save-{row.enrollment_id}"
              aria-label={$t("assignments.grading.save_row", { name: row.name } as never)}
              title={isRowDirty(row)
                ? $t("assignments.grading.dirty")
                : $t("assignments.grading.clean")}
              disabled={row.saving || !isRowDirty(row)}
              aria-busy={row.saving ? "true" : undefined}
              onclick={() => void commit(row)}
            >
              {row.saving ? $t("assignments.grading.saving") : $t("assignments.grading.save")}
            </button>
          </td>
        </tr>

        {#if hasMessages(row)}
          <tr class="grade-sheet__error-row">
            <td colspan="6">
              <div
                class="grade-sheet__errors"
                role="alert"
                data-test-id="grade-row-error-{row.enrollment_id}"
              >
                {#if row.errors.grade !== undefined}
                  <p class="form-error-msg" id={gradeErrorId(row)}>
                    {$t("assignments.grading.column_grade")}: {gradeMessage(row.errors.grade)}
                  </p>
                {/if}
                {#if row.errors.verdict !== undefined}
                  <p class="form-error-msg" id={verdictErrorId(row)}>
                    {$t("assignments.grading.column_result")}: {$t("assignments.grading.verdict_required")}
                  </p>
                {/if}
                {#if row.saveError !== ""}
                  <p class="form-error-msg" data-test-id="grade-save-error-{row.enrollment_id}">
                    {row.saveError}
                  </p>
                {/if}
              </div>
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
</section>

<style>
  .grade-sheet {
    width: 100%;
    max-width: 48rem;
    margin-inline: auto;
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-box);
    background-color: var(--color-surface-container-lowest);
    overflow: hidden;
  }

  .grade-sheet__bar {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-outline-variant);
  }

  .grade-sheet__bar-top {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.25rem 1rem;
  }

  .grade-sheet__title {
    margin: 0;
    font-family: var(--font-serif);
    font-size: 1.125rem;
    line-height: 1.5rem;
    font-weight: 500;
    letter-spacing: -0.005em;
  }

  .grade-sheet__hint {
    margin: 0;
    color: var(--color-muted);
    font-size: 0.75rem;
    line-height: 1rem;
  }

  .grade-sheet__progress {
    margin: 0;
    color: var(--color-on-surface);
    font-size: 0.8125rem;
    line-height: 1.25rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .grade-sheet__table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }

  .grade-sheet__col-student {
    width: 20%;
  }

  .grade-sheet__col-grade {
    width: 9%;
  }

  .grade-sheet__col-result {
    width: 18%;
  }

  .grade-sheet__col-ai {
    width: 24%;
  }

  .grade-sheet__col-comments {
    width: 19%;
  }

  .grade-sheet__col-save {
    width: 10%;
  }

  .grade-sheet__table thead th {
    height: 2rem;
    padding: 0 0.375rem;
    border-bottom: 1px solid var(--color-outline-variant);
    background-color: var(--color-surface-container);
    color: var(--color-on-surface-variant);
    font-family: var(--font-sans);
    font-size: 0.6875rem;
    line-height: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .grade-sheet__num {
    text-align: right;
  }

  .grade-sheet__row > th,
  .grade-sheet__row > td {
    height: 2.5rem;
    padding: 0.25rem 0.375rem;
    border-bottom: 1px solid var(--color-outline-variant);
    vertical-align: middle;
  }

  .grade-sheet__row:hover > th,
  .grade-sheet__row:hover > td {
    background-color: var(--color-surface-container-low);
  }

  .grade-sheet__student {
    font-weight: 600;
    text-align: left;
  }

  .grade-sheet__name {
    display: inline;
    overflow-wrap: anywhere;
    font-weight: 600;
  }

  .grade-sheet__legajo,
  .grade-sheet__no-sheet {
    display: block;
    overflow: hidden;
    color: var(--color-muted);
    font-size: 0.6875rem;
    line-height: 0.875rem;
    font-weight: 400;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .grade-sheet__cell {
    vertical-align: middle;
  }

  .grade-sheet__input,
  .grade-sheet__select {
    width: 100%;
    min-height: 2rem;
    padding: 0.25rem 0.375rem;
    font-size: 0.8125rem;
    line-height: 1.25rem;
  }

  .grade-sheet__input {
    text-align: left;
  }

  .grade-sheet__cell--comments .grade-sheet__input {
    min-width: 0;
  }

  .grade-sheet__select {
    text-overflow: ellipsis;
  }

  .grade-sheet__input.is-invalid,
  .grade-sheet__select.is-invalid {
    border-color: var(--color-error);
  }

  .grade-sheet__cell--save {
    text-align: right;
  }

  .grade-sheet__save {
    display: inline-flex;
    width: 100%;
    height: 2rem;
    align-items: center;
    justify-content: center;
    padding: 0 0.5rem;
    border: 1px solid var(--color-outline);
    border-radius: var(--radius-field);
    background-color: var(--color-surface-container-lowest);
    color: var(--color-on-surface-variant);
    font-size: 0.6875rem;
    line-height: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease;
  }

  .grade-sheet__save:hover:not(:disabled) {
    background-color: var(--color-surface-container-low);
  }

  .grade-sheet__save.is-dirty {
    border-color: var(--color-primary);
    color: var(--color-primary);
  }

  .grade-sheet__save:disabled {
    cursor: default;
    border-color: var(--color-outline-variant);
    color: var(--color-muted);
  }

  .grade-sheet__row.is-saving {
    color: var(--color-muted);
  }

  .grade-sheet__row:last-child > th,
  .grade-sheet__row:last-child > td {
    border-bottom: 0;
  }

  .grade-sheet__error-row > td {
    padding: 0 0.375rem 0.5rem;
    border-bottom: 1px solid var(--color-outline-variant);
    background-color: color-mix(in srgb, var(--color-error) 6%, transparent);
  }

  .grade-sheet__errors {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
    padding-top: 0.25rem;
  }

  .grade-sheet__errors p {
    margin: 0;
  }

  @media (max-width: 767px) {
    .grade-sheet__bar {
      padding: 0.75rem;
    }

    .grade-sheet__table,
    .grade-sheet__table tbody,
    .grade-sheet__table tr,
    .grade-sheet__table th,
    .grade-sheet__table td {
      display: block;
      width: auto;
    }

    .grade-sheet__table thead {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    .grade-sheet__table .grade-sheet__row {
      position: relative;
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      grid-template-areas:
        "name name"
        "grade result"
        "ai comments";
      gap: 0.5rem 0.75rem;
      padding: 0.75rem;
      border-bottom: 1px solid var(--color-outline-variant);
    }

    .grade-sheet__row > th,
    .grade-sheet__row > td {
      height: auto;
      padding: 0;
      border: 0;
    }

    .grade-sheet__row:hover > th,
    .grade-sheet__row:hover > td {
      background-color: transparent;
    }

    .grade-sheet__student {
      grid-area: name;
      padding-right: 5rem;
    }

    .grade-sheet__name {
      font-size: 0.9375rem;
      line-height: 1.25rem;
    }

    .grade-sheet__cell {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      min-width: 0;
    }

    .grade-sheet__cell--grade {
      grid-area: grade;
    }

    .grade-sheet__cell--result {
      grid-area: result;
    }

    .grade-sheet__cell--ai {
      grid-area: ai;
    }

    .grade-sheet__cell--comments {
      grid-area: comments;
    }

    .grade-sheet__cell::before {
      content: attr(data-label) / "";
      color: var(--color-on-surface-variant);
      font-size: 0.6875rem;
      line-height: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .grade-sheet__cell--save {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      width: auto;
    }

    .grade-sheet__cell--save::before {
      content: none;
    }

    .grade-sheet__error-row {
      display: block;
      padding: 0 0.75rem 0.75rem;
      border-bottom: 1px solid var(--color-outline-variant);
      background-color: color-mix(in srgb, var(--color-error) 6%, transparent);
    }

    .grade-sheet__error-row > td {
      padding: 0;
      border: 0;
      background-color: transparent;
    }

    .grade-sheet__row:last-child + .grade-sheet__error-row {
      border-bottom: 0;
    }
  }
</style>
