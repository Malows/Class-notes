import { json } from "@sveltejs/kit";

import { assignmentService } from "$lib/server/services/assignment.service";

export async function POST({ request }: { request: Request }) {
  try {
    const { source_period_id, target_period_id } = await request.json();
    assignmentService.copy(source_period_id, target_period_id);
    return json({ status: "copied" }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
