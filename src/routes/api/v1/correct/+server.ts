import { deliveryRepository } from "$lib/server/repositories/delivery.repository";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  try {
    const commissionID = Number(url.searchParams.get("commission_id"));
    const deliveries = deliveryRepository.getAllByCommission(commissionID);
    return json({ data: deliveries });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }) {
  try {
    const delivery = await request.json();
    deliveryRepository.save(delivery);
    return json({ status: "saved" }, { status: 200 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
