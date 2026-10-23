<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import type { Person, PersonDetail } from "$lib/common/types/enrollment";

  import Button from "$lib/client/components/common/Button.svelte";
  import ConfirmDialog from "$lib/client/components/common/ConfirmDialog.svelte";
  import PersonModal from "$lib/client/components/modals/PersonModal.svelte";
  import { ModalManager } from "$lib/client/composables/useModal.svelte";
  import { personService } from "$lib/client/services/person.service";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  const modal = new ModalManager<Person>();

  let detail = $state<PersonDetail | null>(null);
  let loading = $state(true);

  const personID = Number(page.params.id);

  const commissionHref = (cursada: PersonDetail["enrollments"][number]) =>
    `/faculties/${cursada.faculty_slug}/subjects/${cursada.subject_slug}/periods/${cursada.period_year}/${cursada.period_semester}/commissions/${cursada.commission_slug}/overview`;

  async function load() {
    try {
      if (!Number.isFinite(personID) || personID <= 0) {
        detail = null;
        return;
      }
      detail = await personService.getById(personID);
    } catch (e) {
      console.error(e);
      detail = null;
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

<p>
  <a href="/persons" class="paper-btn btn-small">{$t("persons.back_to_registry")}</a>
</p>

{#if loading}
  <p>{$t("persons.loading")}</p>
{:else if !detail}
  <p data-test-id="person-detail-not-found">{$t("persons.not_found")}</p>
{:else}
  <h2 data-test-id="person-detail-name">{detail.person.name}</h2>
  <p>
    {$t("persons.legajo_label")}:
    <span data-test-id="person-detail-legajo">{detail.person.legajo ?? "—"}</span>
  </p>

  <div class="row gap-2 margin-bottom-small">
    <Button testId="edit-person-btn" onclick={() => detail && modal.openEdit(detail.person)} withHover>
      {$t("common.edit")}
    </Button>
    <Button
      testId="delete-person-btn"
      onclick={() => detail && modal.openDelete(detail.person)}
      withHover
      class="btn-danger"
    >
      {$t("common.delete")}
    </Button>
  </div>

  <h3>{$t("persons.cursadas_title")}</h3>

  {#if detail.enrollments.length === 0}
    <p data-test-id="person-detail-no-enrollments">{$t("persons.no_enrollments")}</p>
  {:else}
    <ul class="cursada-list">
      {#each detail.enrollments as cursada (cursada.id)}
        <li data-test-id="person-cursada-{cursada.id}">
          <strong>{cursada.subject_name}</strong>
          <span class="text-small">
            · {cursada.period_year} - {cursada.period_semester}º
          </span>
          <span class="cursada-list__commission">
            {#if cursada.commission_slug && cursada.commission_name}
              <a
                href={commissionHref(cursada)}
                data-test-id="person-cursada-link-{cursada.id}"
              >
                {cursada.commission_name}
              </a>
            {:else}
              <span class="text-small" data-test-id="person-cursada-sin-comision-{cursada.id}"
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

  .cursada-list__commission {
    margin-left: 0.5rem;
  }
</style>
