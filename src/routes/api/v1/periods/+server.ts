import { json } from "@sveltejs/kit";

import { periodService } from "$lib/server/services/period.service";

export async function GET({ url }: { url: URL }) {
  try {
    const subjectID = url.searchParams.get("subject_id")
      ? Number(url.searchParams.get("subject_id"))
      : undefined;
    const periods = periodService.getAll(subjectID);
    return json({ data: periods });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const { subject_id, year, semester } = await request.json();
    const newPeriod = periodService.create(subject_id, year, semester);
    return json({ data: newPeriod }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Period already exists for this subject") {
      return json({ error: error.message }, { status: 409 });
    }
    return json({ error: error.message }, { status: 500 });
  }
}
