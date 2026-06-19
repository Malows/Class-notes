<script lang="ts">
  import { DeliveryWorkflowStatus, type Delivery } from "$lib/types";

  interface Props {
    delivery: Delivery;
    onSave: (d: Delivery) => void;
    onPrev?: () => void;
    onNext?: () => void;
    onSkip?: () => void;
    gradeTestId?: string;
    approvedTestId?: string;
    commentsTestId?: string;
    submitTestId?: string;
    deliveredTestId?: string;
    aiLevelTestId?: string;
  }

  let {
    delivery,
    onSave,
    onPrev,
    onNext,
    onSkip,
    gradeTestId = "delivery-grade-input",
    approvedTestId = "delivery-approved-checkbox",
    commentsTestId = "delivery-comments-textarea",
    submitTestId = "delivery-submit-btn",
    deliveredTestId = "delivery-delivered-checkbox",
    aiLevelTestId = "delivery-ai-level-select",
  }: Props = $props();

  // Create a local state copy, initialized empty to avoid prop snapshot warning
  let d = $state({} as Delivery);

  // Sync local state when external delivery prop changes
  $effect(() => {
    d = {
      ...delivery,
      workflow_status: delivery.workflow_status ?? DeliveryWorkflowStatus.NOT_DICTATED,
    };
  });

  // Use random suffix for IDs to ensure uniqueness
  const idSuffix = Math.random().toString(36).substring(2, 9);
</script>

<div class="card">
  <div class="card-body">
    <div class="form-group">
      <label for="is_delivered-{idSuffix}">
        <input
          type="checkbox"
          id="is_delivered-{idSuffix}"
          checked={d.workflow_status !== DeliveryWorkflowStatus.NOT_DICTATED}
          onchange={(event) => {
            const checked = event.currentTarget.checked;
            d.workflow_status = checked
              ? DeliveryWorkflowStatus.WAITING_FOR_STUDENTS
              : DeliveryWorkflowStatus.NOT_DICTATED;
          }}
          data-test-id={deliveredTestId}
        />
        <span>¿Entregó el trabajo?</span>
      </label>
    </div>
    <hr />
    <div class="form-group">
      <span class="d-block mb-1">Resultado:</span>
      <label for="approved-yes-{idSuffix}">
        <input
          type="radio"
          id="approved-yes-{idSuffix}"
          name="approved-{idSuffix}"
          value={true}
          checked={d.workflow_status === DeliveryWorkflowStatus.APPROVED}
          onchange={() => {
            d.workflow_status = DeliveryWorkflowStatus.APPROVED;
          }}
          data-test-id={approvedTestId}
        />
        <span>Aprobado</span>
      </label>
      <label for="approved-no-{idSuffix}">
        <input
          type="radio"
          id="approved-no-{idSuffix}"
          name="approved-{idSuffix}"
          value={false}
          checked={d.workflow_status === DeliveryWorkflowStatus.REJECTED}
          onchange={() => {
            d.workflow_status = DeliveryWorkflowStatus.REJECTED;
          }}
          data-test-id={approvedTestId}
        />
        <span>No Aprobado</span>
      </label>
    </div>
    <div class="form-group">
      <label for="grade-{idSuffix}">Nota:</label>
      <input
        type="number"
        id="grade-{idSuffix}"
        step="0.1"
        bind:value={d.grade}
        class="input-block"
        data-test-id={gradeTestId}
      />
    </div>
    <div class="form-group">
      <label for="ai_level-{idSuffix}">Uso de IA:</label>
      <select
        id="ai_level-{idSuffix}"
        bind:value={d.ai_level}
        class="input-block"
        data-test-id={aiLevelTestId}
      >
        <option value={0}>0 - Ninguno</option>
        <option value={1}>1 - Sospecha (!)</option>
        <option value={2}>2 - Certeza (!!)</option>
      </select>
    </div>
    <div class="form-group">
      <label for="comments-{idSuffix}">Comentarios:</label>
      <textarea
        id="comments-{idSuffix}"
        bind:value={d.comments}
        rows="3"
        class="input-block"
        data-test-id={commentsTestId}
      ></textarea>
    </div>
    <hr />
    <div class="row">
      <div class="col-4 col">
        {#if onPrev}<button class="paper-btn btn-block" onclick={onPrev}>« Anterior</button>{/if}
      </div>
      <div class="col-4 col">
        <button
          class="paper-btn btn-success btn-block"
          onclick={() => onSave(d)}
          data-test-id={submitTestId}>GUARDAR</button
        >
      </div>
      <div class="col-4 col">
        {#if onSkip}<button class="paper-btn btn-block" onclick={onSkip}>Saltar »</button>{/if}
      </div>
    </div>
  </div>
</div>

<style>
  .d-block {
    display: block;
  }
  .mb-1 {
    margin-bottom: 0.25rem;
  }
</style>
