/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

/**
 * Checks that every messages/<locale>.json has exactly the same keys as
 * messages/en.json (the source of truth). Exits 1 and lists the differences
 * when any locale has missing or extra keys.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const messagesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "messages",
);
const SOURCE_LOCALE = "en";

function flattenKeys(value, prefix = "") {
  if (value === null || typeof value !== "object") return [prefix];
  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

function loadKeys(locale) {
  const raw = readFileSync(path.join(messagesDir, `${locale}.json`), "utf8");
  return new Set(flattenKeys(JSON.parse(raw)));
}

const sourceKeys = loadKeys(SOURCE_LOCALE);
const locales = readdirSync(messagesDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.slice(0, -".json".length))
  .filter((locale) => locale !== SOURCE_LOCALE);

let failed = false;

for (const locale of locales) {
  const keys = loadKeys(locale);
  const missing = [...sourceKeys].filter((key) => !keys.has(key));
  const extra = [...keys].filter((key) => !sourceKeys.has(key));
  if (missing.length === 0 && extra.length === 0) continue;

  failed = true;
  console.error(`messages/${locale}.json is out of sync with en.json:`);
  for (const key of missing) console.error(`  missing: ${key}`);
  for (const key of extra) console.error(`  extra:   ${key}`);
}

if (failed) process.exit(1);
console.log(
  `i18n keys in sync: ${locales.length + 1} locales, ${sourceKeys.size} keys each.`,
);
