import { json } from "@sveltejs/kit";
import { commissionRepository } from "$lib/server/repositories/commission.repository";

export async function PUT({ params, request }) {
  try {
    const id = Number(params.id);
    const { name } = await request.json();
    const updatedCommission = commissionRepository.update(id, name);
    if (!updatedCommission) {
      return json({ error: "Commission not found" }, { status: 404 });
    }
    return json({ data: updatedCommission });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params }) {
  try {
    const id = Number(params.id);
    commissionRepository.delete(id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
