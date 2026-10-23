<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import { EnrollmentEntrySchema } from "$lib/common/schemas";
  import type { EnrollmentInput, Person } from "$lib/common/types/enrollment";

  import DialogBase from "../common/DialogBase.svelte";
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

  $effect(() => {
    if (isOpen) {
      activeTab = "single";
      name = "";
      legajo = "";
      bulkNames = "";
      results = [];
      selected = null;
      error = "";
    }
  });

  async function handleSearch(value: string) {
    name = value;
    selected = null;

    if (value.trim().length < 2) {
      results = [];
      return;
    }

    const matches = await searchPersons(value.trim());
    results = matches.slice(0, 5);
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
    error = "";

    if (activeTab === "bulk") {
      const entries = bulkNames
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => ({ name: line }));

      if (entries.length === 0) {
        error = $t("validation.at_least_one_name_required");
        return;
      }

      onCreate(entries);
      return;
    }

    const parsed = EnrollmentEntrySchema.safeParse({ name, legajo });
    if (!parsed.success) {
      error = parsed.error.issues[0]?.message ?? "";
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
    <div class="row flex-center gap-2 mb-1" style="margin-bottom: 1.5rem;">
      <button
        type="button"
        class="paper-btn btn-small {activeTab === 'single'
          ? 'btn-secondary'
          : 'btn-secondary-outline'}"
        onclick={() => {
          activeTab = "single";
          error = "";
        }}
      >
        {$t("students.single_name_label")}
      </button>
      <button
        type="button"
        class="paper-btn btn-small {activeTab === 'bulk'
          ? 'btn-secondary'
          : 'btn-secondary-outline'}"
        onclick={() => {
          activeTab = "bulk";
          error = "";
        }}
      >
        {$t("students.upload_students_title")}
      </button>
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
          data-test-id="enrollment-search-input"
        />
        {#if results.length > 0}
          <ul class="enrollment-search-results" data-test-id="enrollment-search-results">
            {#each results as person (person.id)}
              <li>
                <button
                  type="button"
                  class="paper-btn btn-small"
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
          <p class="text-small" data-test-id="enrollment-reuse-hint">
            {$t("enrollments.reuse_hint")}
            <button type="button" class="paper-btn btn-small" onclick={clearSelection}>
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
          data-test-id="student-external-id-input"
        />
      </div>
    {:else}
      <div class="form-group">
        <label for="names">{$t("enrollments.paste_list_label")}</label>
        <textarea
          id="names"
          bind:value={bulkNames}
          rows="5"
          class="input-block"
          data-test-id="student-bulk-textarea"
        ></textarea>
      </div>
    {/if}

    <ErrorSpan message={error} id="error-enrollment" testId="enrollment-error" />
  {/snippet}

  {#snippet footer()}
    <button class="paper-btn" data-test-id="cancel-btn" onclick={onClose}
      >{$t("common.cancel")}</button
    >
    <button class="paper-btn btn-secondary" data-test-id="submit-btn" onclick={handleSaveClick}>
      {$t("common.create")}
    </button>
  {/snippet}
</DialogBase>

<style>
  .enrollment-search-results {
    list-style: none;
    padding: 0;
    margin: 0.5rem 0 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
</style>
