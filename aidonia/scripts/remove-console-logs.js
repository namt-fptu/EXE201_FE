#!/usr/bin/env node

/**
 * SAFER Script to remove console.log statements from production code
 * This version is more conservative and won't break string literals or template literals
 * Run: node scripts/remove-console-logs.js
 */

import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const SRC_DIR = path.join(__dirname, "..", "src");
const EXTENSIONS = [".ts", ".tsx", ".js", ".jsx"];
const EXCLUDE_DIRS = ["node_modules", ".next", "dist", "build"];

let filesProcessed = 0;
let linesRemoved = 0;

function shouldProcessFile(filePath) {
  const ext = path.extname(filePath);
  if (!EXTENSIONS.includes(ext)) return false;

  for (const dir of EXCLUDE_DIRS) {
    if (filePath.includes(path.sep + dir + path.sep)) return false;
  }

  return true;
}

function removeConsoleLogs(content) {
  let newContent = content;
  let removed = 0;

  // More conservative regex patterns
  const patterns = [
    // Single line console.log with semicolon
    /^\s*console\.log\([^;]*\);?\s*$/gm,
    // Single line console.debug with semicolon
    /^\s*console\.debug\([^;]*\);?\s*$/gm,
    // Single line console.info with semicolon
    /^\s*console\.info\([^;]*\);?\s*$/gm,
  ];

  patterns.forEach((pattern) => {
    const matches = newContent.match(pattern);
    if (matches) {
      removed += matches.length;
      newContent = newContent.replace(pattern, "");
    }
  });

  // Remove empty lines that result from console removal
  newContent = newContent.replace(/\n\s*\n\s*\n/g, "\n\n");

  return { newContent, removed };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const { newContent, removed } = removeConsoleLogs(content);

    if (removed > 0 && newContent !== content) {
      fs.writeFileSync(filePath, newContent, "utf8");
      console.log(
        `✅ ${path.relative(SRC_DIR, filePath)}: Removed ${removed} statement(s)`
      );
      linesRemoved += removed;
    }

    filesProcessed++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!EXCLUDE_DIRS.includes(entry.name)) {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && shouldProcessFile(fullPath)) {
      processFile(fullPath);
    }
  }
}

console.log("🧹 Starting SAFER console.log cleanup...\n");
console.log(
  "⚠️  This will only remove standalone console.log/debug/info lines\n"
);
console.log("✅ console.error and console.warn will be kept\n");
console.log(`📁 Processing directory: ${SRC_DIR}\n`);

processDirectory(SRC_DIR);

console.log(`\n✨ Cleanup complete!`);
console.log(`📊 Files processed: ${filesProcessed}`);
console.log(`🗑️  Console statements removed: ${linesRemoved}`);
console.log(
  `\n💡 Note: Next.js compiler will remove remaining console.log in production build\n`
);
