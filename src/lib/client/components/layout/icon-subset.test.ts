import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import * as fontkit from "fontkit";
import { describe, expect, test } from "vitest";

const fontPath = path.join(process.cwd(), "static/fonts/material-symbols-icons.woff2");
const srcRoot = path.join(process.cwd(), "src");

/** Icon names that are chosen in a ternary rather than passed as a literal prop. */
const ternaryIcons = ["light_mode", "dark_mode"];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    if (entry.name.includes(".test.") || entry.name.endsWith(".d.ts")) return [];
    return /\.(svelte|ts)$/.test(entry.name) ? [full] : [];
  });
}

function usedIconNames(): Set<string> {
  const names = new Set<string>(ternaryIcons);
  for (const file of sourceFiles(srcRoot)) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(
      /material-symbols-outlined[^>]*>\s*([a-z_]+)\s*</g,
    )) {
      names.add(match[1]);
    }
    for (const match of source.matchAll(/\bicon[:=]\s*"([a-z_]+)"/g)) {
      names.add(match[1]);
    }
  }
  return names;
}

describe("Material Symbols subset", () => {
  test("contains a ligature for every icon name used in the app", () => {
    const font = fontkit.create(readFileSync(fontPath));
    const names = usedIconNames();

    expect([...names].sort()).toEqual(
      expect.arrayContaining([
        "account_balance",
        "add",
        "calendar_month",
        "dashboard",
        "dark_mode",
        "edit",
        "groups",
        "light_mode",
        "local_library",
      ]),
    );

    for (const name of names) {
      const run = font.layout(name);
      // A missing ligature falls back to one glyph per letter, not one icon.
      expect(run.glyphs.length, `${name} is not a ligature in the subset`).toBe(1);
      expect(run.glyphs[0].id, `${name} maps to .notdef`).not.toBe(0);
    }
  });
});
