import { json } from "@sveltejs/kit";

import { studentService } from "$lib/server/services/student.service";

export async function GET({ url }: { url: URL }) {
  try {
    const commissionID = url.searchParams.get("commission_id");
    const students = commissionID
      ? studentService.getAll(Number(commissionID))
      : studentService.getAll();
    return json({ data: students });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const { commission_id, names } = await request.json();
    studentService.createBulk(commission_id, names);
    return json({ status: "created" }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
