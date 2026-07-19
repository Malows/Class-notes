import { json } from "@sveltejs/kit";

import { commissionService } from "$lib/server/services/commission.service";

export async function GET({ url }) {
  try {
    const periodID = url.searchParams.get("period_id")
      ? Number(url.searchParams.get("period_id"))
      : undefined;
    const commissions = commissionService.getAll(periodID);
    return json({ data: commissions });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const { period_id, name } = await request.json();
    const newCommission = commissionService.create(period_id, name);
    return json({ data: newCommission }, { status: 201 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
