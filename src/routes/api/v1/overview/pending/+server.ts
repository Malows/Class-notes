import { json } from "@sveltejs/kit";

import { deliveryService } from "$lib/server/services/delivery.service";

export async function GET() {
  try {
    const summary = deliveryService.getPendingSummary();
    return json({ data: summary });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
