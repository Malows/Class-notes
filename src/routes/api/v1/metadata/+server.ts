import { metadataService } from "$lib/server/services/metadata.service";
import { json } from "@sveltejs/kit";

export async function GET() {
  try {
    const payload = await metadataService.getAcademicMetadata();
    return json({ data: payload });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}
