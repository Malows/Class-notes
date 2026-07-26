import { json } from "@sveltejs/kit";

import { periodService } from "$lib/server/services/period.service";

export async function PUT({
  params,
  request,
}: {
  params: Record<string, string>;
  request: Request;
}) {
  try {
    const id = Number(params.id);
    const { year, semester } = await request.json();
    const updatedPeriod = periodService.update(id, Number(year), Number(semester));
    if (!updatedPeriod) {
      return json({ error: "Period not found" }, { status: 404 });
    }
    return json({ data: updatedPeriod });
  } catch (error: any) {
    if (error.message === "Period already exists for this subject") {
      return json({ error: error.message }, { status: 409 });
    }
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params }: { params: Record<string, string> }) {
  try {
    const id = Number(params.id);
    periodService.delete(id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
