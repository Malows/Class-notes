import { json } from "@sveltejs/kit";

import { studentService } from "$lib/server/services/student.service";

export async function PUT({ params, request }) {
  try {
    const id = Number(params.id);
    const { name } = await request.json();
    const updatedStudent = studentService.update(id, name);
    if (!updatedStudent) {
      return json({ error: "Student not found" }, { status: 404 });
    }
    return json({ data: updatedStudent });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  try {
    const id = Number(params.id);
    studentService.delete(id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
