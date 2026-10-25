import { json } from "@sveltejs/kit";

import type { AttendanceStatus } from "$lib/common/types/attendance";
import {
  AttendanceTargetNotFoundError,
  attendanceService,
} from "$lib/server/services/attendance.service";
import { CrossCursadaError } from "$lib/server/repositories/enrollment.repository";

const isStatus = (value: unknown): value is AttendanceStatus =>
  value === "PRESENT" || value === "ABSENT";

const parseIds = (params: Record<string, string>) => {
  const assignmentId = Number(params.assignmentId);
  const enrollmentId = Number(params.enrollmentId);

  if (
    !Number.isFinite(assignmentId) ||
    !Number.isFinite(enrollmentId) ||
    assignmentId <= 0 ||
    enrollmentId <= 0
  ) {
    return null;
  }

  return { assignmentId, enrollmentId };
};

export async function GET({ params }: { params: Record<string, string> }) {
  try {
    const ids = parseIds(params);
    if (!ids) {
      return json({ error: "Invalid assignment or enrollment id" }, { status: 400 });
    }

    return json({ data: attendanceService.getOne(ids.assignmentId, ids.enrollmentId) });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function PUT({
  params,
  request,
}: {
  params: Record<string, string>;
  request: Request;
}) {
  try {
    const ids = parseIds(params);
    if (!ids) {
      return json({ error: "Invalid assignment or enrollment id" }, { status: 400 });
    }

    const body = await request.json();
    if (!isStatus(body?.status)) {
      return json({ error: "Missing or invalid status" }, { status: 400 });
    }

    const record = attendanceService.mark(ids.assignmentId, ids.enrollmentId, body.status);

    return json({ data: record });
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

export async function DELETE({ params }: { params: Record<string, string> }) {
  try {
    const ids = parseIds(params);
    if (!ids) {
      return json({ error: "Invalid assignment or enrollment id" }, { status: 400 });
    }

    attendanceService.unmark(ids.assignmentId, ids.enrollmentId);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
