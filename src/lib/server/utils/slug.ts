/**
 * Convert a human name into a URL-friendly slug.
 * "Álgebra Lineal" -> "algebra-lineal"
 */
export function slugify(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "item";
}

/**
 * Return `base` if free, otherwise append a numeric suffix until an unused
 * candidate is found. `isTaken` decides whether a candidate is already used,
 * including any scope (faculty) and soft-delete filtering the caller needs.
 */
export function buildUniqueSlug(base: string, isTaken: (candidate: string) => boolean): string {
  let candidate = base;
  let counter = 2;

  while (isTaken(candidate)) {
    candidate = `${base}-${counter}`;
    counter += 1;
  }

  return candidate;
}
