import { facultyRepository } from "$lib/server/repositories/faculty.repository";
import { json } from "@sveltejs/kit";

export async function PUT({ params, request }) {
  try {
    const id = Number(params.id);
    const { name } = await request.json();
    const updatedFaculty = facultyRepository.update(id, name);
    if (!updatedFaculty) {
      return json({ error: "Faculty not found" }, { status: 404 });
    }
    return json({ data: updatedFaculty });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  try {
    const id = Number(params.id);
    facultyRepository.delete(id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
