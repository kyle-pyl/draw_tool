/**
 * Document Utilities – Core library for API registry, task list/log CRUD.
 *
 * Provides:
 *   - AsyncRWLock   : fair read-write lock with timeout and deadlock prevention
 *   - parseApiBlocks() / formatApiEntry() / writeApiEntry()
 *   - parseTaskBlocks() / updateTaskStatus()
 *   - parseTaskLogBlocks() / formatTaskLogEntry() / appendTaskLog()
 *
 * All write operations acquire an exclusive write lock.
 * Read functions do NOT acquire locks (caller may batch-read freely).
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const API_PATH = resolve(ROOT, "docs", "api-registry.md");
const TASK_LIST_PATH = resolve(ROOT, "docs", "task-list.md");
const TASK_LOG_PATH = resolve(ROOT, "docs", "task-log.md");

// ═══════════════════════════════════════════════════════════════════════════════
// Async Read-Write Lock  (fair, write-priority, timeout, deadlock-safe)
// ═══════════════════════════════════════════════════════════════════════════════

class AsyncRWLock {
  #readers = 0;
  #writers = 0;
  #pendingWriters = 0;
  #readQueue = [];  // { resolve, reject, timer }
  #writeQueue = []; // { resolve, reject, timer }
  #timeout = 5000;  // ms

  constructor(timeoutMs = 5000) {
    this.#timeout = timeoutMs;
  }

  /** Acquire a shared (read) lock. Multiple readers allowed concurrently. */
  acquireRead() {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        // Remove self from queue on timeout
        const idx = this.#readQueue.findIndex((r) => r.timer === timer);
        if (idx >= 0) this.#readQueue.splice(idx, 1);
        reject(new Error("Read lock acquisition timed out"));
      }, this.#timeout);

      if (this.#writers > 0 || this.#pendingWriters > 0) {
        this.#readQueue.push({ resolve, reject, timer });
      } else {
        clearTimeout(timer);
        this.#readers++;
        resolve();
      }
    });
  }

  /** Release a shared (read) lock. */
  releaseRead() {
    this.#readers--;
    if (this.#readers === 0) {
      this.#wakeNext();
    }
  }

  /** Acquire an exclusive (write) lock. Only one writer at a time. */
  acquireWrite() {
    return new Promise((resolve, reject) => {
      this.#pendingWriters++;
      const timer = setTimeout(() => {
        this.#pendingWriters--;
        const idx = this.#writeQueue.findIndex((w) => w.timer === timer);
        if (idx >= 0) this.#writeQueue.splice(idx, 1);
        reject(new Error("Write lock acquisition timed out"));
      }, this.#timeout);

      if (this.#readers > 0 || this.#writers > 0) {
        this.#writeQueue.push({ resolve, reject, timer });
      } else {
        clearTimeout(timer);
        this.#pendingWriters--;
        this.#writers++;
        resolve();
      }
    });
  }

  /** Release an exclusive (write) lock. */
  releaseWrite() {
    this.#writers--;
    this.#wakeNext();
  }

  /** Wake next waiting task — writers first (write-priority). */
  #wakeNext() {
    // If there are pending writers, wake one
    if (this.#writeQueue.length > 0 && this.#readers === 0 && this.#writers === 0) {
      const next = this.#writeQueue.shift();
      clearTimeout(next.timer);
      this.#pendingWriters--;
      this.#writers++;
      next.resolve();
      return;
    }
    // Otherwise wake all queued readers
    while (this.#readQueue.length > 0 && this.#writers === 0 && this.#pendingWriters === 0) {
      const next = this.#readQueue.shift();
      clearTimeout(next.timer);
      this.#readers++;
      next.resolve();
    }
  }

  /** Helper: run fn under read lock. */
  async withRead(fn) {
    await this.acquireRead();
    try {
      return await fn();
    } finally {
      this.releaseRead();
    }
  }

  /** Helper: run fn under write lock. */
  async withWrite(fn) {
    await this.acquireWrite();
    try {
      return await fn();
    } finally {
      this.releaseWrite();
    }
  }
}

// Single global lock shared across all document operations
const gLock = new AsyncRWLock(8000);

// ═══════════════════════════════════════════════════════════════════════════════
// API Registry  (docs/api-registry.md)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse GFM key-value table into an object.
 * Table rows look like: `| key | value |`
 */
function parseKVTable(lines, startIdx) {
  const record = {};
  let i = startIdx;
  // skip header row (| 字段 | 内容 |) and separator (|---|---|)
  if (i < lines.length && lines[i].trim().startsWith("|") && lines[i].includes("|---")) {
    // separator – skip
    i++;
  } else if (i < lines.length && lines[i].trim().startsWith("|")) {
    // header row – skip it and next separator
    i++;
    if (i < lines.length && lines[i].trim().startsWith("|") && lines[i].includes("|---")) i++;
  }
  // parse data rows
  while (i < lines.length && lines[i].trim().startsWith("|")) {
    const row = lines[i].trim();
    if (row.includes("|---")) { i++; continue; }
    const m = row.match(/^\|\s*([^|]+?)\s*\|\s*(.*?)\s*\|$/);
    if (m) {
      record[m[1].trim()] = m[2].trim();
    }
    i++;
  }
  return { record, endIdx: i };
}

/**
 * Parse all API entries from docs/api-registry.md.
 * Returns array of { number, name, fields: { key: value } }.
 */
function parseApiBlocks(content) {
  const lines = content.split("\n");
  const entries = [];
  let i = 0;

  while (i < lines.length) {
    const m = lines[i].match(/^### API-(\d+)\s+(.+)/);
    if (!m) { i++; continue; }

    const number = parseInt(m[1], 10);
    const name = m[2].trim();
    const { record, endIdx } = parseKVTable(lines, i + 2);
    entries.push({ number, name, fields: record, lineStart: i, lineEnd: endIdx });
    i = endIdx;
  }
  return entries;
}

/**
 * Format a single API entry as Markdown text.
 */
function formatApiEntry(number, name, fields) {
  const pad = String(number).padStart(4, "0");
  const fieldOrder = [
    "序号", "名称", "所属系统", "所属模块", "状态",
    "创建日期", "最后修订日期", "创建者", "最后修订者",
    "功能描述", "输入参数", "输出参数", "典型用例", "修订历史",
  ];
  // Ensure 序号 matches
  fields["序号"] = `API-${pad}`;
  fields["名称"] = name;

  let out = `### API-${pad} ${name}\n\n`;
  out += "| 字段 | 内容 |\n";
  out += "|---|---|\n";
  for (const key of fieldOrder) {
    if (fields[key] !== undefined) {
      out += `| ${key} | ${fields[key]} |\n`;
    }
  }
  out += "\n";
  return out;
}

/**
 * Replace an existing API entry or append a new one at the correct position.
 */
function writeApiEntry(content, number, name, fields, isNew) {
  const lines = content.split("\n");
  const pad = String(number).padStart(4, "0");
  const today = new Date().toISOString().slice(0, 10);

  // Auto-maintain timestamps and revision history
  fields["最后修订日期"] = today;
  fields["最后修订者"] = "OpenCode/deepseek-v4-pro";
  if (isNew) {
    fields["创建日期"] = today;
    fields["创建者"] = "OpenCode/deepseek-v4-pro";
    fields["状态"] = fields["状态"] || "活跃";
    fields["修订历史"] = `${today}, OpenCode/deepseek-v4-pro, 初始创建`;
  } else {
    // Append revision entry
    const prev = fields["修订历史"] || "";
    if (!prev.includes(`${today},`)) {
      fields["修订历史"] = prev ? `${prev}；${today}, OpenCode/deepseek-v4-pro, 修订` : `${today}, OpenCode/deepseek-v4-pro, 修订`;
    }
  }

  const newBlock = formatApiEntry(number, name, fields);

  // Find existing entry
  const headerPattern = new RegExp(`^### API-${pad}\\s`);
  const idx = lines.findIndex((l) => headerPattern.test(l));

  if (idx >= 0 && !isNew) {
    // Replace existing: find the end of the block (next ### or EOF)
    let end = idx + 1;
    while (end < lines.length && !lines[end].startsWith("### API-")) end++;
    end--; // back to last line of this entry
    while (end > idx && lines[end].trim() === "") end--; // skip trailing blanks

    const before = lines.slice(0, idx).join("\n");
    const after = lines.slice(end + 1).join("\n");
    return before + (before ? "\n" : "") + newBlock.trimEnd() + (after ? "\n" + after : "");
  }

  if (idx < 0) {
    // Insert at correct sorted position
    const entries = parseApiBlocks(content);
    const insertAfter = entries.filter((e) => e.number < number).pop();
    if (insertAfter) {
      // Insert after the block end line
      const insertLine = insertAfter.lineEnd;
      const before = lines.slice(0, insertLine).join("\n");
      const after = lines.slice(insertLine).join("\n");
      return before + (before ? "\n" : "") + newBlock.trimEnd() + "\n" + after;
    } else {
      // Insert before the first entry
      const firstEntry = entries[0];
      const headerIdx = lines.findIndex((l) => /^### API-/.test(l));
      if (headerIdx >= 0) {
        const before = lines.slice(0, headerIdx).join("\n");
        const after = lines.slice(headerIdx).join("\n");
        return before + (before ? "\n" : "") + newBlock.trimEnd() + "\n" + after;
      }
    }
  }

  // Fallback: append
  return content.trimEnd() + "\n" + newBlock;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Task List  (docs/task-list.md)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse task entries from task-list.md.
 * Returns array of { id, name, fields: { key: value }, lineStart, lineEnd }.
 */
function parseTaskBlocks(content) {
  const lines = content.split("\n");
  const entries = [];
  let i = 0;

  while (i < lines.length) {
    const m = lines[i].match(/^### (T-\d{2}-\d{2})\s+(.+)/);
    if (!m) { i++; continue; }

    const id = m[1];
    const name = m[2].trim();
    const startLine = i;
    i += 2; // skip header line, move to first table row

    // Find table end
    const fields = {};
    while (i < lines.length) {
      const row = lines[i].trim();
      if (!row.startsWith("|") || row === "|---|---|") {
        // empty line or separator
        if (row === "|---|---|" || row === "") { i++; continue; }
        break;
      }
      const rm = row.match(/^\|\s*([^|]+?)\s*\|\s*(.*?)\s*\|$/);
      if (rm) {
        fields[rm[1].trim()] = rm[2].trim();
      }
      i++;
    }
    // skip description until next --- or next ###
    let endLine = i;
    while (endLine < lines.length) {
      if (lines[endLine].startsWith("---") || lines[endLine].startsWith("### T-")) {
        break;
      }
      endLine++;
    }

    entries.push({ id, name, fields, lineStart: startLine, lineEnd: endLine });
    i = endLine;
  }
  return entries;
}

/**
 * Update the status of a task in task-list.md.
 * Returns the modified file content, or null if task not found.
 */
function updateTaskStatus(content, taskId, status) {
  const entries = parseTaskBlocks(content);
  const entry = entries.find((e) => e.id === taskId);
  if (!entry) return null;

  const lines = content.split("\n");
  // Find the status line within the task block
  for (let i = entry.lineStart; i < Math.min(entry.lineEnd, lines.length); i++) {
    if (lines[i].includes("| 状态") && lines[i].includes("|")) {
      lines[i] = lines[i].replace(/\| 状态\s*\|\s*[^|]*\s*\|/, `| 状态 | ${status} |`);
      return lines.join("\n");
    }
  }
  return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Task Log  (docs/task-log.md)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Parse task log entries.
 * Returns array of { id, name, fields: { key: value } }.
 */
function parseTaskLogBlocks(content) {
  const lines = content.split("\n");
  const entries = [];
  let i = 0;

  while (i < lines.length) {
    const m = lines[i].match(/^### (T-\d{2}-\d{2})\s+(.+)/);
    if (!m) { i++; continue; }

    const id = m[1];
    const name = m[2].trim();
    // Find the table beneath
    let j = i + 1;
    while (j < lines.length && !lines[j].trim().startsWith("|")) j++;
    if (j >= lines.length) { i++; continue; }

    const { record } = parseKVTable(lines, j);
    entries.push({ id, name, fields: record, lineStart: i });
    // Skip to next ### or EOF
    i++;
    while (i < lines.length && !lines[i].startsWith("### T-")) i++;
  }
  return entries;
}

/**
 * Format a task log entry as Markdown.
 */
function formatTaskLogEntry(id, name, fields) {
  const fieldOrder = [
    "任务编号", "任务名称", "完成时间", "作者/智能体",
    "Git Commit", "修改记录", "发现缺陷", "产出接口/函数",
  ];
  if (!fields["任务编号"]) fields["任务编号"] = id;
  if (!fields["任务名称"]) fields["任务名称"] = name;

  let out = `### ${id} ${name}\n\n`;
  out += "| 字段          | 内容 |\n";
  out += "| ------------- | ---- |\n";
  for (const key of fieldOrder) {
    if (fields[key] !== undefined) {
      out += `| ${key} | ${fields[key]} |\n`;
    }
  }
  out += "\n";
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════════
// Public API — Read operations (no lock needed)
// ═══════════════════════════════════════════════════════════════════════════════

export function queryApiEntries({ numbers, names, namePattern } = {}) {
  const content = readFileSync(API_PATH, "utf-8");
  let entries = parseApiBlocks(content);

  if (numbers && numbers.length > 0) {
    const set = new Set(numbers.map(Number));
    entries = entries.filter((e) => set.has(e.number));
  }

  if (names && names.length > 0) {
    const set = new Set(names);
    entries = entries.filter((e) => set.has(e.name));
  }

  if (namePattern) {
    const re = new RegExp(namePattern, "i");
    entries = entries.filter((e) => re.test(e.name) || re.test(e.fields["功能描述"] || ""));
  }

  return entries.map((e) => ({
    number: String(e.number).padStart(4, "0"),
    name: e.name,
    ...e.fields,
  }));
}

export function queryTaskLogs({ ids } = {}) {
  const content = readFileSync(TASK_LOG_PATH, "utf-8");
  let entries = parseTaskLogBlocks(content);

  if (ids && ids.length > 0) {
    const set = new Set(ids);
    entries = entries.filter((e) => set.has(e.id));
  }

  return entries.map((e) => ({ id: e.id, name: e.name, ...e.fields }));
}

export function queryTaskList({ ids } = {}) {
  const content = readFileSync(TASK_LIST_PATH, "utf-8");
  let entries = parseTaskBlocks(content);

  if (ids && ids.length > 0) {
    const set = new Set(ids);
    entries = entries.filter((e) => set.has(e.id));
  }

  return entries.map((e) => ({ id: e.id, name: e.name, ...e.fields }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// Public API — Write operations (require write lock)
// ═══════════════════════════════════════════════════════════════════════════════

export async function createApiEntry(number, name, fields) {
  return gLock.withWrite(() => {
    const content = readFileSync(API_PATH, "utf-8");
    const newContent = writeApiEntry(content, number, name, fields, true);
    writeFileSync(API_PATH, newContent, "utf-8");
    return { ok: true, number: String(number).padStart(4, "0"), name };
  });
}

export async function updateApiEntry(number, fields) {
  return gLock.withWrite(() => {
    const content = readFileSync(API_PATH, "utf-8");
    const entries = parseApiBlocks(content);
    const existing = entries.find((e) => e.number === number);
    if (!existing) return { ok: false, error: `API-${String(number).padStart(4, "0")} not found` };

    const merged = { ...existing.fields, ...fields };
    const newContent = writeApiEntry(content, number, existing.name, merged, false);
    writeFileSync(API_PATH, newContent, "utf-8");
    return { ok: true, number: String(number).padStart(4, "0"), name: existing.name };
  });
}

export async function setTaskStatus(taskId, status) {
  return gLock.withWrite(() => {
    const content = readFileSync(TASK_LIST_PATH, "utf-8");
    const newContent = updateTaskStatus(content, taskId, status);
    if (newContent === null) {
      return { ok: false, error: `Task ${taskId} not found in task-list.md` };
    }
    writeFileSync(TASK_LIST_PATH, newContent, "utf-8");
    return { ok: true, taskId, status };
  });
}

export async function appendTaskLog(taskId, taskName, fields) {
  return gLock.withWrite(() => {
    const content = readFileSync(TASK_LOG_PATH, "utf-8");
    let newContent;

    // Check if already exists
    const entries = parseTaskLogBlocks(content);
    const existing = entries.find((e) => e.id === taskId);
    if (existing) {
      return { ok: false, error: `Task log ${taskId} already exists. Modify manually or use update.` };
    }

    // Append at end of file (after last log entry)
    const block = formatTaskLogEntry(taskId, taskName, fields);
    newContent = content.trimEnd() + "\n\n" + block.trimEnd() + "\n";

    writeFileSync(TASK_LOG_PATH, newContent, "utf-8");
    return { ok: true, taskId, taskName };
  });
}

// Re-export lock for external control if needed
export { gLock };
