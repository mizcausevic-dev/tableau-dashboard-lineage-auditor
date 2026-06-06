#!/usr/bin/env node
import { loadAudit, renderMarkdown } from "../src/index.js";

const [, , inputPath, formatFlag, format] = process.argv;

if (!inputPath) {
  console.error("Usage: tableau-dashboard-lineage-auditor <input.json> [--format markdown|json]");
  process.exit(1);
}

const audit = await loadAudit(inputPath);
console.log(formatFlag === "--format" && format === "json" ? JSON.stringify(audit, null, 2) : renderMarkdown(audit));
