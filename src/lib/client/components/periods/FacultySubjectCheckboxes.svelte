<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Subject } from "$lib/common/types/academic";
  import CheckboxInput from "$lib/client/components/periods/CheckboxInput.svelte";

  interface Props {
    facultyName: string;
    facultyId: number;
    subjects: Subject[];
    selectedSubjectIds: number[];
    onToggle: (subjectId: number) => void;
  }

  let { facultyName, facultyId, subjects, selectedSubjectIds, onToggle }: Props = $props();
</script>

<fieldset class="form-group mt-4 faculty-subjects">
  <legend class="row between gap-2 items-center legend-title">
    <span>{facultyName}</span>
    <a href="/faculties/{facultyId}/subjects" class="paper-btn btn-small">
      {$t("layout.go_to_faculty")}
    </a>
  </legend>

  {#each subjects as subject}
    <CheckboxInput
      id={`subject-${subject.id}`}
      label={subject.name}
      checked={selectedSubjectIds.includes(subject.id)}
      onToggle={() => onToggle(subject.id)}
    />
  {/each}
</fieldset>

<style>
  .faculty-subjects {
    max-width: var(--faculty-subjects-column-max-width);
    width: 100%;
  }

  .legend-title {
    font-weight: 700;
    font-size: 1.05rem;
    margin-bottom: 0.5rem;
  }
</style>
