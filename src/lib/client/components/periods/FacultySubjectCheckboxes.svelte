<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Subject } from "$lib/common/types/academic";
  import Button from "$lib/client/components/common/Button.svelte";
  import CheckboxInput from "$lib/client/components/periods/CheckboxInput.svelte";

  interface Props {
    facultyName: string;
    facultySlug: string;
    subjects: Subject[];
    selectedSubjectIds: number[];
    onToggle: (subjectId: number) => void;
  }

  let { facultyName, facultySlug, subjects, selectedSubjectIds, onToggle }: Props = $props();
</script>

<div
  class="w-full rounded-[var(--radius-box)] border border-base-300 bg-base-100 p-4"
  style="max-width: var(--faculty-subjects-column-max-width);"
>
  <fieldset class="m-0 min-w-0 border-0 p-0">
    <legend
      class="mb-2 flex w-full flex-wrap items-center justify-between gap-2 text-title-md font-semibold"
    >
      <span>{facultyName}</span>
      <Button href="/faculties/{facultySlug}/subjects" class="btn-ghost btn-sm">
        {$t("layout.go_to_faculty")}
      </Button>
    </legend>

    <div class="flex flex-col gap-2">
      {#each subjects as subject}
        <CheckboxInput
          id={`subject-${subject.id}`}
          label={subject.name}
          checked={selectedSubjectIds.includes(subject.id)}
          onToggle={() => onToggle(subject.id)}
        />
      {/each}
    </div>
  </fieldset>
</div>
