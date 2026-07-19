import { json } from "@sveltejs/kit";

import { facultyService } from "$lib/server/services/faculty.service";

export async function GET() {
  try {
    const faculties = facultyService.getAll();
    return json({ data: faculties });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { name } = await request.json();
    const newFaculty = facultyService.create(name);
    return json({ data: newFaculty }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
