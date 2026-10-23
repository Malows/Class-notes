export interface MatchCandidate {
  id: number;
  name: string;
  legajo: string | null;
}

export interface MatchEntry {
  name: string;
  legajo?: string | null;
}

/**
 * Reproduces SQLite's `COLLATE NOCASE` semantics in memory: trims, collapses
 * internal whitespace and lowercases ASCII letters only. Accented characters keep
 * their case, so "JOSÉ" and "José" do not match — the legajo is the deterministic
 * path for those cases.
 */
export function normalizePersonName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[A-Z]/g, (char) => char.toLowerCase());
}

export function findPersonMatch<T extends MatchCandidate>(
  entry: MatchEntry,
  candidates: T[],
): T | undefined {
  const legajo = entry.legajo?.trim();
  if (legajo) {
    const byLegajo = candidates.find((candidate) => candidate.legajo === legajo);
    if (byLegajo) {
      return byLegajo;
    }
  }

  const normalizedName = normalizePersonName(entry.name);
  if (!normalizedName) {
    return undefined;
  }

  return candidates.find(
    (candidate) => normalizePersonName(candidate.name) === normalizedName,
  );
}
