import { json } from "@sveltejs/kit";

import { facultyService } from "$lib/server/services/faculty.service";

export async function PUT({
  params,
  request,
}: {
  params: Record<string, string>;
  request: Request;
}) {
  try {
    const id = Number(params.id);
    const { name } = await request.json();
    const updatedFaculty = facultyService.update(id, name);
    if (!updatedFaculty) {
      return json({ error: "Faculty not found" }, { status: 404 });
    }
    return json({ data: updatedFaculty });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params }: { params: Record<string, string> }) {
  try {
    const id = Number(params.id);
    facultyService.delete(id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
