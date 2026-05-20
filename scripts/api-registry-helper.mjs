#!/usr/bin/env node

/**
 * API Registry Helper Script
 *
 * Usage:
 *   node scripts/api-registry-helper.mjs validate   – check ordering and gaps
 *   node scripts/api-registry-helper.mjs list        – list all API entries
 *   node scripts/api-registry-helper.mjs next        – print next available API number
 *   node scripts/api-registry-helper.mjs add <data>  – append a new entry (JSON arg or stdin)
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REGISTRY_PATH = resolve(__dirname, '..', 'docs', 'api-registry.md');

function parseEntries(content) {
  const lines = content.split('\n');
  const entries = [];
  let current = null;

  for (const line of lines) {
    const m = line.match(/^### API-(\d+)\s+(.+)/);
    if (m) {
      if (current) entries.push(current);
      current = { number: parseInt(m[1], 10), name: m[2].trim(), line: line };
    }
  }
  if (current) entries.push(current);
  return entries;
}

function validate() {
  if (!existsSync(REGISTRY_PATH)) {
    console.error('[ERROR] api-registry.md not found');
    process.exit(1);
  }

  const content = readFileSync(REGISTRY_PATH, 'utf-8');
  const entries = parseEntries(content);
  const errors = [];
  const warnings = [];

  // Check ascending order
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].number < entries[i - 1].number) {
      errors.push(
        `API-${String(entries[i - 1].number).padStart(4, '0')} (${entries[i - 1].name}) ` +
        `→ API-${String(entries[i].number).padStart(4, '0')} (${entries[i].name}) : out of order`,
      );
    }
  }

  // Check for gaps
  for (let i = 1; i < entries.length; i++) {
    if (entries[i].number !== entries[i - 1].number + 1) {
      const gapStart = entries[i - 1].number + 1;
      const gapEnd = entries[i].number - 1;
      if (gapStart === gapEnd) {
        warnings.push(`Gap at API-${String(gapStart).padStart(4, '0')} (${entries[i - 1].name} → ${entries[i].name})`);
      } else {
        warnings.push(`Gap from API-${String(gapStart).padStart(4, '0')} to API-${String(gapEnd).padStart(4, '0')} (${entries[i - 1].name} → ${entries[i].name})`);
      }
    }
  }

  const firstNum = entries[0]?.number;
  if (firstNum && firstNum > 1) {
    warnings.push(`Starts at API-${String(firstNum).padStart(4, '0')} (missing API-0001 to API-${String(firstNum - 1).padStart(4, '0')})`);
  }

  // Summary
  const last = entries[entries.length - 1];
  console.log(`Total entries: ${entries.length}`);
  console.log(`Range: API-${String(entries[0].number).padStart(4, '0')} .. API-${String(last.number).padStart(4, '0')}`);
  console.log('');

  if (warnings.length > 0) {
    console.log('[WARNINGS]');
    warnings.forEach((w) => console.log(`  ${w}`));
    console.log('');
  }

  if (errors.length > 0) {
    console.log('[ERRORS]');
    errors.forEach((e) => console.log(`  ${e}`));
    console.log('');
    process.exit(1);
  }

  console.log('[OK] All entries in ascending order.');
}

function list() {
  const content = readFileSync(REGISTRY_PATH, 'utf-8');
  const entries = parseEntries(content);
  console.log('No.       Name');
  console.log('--------  ------------------------------');
  entries.forEach((e) => {
    console.log(`API-${String(e.number).padStart(4, '0')}  ${e.name}`);
  });
  console.log(`\n${entries.length} entries`);
}

function nextNumber() {
  const content = readFileSync(REGISTRY_PATH, 'utf-8');
  const entries = parseEntries(content);
  const next = (entries[entries.length - 1]?.number ?? 0) + 1;
  console.log(String(next));
}

/**
 * Append a new API entry to the registry.
 * Input JSON format:
 * {
 *   "name": "FunctionName",
 *   "system": "core",
 *   "module": "module-name",
 *   "description": "What it does",
 *   "input": "Parameters description",
 *   "output": "Return type description",
 *   "example": "Example code"
 * }
 */
function add() {
  const raw = process.argv[3];
  if (!raw) {
    console.error('[ERROR] Provide JSON data as argument or pipe via stdin');
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error('[ERROR] Invalid JSON input');
    process.exit(1);
  }

  const content = readFileSync(REGISTRY_PATH, 'utf-8');
  const entries = parseEntries(content);
  const next = (entries[entries.length - 1]?.number ?? 0) + 1;
  const padded = String(next).padStart(4, '0');
  const today = new Date().toISOString().slice(0, 10);

  const entry = `
### API-${padded} ${data.name}

| 字段 | 内容 |
|---|---|
| 序号 | API-${padded} |
| 名称 | ${data.name} |
| 所属系统 | ${data.system || 'core'} |
| 所属模块 | ${data.module || ''} |
| 状态 | 活跃 |
| 创建日期 | ${today} |
| 最后修订日期 | ${today} |
| 创建者 | ${data.author || 'OpenCode/deepseek-v4-pro'} |
| 最后修订者 | ${data.author || 'OpenCode/deepseek-v4-pro'} |
| 功能描述 | ${data.description || ''} |
| 输入参数 | ${data.input || ''} |
| 输出参数 | ${data.output || ''} |
| 典型用例 | ${data.example || ''} |
| 修订历史 | ${today}, ${data.author || 'OpenCode/deepseek-v4-pro'}, 初始创建 |
`;

  writeFileSync(REGISTRY_PATH, content + entry, 'utf-8');
  console.log(`[OK] Appended API-${padded} ${data.name}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

const cmd = process.argv[2] || 'help';

switch (cmd) {
  case 'validate':
    validate();
    break;
  case 'list':
    list();
    break;
  case 'next':
    nextNumber();
    break;
  case 'add':
    add();
    break;
  case 'help':
  default:
    console.log('API Registry Helper – manage docs/api-registry.md\n');
    console.log('Usage:');
    console.log('  node scripts/api-registry-helper.mjs validate   Check ordering and gaps');
    console.log('  node scripts/api-registry-helper.mjs list        List all entries');
    console.log('  node scripts/api-registry-helper.mjs next        Print next available number');
    console.log('  node scripts/api-registry-helper.mjs add \'{..}\'  Append a new entry (JSON)');
    break;
}
