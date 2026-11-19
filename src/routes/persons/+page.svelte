<script lang="ts">
  import { onMount } from "svelte";

  import { t } from "$lib/common/i18n/config";
  import type { Person, PersonRegistryRow } from "$lib/common/types/enrollment";

  import Button from "$lib/client/components/common/Button.svelte";
  import EmptyState from "$lib/client/components/common/EmptyState.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import MobileCard from "$lib/client/components/common/MobileCard.svelte";
  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
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
  let failed = $state(false);

  let requestToken = 0;

  async function load({ append = false } = {}) {
    const token = ++requestToken;
    if (append) {
      loadingMore = true;
    } else {
      loading = true;
      failed = false;
    }

    try {
      const offset = append ? items.length : 0;
      const page = await personService.list(query, PAGE_SIZE, offset);
      if (token !== requestToken) return;

      items = append ? [...items, ...page.items] : page.items;
      total = page.total;
    } catch (e) {
      console.error(e);
      // A failed "load more" keeps the rows already on screen; only the first
      // page turns the view into a retryable error.
      if (!append && token === requestToken) {
        failed = true;
      }
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
      ? `${row.last_subject_name} · ${$t("layout.period_short", {
          year: row.last_period_year,
          semester: row.last_period_semester,
        } as never)}`
      : null;

  onMount(() => load());
</script>

<svelte:head>
  <title>{$t("persons.index_title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageWithAdd title={$t("persons.index_title")} onAdd={() => modal.openCreate()}>
  <div class="max-w-md">
    <label for="persons-search" class="mb-1 block text-label-md text-on-surface-variant"
      >{$t("persons.search_label")}</label
    >
    <input
      type="search"
      id="persons-search"
      value={query}
      oninput={handleSearch}
      placeholder={$t("persons.search_placeholder")}
      data-test-id="persons-search-input"
    />
  </div>

  {#if loading}
    <p class="text-body-md text-on-surface-variant">{$t("persons.loading")}</p>
  {:else if failed}
    <LoadError onRetry={() => load()} />
  {:else if items.length === 0}
    <EmptyState
      icon="👤"
      title={$t("persons.empty_state")}
      testId="persons-empty"
    />
  {:else}
    <p class="text-body-sm text-on-surface-variant" data-test-id="persons-showing">
      {$t("persons.showing", { shown: items.length, total } as never)}
    </p>

    <ResponsiveTable items={items}>
      {#snippet header()}
        <th>{$t("persons.column_name")}</th>
        <th>{$t("persons.column_legajo")}</th>
        <th>{$t("persons.column_cursadas")}</th>
        <th>{$t("persons.column_last_cursada")}</th>
      {/snippet}
      {#snippet row(person)}
        <td data-label={$t("persons.column_name")} data-test-id="person-name-{person.id}">
          <a class="link-editorial" href="/persons/{person.id}" data-test-id="person-link-{person.id}"
            >{person.name}</a
          >
        </td>
        <td class="tnum" data-label={$t("persons.column_legajo")} data-test-id="person-legajo-{person.id}">{person.legajo ?? "—"}</td>
        <td class="tnum" data-label={$t("persons.column_cursadas")} data-test-id="person-cursadas-{person.id}">{person.enrollment_count}</td>
        <td data-label={$t("persons.column_last_cursada")}>
          {#if lastCursada(person)}
            <span class="text-body-sm" data-test-id="person-last-cursada-{person.id}"
              >{lastCursada(person)}</span
            >
          {:else}
            <span class="text-body-sm text-on-surface-variant" data-test-id="person-no-cursadas-{person.id}"
              >{$t("persons.no_cursadas")}</span
            >
          {/if}
        </td>
      {/snippet}
      {#snippet card(person)}
        <MobileCard
          title={person.name}
          href="/persons/{person.id}"
          titleTestId="person-card-link-{person.id}"
          meta={[
            { label: $t("persons.column_legajo"), value: person.legajo ?? "—" },
            { label: $t("persons.column_cursadas"), value: person.enrollment_count },
            {
              label: $t("persons.column_last_cursada"),
              value: lastCursada(person) ?? $t("persons.no_cursadas"),
            },
          ]}
          testId="person-card-{person.id}"
        />
      {/snippet}
    </ResponsiveTable>

    {#if hasMore}
      <div class="mt-4 flex justify-center">
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
