import { readFileSync, readdirSync } from "fs";
import { join } from "path";

function getKeys(obj: any, prefix = ""): Set<string> {
  let keys = new Set<string>();
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === "object" && obj[key] !== null) {
      const childKeys = getKeys(obj[key], fullKey);
      childKeys.forEach((k) => keys.add(k));
    } else {
      keys.add(fullKey);
    }
  }
  return keys;
}

const enDir = "src/lib/i18n/en";
const esDir = "src/lib/i18n/es";

const enFiles = readdirSync(enDir);

let error = false;

for (const file of enFiles) {
  if (!file.endsWith(".json")) continue;

  const enContent = JSON.parse(readFileSync(join(enDir, file), "utf-8"));
  const esContent = JSON.parse(readFileSync(join(esDir, file), "utf-8"));

  const enKeys = getKeys(enContent);
  const esKeys = getKeys(esContent);

  enKeys.forEach((k) => {
    if (!esKeys.has(k)) {
      console.error(`Key ${k} missing in es/${file}`);
      error = true;
    }
  });
  esKeys.forEach((k) => {
    if (!enKeys.has(k)) {
      console.error(`Key ${k} missing in en/${file}`);
      error = true;
    }
  });
}

if (error) process.exit(1);
console.log("i18n keys validated successfully.");
