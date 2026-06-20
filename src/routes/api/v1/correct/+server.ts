import { deliveryRepository } from "$lib/server/repositories/delivery.repository";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  try {
    const commissionIDStr = url.searchParams.get("commission_id");
    if (commissionIDStr !== null) {
      const commissionID = Number(commissionIDStr);
      const deliveries = deliveryRepository.getAllByCommission(commissionID);
      return json({ data: deliveries });
    }

    const assignmentIDStr = url.searchParams.get("assignment_id");
    const studentIDStr = url.searchParams.get("student_id");
    if (assignmentIDStr !== null && studentIDStr !== null) {
      const assignmentID = Number(assignmentIDStr);
      const studentID = Number(studentIDStr);
      const delivery = deliveryRepository.getOne(assignmentID, studentID);
      return json({ data: delivery });
    }

    return json({ error: "Missing query parameters" }, { status: 400 });
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
