import { json } from "@sveltejs/kit";
import { commissionRepository } from "$lib/server/repositories/commission.repository";

export async function GET() {
  try {
    const commissions = commissionRepository.getAll();
    return json({ data: commissions });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { period_id, name } = await request.json();
    const newCommission = commissionRepository.create(period_id, name);
    return json({ data: newCommission }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
