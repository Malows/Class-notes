import { AssignmentsStore } from "$lib/stores/assignments.svelte";
import { CommissionsStore } from "$lib/stores/commissions.svelte";
import { FacultiesStore } from "$lib/stores/faculties.svelte";
import { NavStore } from "$lib/stores/nav.svelte";
import { PeriodsStore } from "$lib/stores/periods.svelte";
import { StudentsStore } from "$lib/stores/students.svelte";
import { SubjectsStore } from "$lib/stores/subjects.svelte";
import { StoreKey } from "$lib/types";
import { setContext } from "svelte";

export function initStoreContext() {
  setContext(StoreKey.FACULTIES, new FacultiesStore());
  setContext(StoreKey.SUBJECTS, new SubjectsStore());
  setContext(StoreKey.PERIODS, new PeriodsStore());
  setContext(StoreKey.COMMISSIONS, new CommissionsStore());
  setContext(StoreKey.ASSIGNMENTS, new AssignmentsStore());
  setContext(StoreKey.STUDENTS, new StudentsStore());
  setContext(StoreKey.NAV, new NavStore());
}
