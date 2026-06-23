import { deliveryRepository } from "$lib/server/repositories/delivery.repository";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  try {
    const commissionParam = url.searchParams.get("commission_id");
    const periodParam = url.searchParams.get("period_id");

    if (commissionParam) {
      const data = deliveryRepository.getCommissionOverviewData(Number(commissionParam));
      return json({ data });
    } else if (periodParam) {
      const data = deliveryRepository.getPeriodOverviewData(Number(periodParam));
      return json({ data });
    }

    return json({ error: "Missing commission_id or period_id" }, { status: 400 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
