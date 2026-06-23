import { deliveryRepository } from "$lib/server/repositories/delivery.repository";
import { json } from "@sveltejs/kit";

export async function GET({ url }) {
  try {
    const commissionParam = url.searchParams.get("commission_id");
    const subjectParam = url.searchParams.get("subject_id");

    if (commissionParam) {
      const data = deliveryRepository.getCommissionOverviewData(Number(commissionParam));
      return json({ data });
    } else if (subjectParam) {
      const data = deliveryRepository.getSubjectOverviewData(Number(subjectParam));
      return json({ data });
    }

    return json({ error: "Missing commission_id or subject_id" }, { status: 400 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
