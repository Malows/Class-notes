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
    const studentIDStr = url.searchParams.get("student_id");
    if (assignmentIDStr !== null && studentIDStr !== null) {
      const assignmentID = Number(assignmentIDStr);
      const studentID = Number(studentIDStr);
      const delivery = deliveryService.getOne(assignmentID, studentID);
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
