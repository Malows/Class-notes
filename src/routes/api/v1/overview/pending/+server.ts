import { json } from "@sveltejs/kit";
import { deliveryRepository } from "$lib/server/repositories/delivery.repository";

export async function GET() {
  try {
    const summary = deliveryRepository.getPendingSummary();
    return json({ data: summary });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
