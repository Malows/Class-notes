import { AssignmentsStore } from "$lib/client/stores/assignments.svelte";
import { CommissionsStore } from "$lib/client/stores/commissions.svelte";
import { FacultiesStore } from "$lib/client/stores/faculties.svelte";
import { NavStore } from "$lib/client/stores/nav.svelte";
import { PeriodsStore } from "$lib/client/stores/periods.svelte";
import { StudentsStore } from "$lib/client/stores/students.svelte";
import { SubjectsStore } from "$lib/client/stores/subjects.svelte";
import { StoreKey } from "$lib/common";
import { setContext } from "svelte";

import { MetadataStore } from "$lib/client/stores/metadata.svelte";

export function initStoreContext() {
  setContext(StoreKey.FACULTIES, new FacultiesStore());
  setContext(StoreKey.SUBJECTS, new SubjectsStore());
  setContext(StoreKey.PERIODS, new PeriodsStore());
  setContext(StoreKey.COMMISSIONS, new CommissionsStore());
  setContext(StoreKey.ASSIGNMENTS, new AssignmentsStore());
  setContext(StoreKey.STUDENTS, new StudentsStore());
  setContext(StoreKey.NAV, new NavStore());
  setContext(StoreKey.METADATA, new MetadataStore());
}
