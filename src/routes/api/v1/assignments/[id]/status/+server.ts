import { json } from "@sveltejs/kit";

import { assignmentService } from "$lib/server/services/assignment.service";

export async function PUT({ params, request }) {
  try {
    const id = Number(params.id);
    const { status } = await request.json();
    assignmentService.updateStatus(id, status);
    return json({ success: true });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
