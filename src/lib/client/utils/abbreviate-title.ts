/**
 * Builds the short label a grid header shows for an assignment.
 *
 * "Trabajo Práctico 2" -> "TP2" (trailing number kept, initials before it)
 * "Lab Exercise 12" -> "LE12"
 * "Discrete Mathematics" -> "DM"
 *
 * The full title always stays available through the header's title/aria-label.
 */
export function abbreviateTitle(title: string): string {
  const words = title.trim().split(/\s+/).filter((word) => word.length > 0);
  if (words.length === 0) return "";

  const last = words.at(-1)!;
  if (words.length > 1 && /^\d+$/.test(last)) {
    const prefix = words.slice(0, -1);
    // "TP 1" already carries its abbreviation; keep it whole instead of "T1".
    if (prefix.every((word) => word.length <= 3 && word === word.toUpperCase())) {
      return prefix.join("") + last;
    }
    return prefix.map(initial).join("") + last;
  }

  return words.map(initial).join("");
}

function initial(word: string): string {
  if (/^\d+$/.test(word)) return word;
  return word.charAt(0).toUpperCase();
}
