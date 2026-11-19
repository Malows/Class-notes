<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import { EnrollmentEntrySchema } from "$lib/common/schemas";
  import type { EnrollmentInput, Person } from "$lib/common/types/enrollment";

  import DialogBase from "../common/DialogBase.svelte";
  import Button from "../common/Button.svelte";
  import ErrorSpan from "../common/ErrorSpan.svelte";

  interface Props {
    isOpen: boolean;
    searchPersons: (query: string) => Promise<Person[]>;
    onCreate: (entries: EnrollmentInput[]) => void;
    onClose: () => void;
  }

  let { isOpen, searchPersons, onCreate, onClose }: Props = $props();

  let activeTab = $state<"single" | "bulk">("single");
  let name = $state("");
  let legajo = $state("");
  let bulkNames = $state("");
  let results = $state<Person[]>([]);
  let selected = $state<Person | null>(null);
  let error = $state("");
  let errorField = $state<"name" | "legajo" | "bulk" | "form" | null>(null);

  $effect(() => {
    if (isOpen) {
      activeTab = "single";
      name = "";
      legajo = "";
      bulkNames = "";
      results = [];
      selected = null;
      error = "";
      errorField = null;
    }
  });

  function clearError() {
    error = "";
    errorField = null;
  }

  async function handleSearch(value: string) {
    name = value;
    selected = null;
    clearError();

    if (value.trim().length < 2) {
      results = [];
      return;
    }

    try {
      const matches = await searchPersons(value.trim());
      results = matches.slice(0, 5);
    } catch {
      // A failed lookup must not look like an empty result set.
      results = [];
      error = "enrollments.search_failed";
      errorField = "name";
    }
  }

  function pickPerson(person: Person) {
    selected = person;
    name = person.name;
    legajo = person.legajo ?? "";
    results = [];
  }

  function clearSelection() {
    selected = null;
    name = "";
    legajo = "";
  }

  function handleSaveClick() {
    clearError();

    if (activeTab === "bulk") {
      const entries = bulkNames
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => ({ name: line }));

      if (entries.length === 0) {
        error = "validation.at_least_one_name_required";
        errorField = "bulk";
        return;
      }

      onCreate(entries);
      return;
    }

    const parsed = EnrollmentEntrySchema.safeParse({ name, legajo });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      error = issue?.message ?? "";
      errorField = issue?.path[0] === "legajo" ? "legajo" : "name";
      return;
    }

    const entry: EnrollmentInput = {
      name: name.trim(),
      legajo: legajo.trim() ? legajo.trim() : null,
    };
    if (selected) {
      entry.person_id = selected.id;
    }

    onCreate([entry]);
  }
</script>

<DialogBase {isOpen} title={$t("enrollments.new_title")} {onClose}>
  {#snippet children()}
    <div class="mb-4 flex gap-2">
      <Button
        class={activeTab === "single" ? "btn-secondary" : "btn-ghost"}
        aria-pressed={activeTab === "single"}
        onclick={() => {
          activeTab = "single";
          clearError();
        }}
      >
        {$t("students.single_name_label")}
      </Button>
      <Button
        class={activeTab === "bulk" ? "btn-secondary" : "btn-ghost"}
        aria-pressed={activeTab === "bulk"}
        onclick={() => {
          activeTab = "bulk";
          clearError();
        }}
      >
        {$t("students.upload_students_title")}
      </Button>
    </div>

    {#if activeTab === "single"}
      <div class="form-group">
        <label for="enrollment-search">{$t("enrollments.search_label")}</label>
        <input
          type="text"
          id="enrollment-search"
          bind:value={name}
          oninput={(event) => handleSearch((event.currentTarget as HTMLInputElement).value)}
          placeholder={$t("enrollments.search_placeholder")}
          class="input-block"
          aria-invalid={errorField === "name" && !!error}
          aria-describedby={
            errorField === "name" && error ? "error-enrollment" : undefined
          }
          data-test-id="enrollment-search-input"
        />
        {#if errorField === "name"}
          <ErrorSpan message={error} id="error-enrollment" testId="enrollment-error" />
        {/if}
        {#if results.length > 0}
          <ul class="m-0 mt-2 flex list-none flex-col gap-1 p-0" data-test-id="enrollment-search-results">
            {#each results as person (person.id)}
              <li>
                <button
                  type="button"
                  class="btn btn-ghost btn-sm w-full justify-start"
                  onclick={() => pickPerson(person)}
                  data-test-id="enrollment-search-result-{person.id}"
                >
                  {person.name}{person.legajo ? ` · ${person.legajo}` : ""}
                </button>
              </li>
            {/each}
          </ul>
        {/if}
        {#if selected}
          <p class="text-body-sm text-on-surface-variant" data-test-id="enrollment-reuse-hint">
            {$t("enrollments.reuse_hint")}
            <button type="button" class="btn btn-ghost btn-sm" onclick={clearSelection}>
              {$t("common.cancel")}
            </button>
          </p>
        {/if}
      </div>

      <div class="form-group">
        <label for="student-external-id">{$t("students.external_id_label")}</label>
        <input
          type="text"
          id="student-external-id"
          bind:value={legajo}
          placeholder={$t("students.external_id_placeholder")}
          class="input-block"
          aria-invalid={errorField === "legajo" && !!error}
          aria-describedby={
            errorField === "legajo" && error ? "error-enrollment" : undefined
          }
          oninput={() => errorField === "legajo" && clearError()}
          data-test-id="student-external-id-input"
        />
        {#if errorField === "legajo"}
          <ErrorSpan message={error} id="error-enrollment" testId="enrollment-error" />
        {/if}
      </div>
    {:else}
      <div class="form-group">
        <label for="names">{$t("enrollments.paste_list_label")}</label>
        <textarea
          id="names"
          bind:value={bulkNames}
          rows="5"
          class="input-block"
          aria-invalid={errorField === "bulk" && !!error}
          aria-describedby={errorField === "bulk" && error ? "error-enrollment" : undefined}
          oninput={() => errorField === "bulk" && clearError()}
          data-test-id="student-bulk-textarea"
        ></textarea>
        {#if errorField === "bulk"}
          <ErrorSpan message={error} id="error-enrollment" testId="enrollment-error" />
        {/if}
      </div>
    {/if}

    {#if errorField === "form"}
      <ErrorSpan message={error} id="error-enrollment" testId="enrollment-error" />
    {/if}
  {/snippet}

  {#snippet footer()}
    <Button class="btn-ghost" testId="cancel-btn" onclick={onClose}>{$t("common.cancel")}</Button>
    <Button class="btn-primary" testId="submit-btn" onclick={handleSaveClick}>
      {$t("common.create")}
    </Button>
  {/snippet}
</DialogBase>
