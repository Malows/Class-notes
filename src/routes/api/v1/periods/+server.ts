import { json } from "@sveltejs/kit";
import { periodRepository } from "$lib/server/repositories/period.repository";

export async function GET() {
  try {
    const periods = periodRepository.getAll();
    return json({ data: periods });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { subject_id, year, semester } = await request.json();
    const newPeriod = periodRepository.create(subject_id, year, semester);
    return json({ data: newPeriod }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
