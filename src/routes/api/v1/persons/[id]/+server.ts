import { json } from "@sveltejs/kit";

import { personService } from "$lib/server/services/person.service";
import { LegajoConflictError } from "$lib/server/repositories/person.repository";

export async function GET({ params }: { params: Record<string, string> }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return json({ error: "Invalid person id" }, { status: 400 });
    }

    const detail = personService.findWithEnrollments(id);
    if (!detail) {
      return json({ error: "Person not found" }, { status: 404 });
    }

    return json({ data: detail });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params }: { params: Record<string, string> }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return json({ error: "Invalid person id" }, { status: 400 });
    }

    if (!personService.findById(id)) {
      return json({ error: "Person not found" }, { status: 404 });
    }

    personService.delete(id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function PUT({
  params,
  request,
}: {
  params: Record<string, string>;
  request: Request;
}) {  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return json({ error: "Invalid person id" }, { status: 400 });
    }

    const { name, legajo } = await request.json();
    if (!name) {
      return json({ error: "Missing name" }, { status: 400 });
    }

    const updated = personService.update(id, name, legajo ?? null);
    if (!updated) {
      return json({ error: "Person not found" }, { status: 404 });
    }

    return json({ data: updated });
  } catch (error: any) {
    if (error instanceof LegajoConflictError) {
      return json({ error: error.message }, { status: 409 });
    }
    return json({ error: error.message }, { status: 500 });
  }
}
