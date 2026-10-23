import { json } from "@sveltejs/kit";

import { enrollmentService } from "$lib/server/services/enrollment.service";
import { LegajoConflictError } from "$lib/server/repositories/person.repository";
import {
  CrossCursadaError,
  EnrollmentConflictError,
} from "$lib/server/repositories/enrollment.repository";

export async function GET({ url }: { url: URL }) {
  try {
    const commissionID = url.searchParams.get("commission_id");
    const subjectPeriodID = url.searchParams.get("subject_period_id");
    const pending = url.searchParams.get("pending");

    if (commissionID) {
      return json({ data: enrollmentService.getRoster(Number(commissionID)) });
    }

    if (subjectPeriodID) {
      const data = pending
        ? enrollmentService.getPending(Number(subjectPeriodID))
        : enrollmentService.getByCursada(Number(subjectPeriodID));
      return json({ data });
    }

    return json({ error: "Missing commission_id or subject_period_id" }, { status: 400 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const { subject_period_id, commission_id, entries } = await request.json();

    if (!subject_period_id || !Array.isArray(entries) || entries.length === 0) {
      return json(
        { error: "Missing subject_period_id or entries" },
        { status: 400 },
      );
    }

    const report = enrollmentService.register(
      Number(subject_period_id),
      entries,
      commission_id === undefined ? null : commission_id,
    );

    return json({ data: report }, { status: 201 });
  } catch (error: any) {
    if (error instanceof LegajoConflictError) {
      return json({ error: error.message }, { status: 409 });
    }
    if (error instanceof EnrollmentConflictError || error instanceof CrossCursadaError) {
      return json({ error: error.message }, { status: 409 });
    }
    return json({ error: error.message }, { status: 500 });
  }
}
