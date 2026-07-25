import { json } from "@sveltejs/kit";

import { deliveryService } from "$lib/server/services/delivery.service";

export async function GET({ url }: { url: URL }) {
  try {
    const commissionParam = url.searchParams.get("commission_id");
    const periodParam = url.searchParams.get("period_id");

    if (commissionParam) {
      const data = deliveryService.getCommissionOverviewData(Number(commissionParam));
      return json({ data });
    } else if (periodParam) {
      const data = deliveryService.getPeriodOverviewData(Number(periodParam));
      return json({ data });
    }

    return json({ error: "Missing commission_id or period_id" }, { status: 400 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
