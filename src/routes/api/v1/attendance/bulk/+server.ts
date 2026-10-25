import { json } from "@sveltejs/kit";

import type { AttendanceStatus } from "$lib/common/types/attendance";
import {
  AttendanceTargetNotFoundError,
  attendanceService,
} from "$lib/server/services/attendance.service";
import { CrossCursadaError } from "$lib/server/repositories/enrollment.repository";

const isStatus = (value: unknown): value is AttendanceStatus =>
  value === "PRESENT" || value === "ABSENT";

export async function POST({ request }: { request: Request }) {
  try {
    const body = await request.json();
    const assignmentId = Number(body?.assignment_id);

    if (!Number.isFinite(assignmentId) || assignmentId <= 0) {
      return json({ error: "Missing assignment_id" }, { status: 400 });
    }

    if (!Array.isArray(body?.entries) || body.entries.length === 0) {
      return json({ error: "Missing entries" }, { status: 400 });
    }

    const entries = body.entries.map((entry: any) => ({
      enrollment_id: Number(entry?.enrollment_id),
      status: entry?.status,
    }));

    if (entries.some((entry: any) => !isStatus(entry.status) || !entry.enrollment_id)) {
      return json({ error: "Invalid entry" }, { status: 400 });
    }

    const records = attendanceService.bulk(assignmentId, entries);

    return json({ data: records }, { status: 201 });
  } catch (error: any) {
    if (error instanceof AttendanceTargetNotFoundError) {
      return json({ error: error.message }, { status: 404 });
    }
    if (error instanceof CrossCursadaError) {
      return json({ error: error.message }, { status: 409 });
    }
    return json({ error: error.message }, { status: 500 });
  }
}
