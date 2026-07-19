import { json } from "@sveltejs/kit";

import { deliveryService } from "$lib/server/services/delivery.service";

export async function GET() {
  try {
    const stats = deliveryService.getGlobalStats();
    return json({ data: stats });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
