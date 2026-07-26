import { json } from "@sveltejs/kit";

import { commissionService } from "$lib/server/services/commission.service";

export async function PUT({
  params,
  request,
}: {
  params: Record<string, string>;
  request: Request;
}) {
  try {
    const id = Number(params.id);
    const { name } = await request.json();
    const updatedCommission = commissionService.update(id, name);
    if (!updatedCommission) {
      return json({ error: "Commission not found" }, { status: 404 });
    }
    return json({ data: updatedCommission });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE({ params }: { params: Record<string, string> }) {
  try {
    const id = Number(params.id);
    commissionService.delete(id);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
