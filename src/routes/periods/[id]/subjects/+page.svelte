<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import type { Period, Subject } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import CommonPage from "$lib/client/components/layout/CommonPage.svelte";
  import FacultySubjectCheckboxes from "$lib/client/components/periods/FacultySubjectCheckboxes.svelte";
  import { notificationsStore } from "$lib/client/stores/notifications.svelte";
  import { periodService } from "$lib/client/services/period.service";
  import { subjectService } from "$lib/client/services/subject.service";
  import { groupSubjectsByFaculty } from "$lib/client/utils/subject-grouping";

  const periodId = Number(page.params.id);

  let loading = $state(true);
  let saving = $state(false);
  let period = $state<Period | null>(null);
  let allSubjects = $state<Subject[]>([]);
  let selectedSubjectIds = $state<number[]>([]);
  let groupedSubjects = $derived(groupSubjectsByFaculty(allSubjects));

  async function loadData() {
    try {
      loading = true;
      const [periodData, subjectsResponse] = await Promise.all([
        periodService.getById(periodId),
        subjectService.getByPeriod(periodId),
      ]);

      period = periodData ?? null;
      allSubjects = await subjectService.getAll();
      selectedSubjectIds = (subjectsResponse as Subject[]).map((subject) => subject.id);
    } catch (error) {
      console.error(error);
      notificationsStore.addError($t("periods.load_period_error"));
    } finally {
      loading = false;
    }
  }

  async function handleSave() {
    saving = true;
    try {
      await subjectService.syncByPeriod(periodId, selectedSubjectIds);
      notificationsStore.addSuccess($t("periods.save_subjects_success"));
    } catch (error) {
      console.error(error);
      notificationsStore.addError($t("periods.save_subjects_error"));
    } finally {
      saving = false;
    }
  }

  function toggleSubject(subjectId: number) {
    selectedSubjectIds = selectedSubjectIds.includes(subjectId)
      ? selectedSubjectIds.filter((id) => id !== subjectId)
      : [...selectedSubjectIds, subjectId];
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("periods.manage_periods_title")} - {$t("layout.brand")}</title>
</svelte:head>

<CommonPage title={period ? `${$t("layout.period")}: ${period.year} / ${period.semester}` : $t("periods.manage_periods_title")}>
  <div>
    <Button href="/periods" class="btn-small">
      {$t("layout.back_to_periods")}
    </Button>
  </div>

  {#if loading}
    <p>{$t("periods.loading_periods")}</p>
  {:else if period}
    <div class="margin-top">
      <div class="row gap-2 page-header">
        <h2 class="text-lg font-semibold page-title">{$t("layout.associated_subjects")}</h2>
        <button class="paper-btn btn-secondary" onclick={handleSave} disabled={saving}>
          {saving ? $t("layout.saving") : $t("layout.save_changes")}
        </button>
      </div>

      <div class="faculty-grid">
        {#each groupedSubjects as group}
          <FacultySubjectCheckboxes
            facultyName={group.facultyName}
            facultyId={group.facultyId}
            subjects={group.subjects}
            selectedSubjectIds={selectedSubjectIds}
            onToggle={toggleSubject}
          />
        {/each}
      </div>
    </div>
  {:else}
    <p>{$t("periods.period_not_found")}</p>
  {/if}
</CommonPage>

<style>
  .page-header {
    align-items: center;
    justify-content: space-between;
  }

  .page-title {
    margin: 0;
    text-align: left;
  }

  .faculty-grid {
    --faculty-subjects-column-max-width: 440px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, var(--faculty-subjects-column-max-width)));
    gap: 1rem;
    align-items: start;
  }
</style>
