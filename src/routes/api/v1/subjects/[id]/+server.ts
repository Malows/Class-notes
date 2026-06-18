import { subjectRepository } from "$lib/server/repositories/subject.repository";
import { json } from "@sveltejs/kit";

export async function PUT({ params, request }) {
  try {
    const id = Number(params.id);
    const { name } = await request.json();
    const updatedSubject = subjectRepository.update(id, name);
    if (!updatedSubject) {
      return json({ error: "Subject not found" }, { status: 404 });
    }
    return json({ data: updatedSubject });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  try {
    const id = Number(params.id);
    subjectRepository.delete(id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
