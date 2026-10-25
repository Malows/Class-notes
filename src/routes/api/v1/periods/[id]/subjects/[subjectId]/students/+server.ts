import { json } from "@sveltejs/kit";

import { enrollmentService } from "$lib/server/services/enrollment.service";

export async function GET({ params }: { params: { id: string; subjectId: string } }) {
  try {
    const periodId = Number(params.id);
    const subjectId = Number(params.subjectId);

    if (
      !Number.isFinite(periodId) ||
      !Number.isFinite(subjectId) ||
      periodId <= 0 ||
      subjectId <= 0
    ) {
      return json({ error: "Invalid period or subject id" }, { status: 400 });
    }

    const roster = enrollmentService.getCursadaRoster(subjectId, periodId);
    if (!roster) {
      return json({ error: "Cursada not found" }, { status: 404 });
    }

    return json({ data: roster });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
