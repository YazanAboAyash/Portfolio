/**
 * @author © ColdByDefault
 * @license Copyright (c) 2026 ColdByDefault. All rights reserved.
 * @version 6.x.x
 */

/**
 * Claude Code PostToolUse hook (Edit|Write).
 * - TS/JS files: runs `eslint --fix` on the edited file.
 * - messages/*.json: checks all locales still share en.json's keys.
 * Exit code 2 feeds the remaining errors back to Claude.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";

let raw = "";
for await (const chunk of process.stdin) raw += chunk;

const filePath = JSON.parse(raw).tool_input?.file_path;
if (typeof filePath !== "string") process.exit(0);

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const relPath = path.relative(projectDir, filePath).split(path.sep).join("/");
if (relPath.startsWith("..") || path.isAbsolute(relPath)) process.exit(0);

function run(args) {
  return spawnSync(process.execPath, args, {
    cwd: projectDir,
    encoding: "utf8",
  });
}

let result;
if (/^messages\/[^/]+\.json$/.test(relPath)) {
  result = run([path.join(projectDir, "scripts", "check-i18n-keys.mjs")]);
} else if (
  /\.(ts|tsx|js|jsx|mjs)$/.test(relPath) &&
  !relPath.startsWith("lib/generated/") &&
  !relPath.startsWith("node_modules/")
) {
  result = run([
    path.join(projectDir, "node_modules", "eslint", "bin", "eslint.js"),
    "--fix",
    filePath,
  ]);
}

if (result && result.status !== 0) {
  console.error(`${relPath} has problems:\n${result.stdout}${result.stderr}`);
  process.exit(2);
}
