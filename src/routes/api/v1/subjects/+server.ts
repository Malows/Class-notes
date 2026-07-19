import { json } from "@sveltejs/kit";

import { subjectService } from "$lib/server/services/subject.service";

export async function GET() {
  try {
    const subjects = subjectService.getAll();
    return json({ data: subjects });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { faculty_id, name } = await request.json();
    const newSubject = subjectService.create(faculty_id, name);
    return json({ data: newSubject }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
