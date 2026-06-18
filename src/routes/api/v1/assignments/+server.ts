import { assignmentRepository } from "$lib/server/repositories/assignment.repository";
import { json } from "@sveltejs/kit";

export async function GET() {
  try {
    const assignments = assignmentRepository.getAll();
    return json({ data: assignments });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { period_id, title } = await request.json();
    const newAssignment = assignmentRepository.create(period_id, title);
    return json({ data: newAssignment }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
