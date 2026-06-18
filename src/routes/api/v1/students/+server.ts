import { studentRepository } from "$lib/server/repositories/student.repository";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  try {
    const commissionID = url.searchParams.get("commission_id");
    const students = commissionID
      ? studentRepository.getAll(Number(commissionID))
      : studentRepository.getAll();
    return json({ data: students });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { commission_id, names } = await request.json();
    studentRepository.createBulk(commission_id, names);
    return json({ status: "created" }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
