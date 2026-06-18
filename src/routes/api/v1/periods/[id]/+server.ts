import { periodRepository } from "$lib/server/repositories/period.repository";
import { json } from "@sveltejs/kit";

export async function PUT({ params, request }) {
  try {
    const id = Number(params.id);
    const { year, semester } = await request.json();
    const updatedPeriod = periodRepository.update(id, Number(year), Number(semester));
    if (!updatedPeriod) {
      return json({ error: "Period not found" }, { status: 404 });
    }
    return json({ data: updatedPeriod });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  try {
    const id = Number(params.id);
    periodRepository.delete(id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
