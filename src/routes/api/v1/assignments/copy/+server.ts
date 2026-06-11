import { json } from "@sveltejs/kit";
import { assignmentRepository } from "$lib/server/repositories/assignment.repository";

export async function POST({ request }) {
  try {
    const { source_period_id, target_period_id } = await request.json();
    assignmentRepository.copy(source_period_id, target_period_id);
    return json({ status: "copied" }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
