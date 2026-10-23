import { json } from "@sveltejs/kit";

import { enrollmentService } from "$lib/server/services/enrollment.service";
import { CrossCursadaError } from "$lib/server/repositories/enrollment.repository";

export async function PATCH({
  params,
  request,
}: {
  params: Record<string, string>;
  request: Request;
}) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return json({ error: "Invalid enrollment id" }, { status: 400 });
    }

    const { commission_id } = await request.json();
    if (commission_id === undefined) {
      return json({ error: "Missing commission_id" }, { status: 400 });
    }

    const updated = enrollmentService.assignCommission(
      id,
      commission_id === null ? null : Number(commission_id),
    );
    return json({ data: updated });
  } catch (error: any) {
    if (error instanceof CrossCursadaError) {
      return json({ error: error.message }, { status: 409 });
    }
    if (error.message === "Enrollment not found") {
      return json({ error: error.message }, { status: 404 });
    }
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params }: { params: Record<string, string> }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return json({ error: "Invalid enrollment id" }, { status: 400 });
    }

    enrollmentService.remove(id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
