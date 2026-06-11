import { json } from "@sveltejs/kit";
import { deliveryRepository } from "$lib/server/repositories/delivery.repository";

export async function GET({ url }) {
  try {
    const commissionID = Number(url.searchParams.get("commission_id"));
    const data = deliveryRepository.getOverviewData(commissionID);
    return json({ data });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
