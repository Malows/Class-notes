<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import DeliveryForm from "$lib/components/DeliveryForm.svelte";
  import { t } from "$lib/i18n/config";
  import { assignmentService } from "$lib/services/assignment.service";
  import { correctionService } from "$lib/services/correction.service";
  import { studentService } from "$lib/services/student.service";
  import type { Delivery, Student, Assignment } from "$lib/types";
  import { onMount } from "svelte";
  import { notificationsStore } from "$lib/stores/notifications.svelte";

  let students = $state<Student[]>([]);
  let assignment = $state<Assignment | null>(null);
  let delivery = $state<Delivery | null>(null);
  let currentIndex = $state(0);
  let loading = $state(true);

  const facultyID = Number(page.params.faculty_id);
  const subjectID = Number(page.params.subject_id);
  const periodID = Number(page.params.period_id);
  const commissionID = Number(page.params.commission_id);

  const assignmentID = Number(page.url.searchParams.get("assignment_id"));
  const initialStudentID = Number(page.url.searchParams.get("student_id"));
  const mode = page.url.searchParams.get("mode") || "all";

  const baseUrl = `/faculties/${facultyID}/subjects/${subjectID}/periods/${periodID}/commissions/${commissionID}`;

  async function loadData() {
    try {
      students = await studentService.getAll(commissionID);
      if (initialStudentID) {
        currentIndex = students.findIndex((s) => s.id === initialStudentID);
        if (currentIndex === -1) currentIndex = 0;
      }

      const allAssignments = await assignmentService.getAll(periodID);
      assignment = allAssignments.find((a) => a.id === assignmentID) || null;

      await loadDelivery();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function loadDelivery() {
    const student = students[currentIndex];
    if (!student) return;
    delivery = await correctionService.getOne(assignmentID, student.id);
  }

  async function saveDelivery(d: Delivery) {
    try {
      await correctionService.save(d);
      notificationsStore.addSuccess("Corrección guardada con éxito");
      if (mode === "single" || currentIndex === students.length - 1) {
        goto(`${baseUrl}/overview`);
      } else {
        currentIndex++;
        await loadDelivery();
      }
    } catch (e: any) {
      notificationsStore.addError(e.message || e);
    }
  }

  function skip() {
    if (currentIndex < students.length - 1) {
      currentIndex++;
      loadDelivery();
    } else {
      goto(`${baseUrl}/overview`);
    }
  }

  function prev() {
    if (currentIndex > 0) {
      currentIndex--;
      loadDelivery();
    }
  }

  onMount(loadData);
</script>

<svelte:head>
  <title>{$t("layout.correct")} - {$t("layout.brand")}</title>
</svelte:head>

<h2>{$t("layout.correct")} {assignment?.title || "TP"}</h2>
<p>
  {$t("layout.student")}: {students[currentIndex]?.name || "..."} ({currentIndex + 1}
  {$t("common.of")}
  {students.length})
</p>

{#if loading}
  <p>{$t("common.loading")}</p>
{:else if delivery}
  <DeliveryForm
    {delivery}
    onSave={saveDelivery}
    onPrev={currentIndex > 0 ? prev : undefined}
    onSkip={skip}
  />
{/if}
