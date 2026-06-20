import { assignmentRepository } from "$lib/server/repositories/assignment.repository";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  try {
    const periodID = url.searchParams.get("period_id")
      ? Number(url.searchParams.get("period_id"))
      : undefined;
    const assignments = assignmentRepository.getAll(periodID);
    return json({ data: assignments });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { period_id, title, subtitle, workflow_status } = await request.json();
    const newAssignment = assignmentRepository.create(period_id, title, subtitle, workflow_status);
    return json({ data: newAssignment }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
