<script lang="ts">
  import { getContext, type Snippet } from "svelte";
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";

  import type { CommissionsStore } from "$lib/client/stores/commissions.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";

  interface Props {
    title: string;
    lead?: string;
    testId?: string;
    /** The screen's primary action, aligned with the title. */
    primary?: Snippet;
    /** A supporting row under the title (for example "« Volver"). */
    secondary?: Snippet;
  }

  let { title, lead, testId, primary, secondary }: Props = $props();

  const facultiesStore = getContext<FacultiesStore | undefined>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore | undefined>(StoreKey.SUBJECTS);
  const periodsStore = getContext<PeriodsStore | undefined>(StoreKey.PERIODS);
  const commissionsStore = getContext<CommissionsStore | undefined>(StoreKey.COMMISSIONS);

  // A cursada page states the cursada it belongs to: faculty · subject ·
  // period, plus the commission when there is one. The names are derived here
  // so routes do not have to pass anything.
  const contextLead = $derived.by(() => {
    if (lead) return undefined;

    const params = page.params ?? {};
    const facultySlug = params.faculty;
    const subjectSlug = params.subject;
    if (!facultySlug || !subjectSlug) return undefined;

    const subject = subjectsStore?.bySlug.get(subjectSlug);
    const parts: Array<string | undefined> = [
      subject?.faculty_name ?? facultiesStore?.bySlug.get(facultySlug)?.name,
      subject?.name,
    ];

    const year = params.year ? Number(params.year) : undefined;
    const semester = params.semester ? Number(params.semester) : undefined;
    if (year !== undefined && semester !== undefined) {
      parts.push($t("layout.period_short", { year, semester } as never));
    }

    if (params.commission) {
      const periodId =
        year !== undefined && semester !== undefined
          ? periodsStore?.items.find((item) => item.year === year && item.semester === semester)?.id
          : undefined;
      const commission =
        subject && periodId !== undefined
          ? commissionsStore?.findInScope(subject.id, periodId, params.commission)
          : undefined;
      if (commission) parts.push(commission.name);
    }

    return parts.filter(Boolean).join(" · ") || undefined;
  });

  const displayLead = $derived(lead ?? contextLead);
</script>

<header class="flex flex-col gap-3 border-b border-base-300 pb-4">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1
      class="m-0 font-serif text-display-lg-mobile tracking-[-0.015em] text-base-content md:text-display-lg"
      data-test-id={testId}
    >
      {title}
    </h1>
    {#if primary}
      <div class="flex items-center gap-2">
        {@render primary()}
      </div>
    {/if}
  </div>

  {#if displayLead}
    <p class="m-0 text-body-md text-on-surface-variant" data-test-id="page-context">
      {displayLead}
    </p>
  {/if}

  {#if secondary}
    <div class="flex flex-wrap items-center gap-2">
      {@render secondary()}
    </div>
  {/if}
</header>
