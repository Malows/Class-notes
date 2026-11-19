<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import type { Person, PersonDetail } from "$lib/common/types/enrollment";

  import Button from "$lib/client/components/common/Button.svelte";
  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";
  import PageHeader from "$lib/client/components/layout/PageHeader.svelte";
  import PersonModal from "$lib/client/components/modals/PersonModal.svelte";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import { personService } from "$lib/client/services/person.service";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  const modal = new ModalManager<Person>();

  let detail = $state<PersonDetail | null>(null);
  let loading = $state(true);
  let failure = $state<"not-found" | "error" | null>(null);

  const personID = Number(page.params.id);

  const commissionHref = (cursada: PersonDetail["enrollments"][number]) =>
    `/faculties/${cursada.faculty_slug}/subjects/${cursada.subject_slug}/periods/${cursada.period_year}/${cursada.period_semester}/commissions/${cursada.commission_slug}/overview`;

  async function load() {
    loading = true;
    failure = null;

    try {
      if (!Number.isFinite(personID) || personID <= 0) {
        detail = null;
        failure = "not-found";
        return;
      }
      detail = await personService.getById(personID);
    } catch (e) {
      detail = null;
      // apiFetch throws the API's message, not a status: a missing person is the
      // one 404 this endpoint has, and it arrives as "Person not found".
      failure = e instanceof Error && /not found/i.test(e.message) ? "not-found" : "error";
      if (failure === "error") console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleSave(name: string, legajo: string) {
    await personService.update(personID, name, legajo || null);
    await load();
    notificationsStore.addSuccess($t("persons.updated_success"));
    modal.close();
  }

  async function handleDelete() {
    try {
      await personService.remove(personID);
      notificationsStore.addSuccess($t("persons.deleted_success"));
      modal.close();
      await goto("/persons");
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  onMount(load);
</script>

<svelte:head>
  <title>{$t("persons.detail_title")} - {$t("layout.brand")}</title>
</svelte:head>

{#snippet backLink()}
  <Button href="/persons" class="btn-small">{$t("persons.back_to_registry")}</Button>
{/snippet}

{#if loading}
  <PageHeader title={$t("persons.detail_title")}>
    {#snippet secondary()}{@render backLink()}{/snippet}
  </PageHeader>
  <p>{$t("persons.loading")}</p>
{:else if failure === "not-found"}
  <PageHeader title={$t("persons.detail_title")}>
    {#snippet secondary()}{@render backLink()}{/snippet}
  </PageHeader>
  <div role="status" data-test-id="person-detail-not-found">
    <p class="font-serif text-headline-sm">{$t("persons.not_found_title")}</p>
    <p class="text-on-surface-variant">{$t("persons.not_found_body")}</p>
  </div>
{:else if failure === "error"}
  <PageHeader title={$t("persons.detail_title")}>
    {#snippet secondary()}{@render backLink()}{/snippet}
  </PageHeader>
  <LoadError message={$t("persons.load_failed")} onRetry={load} />
{:else if !detail}
  <PageHeader title={$t("persons.detail_title")}>
    {#snippet secondary()}{@render backLink()}{/snippet}
  </PageHeader>
  <p data-test-id="person-detail-not-found">{$t("persons.not_found_title")}</p>
{:else}
  <PageHeader title={detail.person.name} testId="person-detail-name">
    {#snippet primary()}
      <RowActions label={detail?.person.name ?? ""} testId="person-actions">
        {#snippet primary()}
          <Button
            testId="edit-person-btn"
            onclick={() => detail && modal.openEdit(detail.person)}
            withHover
          >
            {$t("common.edit")}
          </Button>
        {/snippet}
        {#snippet destructive()}
          <Button
            testId="delete-person-btn"
            onclick={() => detail && modal.openDelete(detail.person)}
            withHover
          >
            {$t("common.delete")}
          </Button>
        {/snippet}
      </RowActions>
    {/snippet}
    {#snippet secondary()}{@render backLink()}{/snippet}
  </PageHeader>
  <p>
    {$t("persons.legajo_label")}:
    <span data-test-id="person-detail-legajo">{detail.person.legajo ?? "—"}</span>
  </p>

  <h2>{$t("persons.cursadas_title")}</h2>

  {#if detail.enrollments.length === 0}
    <p data-test-id="person-detail-no-enrollments">{$t("persons.no_enrollments")}</p>
  {:else}
    <ul class="cursada-list">
      {#each detail.enrollments as cursada (cursada.id)}
        <li class="cursada-list__item" data-test-id="person-cursada-{cursada.id}">
          <strong>{cursada.subject_name}</strong>
          <span class="text-body-sm" data-test-id="person-cursada-period-{cursada.id}">
            {$t("layout.period_short", {
              year: cursada.period_year,
              semester: cursada.period_semester,
            } as never)}
          </span>
          <span class="cursada-list__commission">
            {#if cursada.commission_slug && cursada.commission_name}
              <a
                class="link-editorial text-body-sm"
                href={commissionHref(cursada)}
                data-test-id="person-cursada-link-{cursada.id}"
              >
                {cursada.commission_name}
              </a>
            {:else}
              <span class="text-body-sm" data-test-id="person-cursada-sin-comision-{cursada.id}"
                >{$t("persons.sin_comision")}</span
              >
            {/if}
          </span>
        </li>
      {/each}
    </ul>
  {/if}

  <PersonModal
    isOpen={modal.isCreate || modal.isEdit}
    mode={modal.mode === "create" ? "create" : "edit"}
    person={modal.target}
    onSave={handleSave}
    onClose={() => modal.close()}
  />

  <ConfirmDialog
    isOpen={modal.isDelete}
    title={$t("persons.delete_confirm_title")}
    message={$t("persons.delete_confirm_message", {
      name: detail?.person.name ?? "",
    } as never)}
    onConfirm={handleDelete}
    onClose={() => modal.close()}
  />
{/if}

<style>
  .cursada-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .cursada-list__item {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.25rem 0.5rem;
  }
</style>
