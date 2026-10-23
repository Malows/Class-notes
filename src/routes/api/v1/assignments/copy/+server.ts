import { json } from "@sveltejs/kit";

import { assignmentService } from "$lib/server/services/assignment.service";

export async function POST({ request }: { request: Request }) {
  try {
    const { source_subject_period_id, target_subject_period_id } = await request.json();

    if (!source_subject_period_id || !target_subject_period_id) {
      return json(
        { error: "Missing source_subject_period_id or target_subject_period_id" },
        { status: 400 },
      );
    }

    assignmentService.copy(source_subject_period_id, target_subject_period_id);
    return json({ status: "copied" }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
