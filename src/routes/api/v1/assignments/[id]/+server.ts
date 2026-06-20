import { assignmentRepository } from "$lib/server/repositories/assignment.repository";
import { json } from "@sveltejs/kit";

export async function PUT({ params, request }) {
  try {
    const id = Number(params.id);
    const { title, subtitle } = await request.json();
    const updatedAssignment = assignmentRepository.update(id, title, subtitle);
    if (!updatedAssignment) {
      return json({ error: "Assignment not found" }, { status: 404 });
    }
    return json({ data: updatedAssignment });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  try {
    const id = Number(params.id);
    assignmentRepository.delete(id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
