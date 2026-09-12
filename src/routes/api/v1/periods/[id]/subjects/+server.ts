import { json } from "@sveltejs/kit";

import { periodSubjectService } from "$lib/server/services/period-subject.service";

export async function GET({ params }: { params: { id: string } }) {
  try {
    const periodId = Number(params.id);
    if (!Number.isFinite(periodId)) {
      return json({ error: "Invalid period id" }, { status: 400 });
    }

    const subjects = periodSubjectService.getAll(periodId);
    return json({ data: subjects });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ params, request }: { params: { id: string }; request: Request }) {
  try {
    const periodId = Number(params.id);
    if (!Number.isFinite(periodId)) {
      return json({ error: "Invalid period id" }, { status: 400 });
    }

    const payload = await request.json();
    const subjectIds = Array.isArray(payload?.subject_ids)
      ? payload.subject_ids.map((id: unknown) => Number(id))
      : [];

    const subjects = periodSubjectService.sync(periodId, subjectIds);
    return json({ data: subjects }, { status: 200 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function PUT({ params, request }: { params: { id: string }; request: Request }) {
  return POST({ params, request });
}
