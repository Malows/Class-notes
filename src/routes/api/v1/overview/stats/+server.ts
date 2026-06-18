import { deliveryRepository } from "$lib/server/repositories/delivery.repository";
import { json } from "@sveltejs/kit";

export async function GET() {
  try {
    const stats = deliveryRepository.getGlobalStats();
    return json({ data: stats });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
