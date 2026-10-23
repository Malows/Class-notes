import { json } from "@sveltejs/kit";

import { personService } from "$lib/server/services/person.service";
import { LegajoConflictError } from "$lib/server/repositories/person.repository";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const parseLimit = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!raw || !Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT;
  }
  return Math.min(Math.floor(parsed), MAX_LIMIT);
};

const parseOffset = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!raw || !Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.floor(parsed);
};

export async function GET({ url }: { url: URL }) {
  try {
    const query = url.searchParams.get("q") ?? "";
    const limit = parseLimit(url.searchParams.get("limit"));
    const offset = parseOffset(url.searchParams.get("offset"));

    const page = personService.list(query, limit, offset);
    return json({ data: page });
  } catch (error: any) {
    return json({ error: error.message }, { status: 500 });
  }
}

export async function POST({ request }: { request: Request }) {
  try {
    const { name, legajo } = await request.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return json({ error: "Missing name" }, { status: 400 });
    }

    const person = personService.create(name, legajo ?? null);
    return json({ data: person }, { status: 201 });
  } catch (error: any) {
    if (error instanceof LegajoConflictError) {
      return json({ error: error.message }, { status: 409 });
    }
    return json({ error: error.message }, { status: 500 });
  }
}
