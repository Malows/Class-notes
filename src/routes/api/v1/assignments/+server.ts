import { json } from "@sveltejs/kit";

import { assignmentService } from "$lib/server/services/assignment.service";

export async function GET({ url }: { url: URL }) {
  try {
    const periodID = url.searchParams.get("period_id")
      ? Number(url.searchParams.get("period_id"))
      : undefined;
    const assignments = assignmentService.getAll(periodID);
    return json({ data: assignments });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const { period_id, title, subtitle, workflow_status } = await request.json();
    const newAssignment = assignmentService.create(period_id, title, subtitle, workflow_status);
    return json({ data: newAssignment }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
