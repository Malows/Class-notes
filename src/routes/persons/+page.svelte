<script lang="ts">
  import { onMount } from "svelte";

  import { t } from "$lib/common/i18n/config";
  import type { PersonRegistryRow } from "$lib/common/types/enrollment";

  import Button from "$lib/client/components/common/Button.svelte";
  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import EmptyState from "$lib/client/components/common/EmptyState.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import MobileCard from "$lib/client/components/common/MobileCard.svelte";
  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";
  import PageWithAdd from "$lib/client/components/layout/PageWithAdd.svelte";
  import PersonModal from "$lib/client/components/modals/PersonModal.svelte";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import { personService } from "$lib/client/services/person.service";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";
  import { scheduleDeferredDelete } from "$lib/client/utils/deferred-delete";

  const PHONE_PAGE_SIZE = 20;
  const DESKTOP_PAGE_SIZE = 50;
  const PHONE_MEDIA_QUERY = "(max-width: 767px)";

  const modal = new ModalManager<PersonRegistryRow>();

  let items = $state<PersonRegistryRow[]>([]);
  let total = $state(0);
  let query = $state("");
  let pageSize = $state(DESKTOP_PAGE_SIZE);
  let loading = $state(true);
  let loadingMore = $state(false);
  let failed = $state(false);
  let deleteFailure = $state<PersonRegistryRow | null>(null);

  let requestToken = 0;
  let mediaQuery: MediaQueryList | null = null;

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
      const page = await personService.list(query, pageSize, offset);
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
    // A new query always starts from the first page, whatever was loaded before.
    void load();
  }

  function handleViewportChange() {
    const next = mediaQuery?.matches ? PHONE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
    if (next === pageSize) return;
    pageSize = next;
    // The first page under the new size is a fresh list, not an append.
    void load();
  }

  async function handleCreate(name: string, legajo: string) {
    await personService.create(name, legajo || null);
    await load();
    notificationsStore.addSuccess($t("persons.created_success"));
    modal.close();
  }

  function handleDelete() {
    const target = modal.target;
    if (!target) return;

    const previousIndex = items.findIndex((row) => row.id === target.id);
    const removedQuery = query;
    items = items.filter((row) => row.id !== target.id);
    total = Math.max(0, total - 1);
    deleteFailure = null;
    modal.close();

    scheduleDeferredDelete({
      commit: () => personService.remove(target.id),
      restore: () => {
        // The list may have been refiltered while the window was open; in that
        // case the row no longer belongs to the current query.
        if (query !== removedQuery) {
          void load();
          return;
        }
        const restored = [...items];
        restored.splice(
          previousIndex < 0 ? restored.length : Math.min(previousIndex, restored.length),
          0,
          target,
        );
        items = restored;
        total += 1;
      },
      message: $t("persons.deleted_success"),
      undoLabel: $t("common.undo"),
      onError: () => {
        deleteFailure = target;
      },
    });
  }

  // The failed row is back in the list; retrying goes through the same
  // confirmation instead of deleting on a bare click.
  function retryDelete() {
    const target = deleteFailure;
    if (!target) return;
    deleteFailure = null;
    modal.openDelete(target);
  }

  const hasMore = $derived(items.length < total);

  const lastCursada = (row: PersonRegistryRow) =>
    row.last_subject_name
      ? `${row.last_subject_name} · ${$t("layout.period_short", {
          year: row.last_period_year,
          semester: row.last_period_semester,
        } as never)}`
      : null;

  onMount(() => {
    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      mediaQuery = window.matchMedia(PHONE_MEDIA_QUERY);
      pageSize = mediaQuery.matches ? PHONE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
      mediaQuery.addEventListener("change", handleViewportChange);
    }
    void load();

    return () => mediaQuery?.removeEventListener("change", handleViewportChange);
  });
</script>

<svelte:head>
  <title>{$t("persons.index_title")} - {$t("layout.brand")}</title>
</svelte:head>

<PageWithAdd title={$t("persons.index_title")} onAdd={() => modal.openCreate()}>
  <!-- Sticky below the fixed shell header (h-16 on phones, h-12 from md), so the
       field stays reachable while a long registry scrolls. -->
  <div
    class="sticky top-16 z-20 -mx-4 bg-surface px-4 py-2 md:top-12 md:-mx-9 md:px-9"
    data-test-id="persons-search-sticky"
  >
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
  </div>

  {#if deleteFailure}
    <div data-test-id="person-delete-error">
      <LoadError message={$t("persons.delete_failed")} onRetry={retryDelete} />
    </div>
  {/if}

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
        <th>{$t("layout.actions")}</th>
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
        <td>
          <RowActions label={person.name} testId="person-row-actions-{person.id}">
            {#snippet destructive()}
              <Button
                onclick={() => modal.openDelete(person)}
                testId="person-delete-{person.id}"
                withHover
              >
                {$t("common.delete")}
              </Button>
            {/snippet}
          </RowActions>
        </td>
      {/snippet}
      {#snippet card(person)}
        <MobileCard
          title={person.name}
          href="/persons/{person.id}"
          titleTestId="person-card-link-{person.id}"
          compact
          meta={[
            { label: $t("persons.column_legajo"), value: person.legajo ?? "—" },
            {
              label: $t("persons.column_last_cursada"),
              value: lastCursada(person) ?? $t("persons.no_cursadas"),
            },
          ]}
          testId="person-card-{person.id}"
        >
          {#snippet actions()}
            <RowActions label={person.name} testId="person-card-actions-{person.id}">
              {#snippet destructive()}
                <Button
                  onclick={() => modal.openDelete(person)}
                  testId="person-card-delete-{person.id}"
                  withHover
                >
                  {$t("common.delete")}
                </Button>
              {/snippet}
            </RowActions>
          {/snippet}
        </MobileCard>
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

  <ConfirmDialog
    isOpen={modal.isDelete}
    title={$t("persons.delete_confirm_title")}
    message={$t("persons.delete_confirm_message", {
      name: modal.target?.name ?? "",
    } as never)}
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />
</PageWithAdd>
