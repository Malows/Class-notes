import { assignmentRepository } from "$lib/server/repositories/assignment.repository";
import { json } from "@sveltejs/kit";

export async function PUT({ params, request }) {
  try {
    const id = Number(params.id);
    const { status } = await request.json();
    assignmentRepository.updateStatus(id, status);
    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
