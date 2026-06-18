import { readFileSync, readdirSync, statSync } from "fs";
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

// Recursively find all Svelte, TS, and JS files in src/
function findFiles(dir: string, extensions: string[]): string[] {
  let results: string[] = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findFiles(filePath, extensions));
    } else {
      if (extensions.some((ext) => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  }
  return results;
}

const enDir = "src/lib/i18n/en";
const esDir = "src/lib/i18n/es";

const enFiles = readdirSync(enDir);

let error = false;

// 1. Gather all defined keys in both EN and ES with their corresponding prefix namespaces
const definedEnKeys = new Set<string>();
const definedEsKeys = new Set<string>();

for (const file of enFiles) {
  if (!file.endsWith(".json")) continue;

  const enContent = JSON.parse(readFileSync(join(enDir, file), "utf-8"));
  const esContent = JSON.parse(readFileSync(join(esDir, file), "utf-8"));

  const namespace = file.replace(".json", "");
  const enKeys = getKeys(enContent, namespace);
  const esKeys = getKeys(esContent, namespace);

  // Validate cross-translation presence
  enKeys.forEach((k) => {
    definedEnKeys.add(k);
    if (!esKeys.has(k)) {
      console.error(`Key "${k}" defined in en/${file} but missing in es/${file}`);
      error = true;
    }
  });

  esKeys.forEach((k) => {
    definedEsKeys.add(k);
    if (!enKeys.has(k)) {
      console.error(`Key "${k}" defined in es/${file} but missing in en/${file}`);
      error = true;
    }
  });
}

// 2. Scan the src/ directory codebase for any literal requested keys that are undefined
const codeFiles = findFiles("src", [".svelte", ".ts", ".js"]);
const tKeyRegex = /\$t\(\s*['"]([^'"]+)['"]/g;

for (const file of codeFiles) {
  const content = readFileSync(file, "utf-8");
  let match;
  // Reset regex lastIndex
  tKeyRegex.lastIndex = 0;

  while ((match = tKeyRegex.exec(content)) !== null) {
    const requestedKey = match[1];

    // Check if the requested key exists in defined translations
    if (!definedEnKeys.has(requestedKey)) {
      console.error(`Error: Translation key "${requestedKey}" is requested in "${file}" but is not defined in the English i18n JSON files.`);
      error = true;
    }
    if (!definedEsKeys.has(requestedKey)) {
      console.error(`Error: Translation key "${requestedKey}" is requested in "${file}" but is not defined in the Spanish i18n JSON files.`);
      error = true;
    }
  }
}

if (error) {
  console.error("\ni18n verification failed. Please resolve the translation issues above.");
  process.exit(1);
}

console.log("i18n keys and codebase usage validated successfully.");
