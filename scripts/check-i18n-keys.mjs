/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 7.x.x
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const repoDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const messagesDir = path.join(repoDir, "messages");
const SOURCE_LOCALE = "en";
const SOURCE_DIRS = ["app", "components", "data", "hooks", "i18n", "lib", "types"];

/**
 * Checks that every messages/<locale>.json has exactly the same keys as
 * messages/en.json, and reports source keys without a statically detectable
 * translation call. Dynamic keys exempt their namespace to avoid false positives.
 */
function flattenKeys(value, prefix = "") {
  if (value === null || typeof value !== "object") {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    flattenKeys(child, prefix ? `${prefix}.${key}` : key),
  );
}

function collectSourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collectSourceFiles(entryPath);
    return /\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name) &&
      !entry.name.endsWith(".d.ts")
      ? [entryPath]
      : [];
  });
}

function getStringLiteral(node) {
  if (ts.isStringLiteralLike(node)) return node.text;
  if (ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  return null;
}

function getTranslatorNamespace(initializer) {
  while (
    ts.isAwaitExpression(initializer) ||
    ts.isParenthesizedExpression(initializer)
  ) {
    initializer = initializer.expression;
  }
  if (!ts.isCallExpression(initializer)) return null;
  const callee = initializer.expression;
  if (
    !ts.isIdentifier(callee) ||
    !["useTranslations", "getTranslations"].includes(callee.text)
  ) {
    return null;
  }
  return initializer.arguments.length === 0
    ? ""
    : getStringLiteral(initializer.arguments[0]);
}

function getTranslatorName(expression) {
  if (ts.isIdentifier(expression)) return expression.text;
  if (ts.isPropertyAccessExpression(expression)) {
    return getTranslatorName(expression.expression);
  }
  return null;
}

function collectTranslationUsage(files) {
  const usedKeys = new Set();
  const dynamicNamespaces = new Set();

  for (const file of files) {
    const source = readFileSync(file, "utf8");
    const sourceFile = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      file.endsWith(".tsx")
        ? ts.ScriptKind.TSX
        : file.endsWith(".jsx")
          ? ts.ScriptKind.JSX
          : file.endsWith(".js")
            ? ts.ScriptKind.JS
            : ts.ScriptKind.TS,
    );
    const scopes = [new Map()];

    function findNamespace(name) {
      for (let index = scopes.length - 1; index >= 0; index -= 1) {
        if (scopes[index].has(name)) return scopes[index].get(name);
      }
      return null;
    }

    function isTranslatorCallTarget(node) {
      let target = node;
      while (
        ts.isPropertyAccessExpression(target.parent) &&
        target.parent.expression === target
      ) {
        target = target.parent;
      }
      return (
        ts.isCallExpression(target.parent) && target.parent.expression === target
      );
    }

    function visit(node) {
      const createsScope =
        ts.isSourceFile(node) ||
        ts.isBlock(node) ||
        ts.isModuleBlock(node) ||
        ts.isFunctionLike(node);
      if (createsScope && node !== sourceFile) scopes.push(new Map());

      if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name)) {
        const namespace = node.initializer
          ? getTranslatorNamespace(node.initializer)
          : null;
        if (namespace !== null) {
          scopes[scopes.length - 1].set(node.name.text, namespace);
        }
      }

      if (ts.isIdentifier(node) && !isTranslatorCallTarget(node)) {
        const namespace = findNamespace(node.text);
        if (
          namespace !== null &&
          !ts.isVariableDeclaration(node.parent) &&
          !ts.isParameter(node.parent)
        ) {
          dynamicNamespaces.add(namespace);
        }
      }

      if (ts.isCallExpression(node)) {
        const translatorName = getTranslatorName(node.expression);
        const namespace =
          translatorName === null ? null : findNamespace(translatorName);
        if (namespace !== null) {
          const key =
            node.arguments.length > 0
              ? getStringLiteral(node.arguments[0])
              : null;
          if (key === null) {
            dynamicNamespaces.add(namespace);
          } else {
            usedKeys.add(namespace ? `${namespace}.${key}` : key);
          }
        }
      }

      ts.forEachChild(node, visit);
      if (createsScope && node !== sourceFile) scopes.pop();
    }

    visit(sourceFile);
  }

  return { usedKeys, dynamicNamespaces };
}

function loadKeys(locale) {
  const raw = readFileSync(path.join(messagesDir, `${locale}.json`), "utf8");
  return new Set(flattenKeys(JSON.parse(raw)));
}

const sourceKeys = loadKeys(SOURCE_LOCALE);
const sourceFiles = SOURCE_DIRS.flatMap((directory) =>
  collectSourceFiles(path.join(repoDir, directory)),
);
const { usedKeys, dynamicNamespaces } = collectTranslationUsage(sourceFiles);
const locales = readdirSync(messagesDir)
  .filter((file) => file.endsWith(".json"))
  .map((file) => file.slice(0, -".json".length))
  .filter((locale) => locale !== SOURCE_LOCALE);

let failed = false;
const unusedKeys = [...sourceKeys].filter((key) => {
  const isUsed = [...usedKeys].some(
    (usedKey) => usedKey === key || key.startsWith(`${usedKey}.`),
  );
  const hasDynamicUsage = [...dynamicNamespaces].some(
    (namespace) => key === namespace || key.startsWith(`${namespace}.`),
  );
  return !isUsed && !hasDynamicUsage;
});

if (unusedKeys.length > 0) {
  failed = true;
  console.error("Unused translation keys in messages/en.json:");
  for (const key of unusedKeys) console.error(`  unused: ${key}`);
}

if (dynamicNamespaces.size > 0) {
  console.warn(
    "Skipped usage checks for namespaces with dynamic translation keys:",
  );
  for (const namespace of [...dynamicNamespaces].sort()) {
    console.warn(`  ${namespace || "(root)"}`);
  }
}

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
  `i18n keys in sync and used: ${locales.length + 1} locales, ${sourceKeys.size} keys each.`,
);
