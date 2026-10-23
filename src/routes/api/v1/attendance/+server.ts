import { json } from "@sveltejs/kit";

import { attendanceService } from "$lib/server/services/attendance.service";

export async function GET({ url }: { url: URL }) {
  try {
    const commissionId = url.searchParams.get("commission_id");
    const subjectPeriodId = url.searchParams.get("subject_period_id");

    if (commissionId) {
      const grid = attendanceService.getGridByCommission(Number(commissionId));
      if (!grid) {
        return json({ error: "Commission not found" }, { status: 404 });
      }
      return json({ data: grid });
    }

    if (subjectPeriodId) {
      const grid = attendanceService.getGridByCursada(Number(subjectPeriodId));
      if (!grid) {
        return json({ error: "Cursada not found" }, { status: 404 });
      }
      return json({ data: grid });
    }

    return json({ error: "Missing commission_id or subject_period_id" }, { status: 400 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
