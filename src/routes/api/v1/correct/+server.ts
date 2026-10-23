import { json } from "@sveltejs/kit";

import { deliveryService } from "$lib/server/services/delivery.service";

export async function GET({ url }: { url: URL }) {
  try {
    const commissionIDStr = url.searchParams.get("commission_id");
    if (commissionIDStr !== null) {
      const commissionID = Number(commissionIDStr);
      const deliveries = deliveryService.getAllByCommission(commissionID);
      return json({ data: deliveries });
    }

    const assignmentIDStr = url.searchParams.get("assignment_id");
    const enrollmentIDStr = url.searchParams.get("enrollment_id");
    if (assignmentIDStr !== null && enrollmentIDStr !== null) {
      const assignmentID = Number(assignmentIDStr);
      const enrollmentID = Number(enrollmentIDStr);
      const delivery = deliveryService.getOne(assignmentID, enrollmentID);
      return json({ data: delivery });
    }

    return json({ error: "Missing query parameters" }, { status: 400 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const delivery = await request.json();
    deliveryService.save(delivery);
    return json({ status: "saved" }, { status: 200 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
