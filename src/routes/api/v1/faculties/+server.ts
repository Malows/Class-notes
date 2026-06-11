import { json } from "@sveltejs/kit";
import { facultyRepository } from "$lib/server/repositories/faculty.repository";

export async function GET() {
  try {
    const faculties = facultyRepository.getAll();
    return json({ data: faculties });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { name } = await request.json();
    const newFaculty = facultyRepository.create(name);
    return json({ data: newFaculty }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
