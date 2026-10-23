<script lang="ts">
  import { onMount } from "svelte";

  import { t } from "$lib/common/i18n/config";
  import type { Person, PersonRegistryRow } from "$lib/common/types/enrollment";

  import Button from "$lib/client/components/common/Button.svelte";
  import PageWithAdd from "$lib/client/components/layout/PageWithAdd.svelte";
  import PersonModal from "$lib/client/components/modals/PersonModal.svelte";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import { personService } from "$lib/client/services/person.service";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  const PAGE_SIZE = 50;

  const modal = new ModalManager<Person>();

  let items = $state<PersonRegistryRow[]>([]);
  let total = $state(0);
  let query = $state("");
  let loading = $state(true);
  let loadingMore = $state(false);

  let requestToken = 0;

  async function load({ append = false } = {}) {
    const token = ++requestToken;
    if (append) {
      loadingMore = true;
    } else {
      loading = true;
    }

    try {
      const offset = append ? items.length : 0;
      const page = await personService.list(query, PAGE_SIZE, offset);
      if (token !== requestToken) return;

      items = append ? [...items, ...page.items] : page.items;
      total = page.total;
    } catch (e) {
      console.error(e);
    } finally {
      if (token === requestToken) {
        loading = false;
        loadingMore = false;
      }
    }
  }

  function handleSearch(event: Event) {
    query = (event.currentTarget as HTMLInputElement).value;
    void load();
  }

  async function handleCreate(name: string, legajo: string) {
    await personService.create(name, legajo || null);
    await load();
    notificationsStore.addSuccess($t("persons.created_success"));
    modal.close();
  }

  const hasMore = $derived(items.length < total);

  const lastCursada = (row: PersonRegistryRow) =>
    row.last_subject_name
      ? `${row.last_subject_name} · ${row.last_period_year}-${row.last_period_semester}`
      : null;

  onMount(() => load());
</script>

<svelte:head>
  <title>{$t("persons.index_title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageWithAdd title={$t("persons.index_title")} onAdd={() => modal.openCreate()}>
  <div class="form-group">
    <label for="persons-search">{$t("persons.search_label")}</label>
    <input
      type="search"
      id="persons-search"
      value={query}
      oninput={handleSearch}
      placeholder={$t("persons.search_placeholder")}
      class="input-block"
      data-test-id="persons-search-input"
    />
  </div>

  {#if loading}
    <p>{$t("persons.loading")}</p>
  {:else if items.length === 0}
    <p data-test-id="persons-empty">{$t("persons.empty_state")}</p>
  {:else}
    <p class="text-small" data-test-id="persons-showing">
      {$t("persons.showing", { shown: items.length, total } as never)}
    </p>

    <table class="table-hover" data-test-id="persons-table">
      <thead>
        <tr>
          <th>{$t("persons.column_name")}</th>
          <th>{$t("persons.column_legajo")}</th>
          <th>{$t("persons.column_cursadas")}</th>
          <th>{$t("persons.column_last_cursada")}</th>
        </tr>
      </thead>
      <tbody>
        {#each items as person (person.id)}
          <tr data-test-id="person-row-{person.id}">
            <td>
              <a href="/persons/{person.id}" data-test-id="person-link-{person.id}">{person.name}</a>
            </td>
            <td data-test-id="person-legajo-{person.id}">{person.legajo ?? "—"}</td>
            <td data-test-id="person-cursadas-{person.id}">{person.enrollment_count}</td>
            <td>
              {#if lastCursada(person)}
                <span data-test-id="person-last-cursada-{person.id}">{lastCursada(person)}</span>
              {:else}
                <span class="text-small" data-test-id="person-no-cursadas-{person.id}"
                  >{$t("persons.no_cursadas")}</span
                >
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    {#if hasMore}
      <div class="row flex-center margin-top-small">
        <Button testId="persons-load-more" onclick={() => load({ append: true })} withHover>
          {loadingMore ? $t("common.loading") : $t("persons.load_more")}
        </Button>
      </div>
    {/if}
  {/if}

  <PersonModal
    isOpen={modal.isCreate}
    mode="create"
    person={null}
    onSave={handleCreate}
    onClose={() => modal.close()}
  />
</PageWithAdd>
