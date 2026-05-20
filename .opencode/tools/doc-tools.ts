/**
 * Document maintenance tools for opencode.
 *
 * Exports:
 *   doc_api_query      – batch read: query API entries by number / name / pattern
 *   doc_api_write      – single write: create or update an API entry
 *   doc_task_status    – single write: update a task's status in task-list.md
 *   doc_task_log_query – batch read: query task log entries by task id
 *   doc_task_log_write – single write: append a task log entry
 */

import { tool } from "@opencode-ai/plugin";

// Dynamic import of the ESM core module
async function loadUtils() {
  return import("../scripts/doc-utils.mjs");
}

// ─── doc_api_query ────────────────────────────────────────────────────────────

export const doc_api_query = tool({
  description:
    "Batch query API entries from docs/api-registry.md by number, name, or name pattern. Returns matching entries with all fields.",
  args: {
    numbers: tool.schema
      .array(tool.schema.number())
      .optional()
      .describe("API numbers to look up, e.g. [57, 58]"),
    names: tool.schema
      .array(tool.schema.string())
      .optional()
      .describe("Exact API names to look up, e.g. ['CanvasView', 'getAnchors']"),
    namePattern: tool.schema
      .string()
      .optional()
      .describe("Regex pattern to match against API name or description"),
  },
  async execute(args) {
    const { queryApiEntries } = await loadUtils();
    const results = queryApiEntries({
      numbers: args.numbers,
      names: args.names,
      namePattern: args.namePattern,
    });
    return JSON.stringify(results, null, 2);
  },
});

// ─── doc_api_write ────────────────────────────────────────────────────────────

export const doc_api_write = tool({
  description:
    "Create a new API entry or update an existing one in docs/api-registry.md. Automatically maintains last-modified date and revision history.",
  args: {
    number: tool.schema.number().describe("API number, e.g. 121"),
    name: tool.schema.string().optional().describe("API entry name (required for creation)"),
    fields: tool.schema
      .record(tool.schema.string(), tool.schema.string())
      .optional()
      .describe("Key-value fields to set/update, e.g. { '功能描述': '...', '所属系统': 'core' }"),
  },
  async execute(args) {
    const { queryApiEntries, createApiEntry, updateApiEntry } = await loadUtils();

    // Determine if create or update
    const existing = queryApiEntries({ numbers: [args.number] });

    if (existing.length > 0) {
      // Update
      if (!args.fields || Object.keys(args.fields).length === 0) {
        return JSON.stringify(existing[0], null, 2);
      }
      const result = await updateApiEntry(args.number, args.fields);
      return JSON.stringify(result);
    }

    // Create
    if (!args.name) {
      return JSON.stringify({ ok: false, error: "name is required for new API entries" });
    }
    const result = await createApiEntry(args.number, args.name, args.fields || {});
    return JSON.stringify(result);
  },
});

// ─── doc_task_status ──────────────────────────────────────────────────────────

export const doc_task_status = tool({
  description:
    "Update the status of a task in docs/task-list.md. Status values: 待执行, 进行中, 已完成, 已取消.",
  args: {
    taskId: tool.schema
      .string()
      .describe("Task ID, e.g. 'T-07-03'"),
    status: tool.schema
      .string()
      .describe("New status: 待执行 | 进行中 | 已完成 | 已取消"),
  },
  async execute(args) {
    const { setTaskStatus } = await loadUtils();
    return JSON.stringify(await setTaskStatus(args.taskId, args.status));
  },
});

// ─── doc_task_log_query ───────────────────────────────────────────────────────

export const doc_task_log_query = tool({
  description:
    "Batch query task log entries from docs/task-log.md by task ID.",
  args: {
    taskIds: tool.schema
      .array(tool.schema.string())
      .optional()
      .describe("Task IDs to look up, e.g. ['T-07-03', 'T-07-02']"),
  },
  async execute(args) {
    const { queryTaskLogs } = await loadUtils();
    const results = queryTaskLogs({ ids: args.taskIds });
    return JSON.stringify(results, null, 2);
  },
});

// ─── doc_task_log_write ───────────────────────────────────────────────────────

export const doc_task_log_write = tool({
  description:
    "Append a new task log entry to docs/task-log.md. Fails if the task log already exists.",
  args: {
    taskId: tool.schema
      .string()
      .describe("Task ID, e.g. 'T-07-05'"),
    taskName: tool.schema
      .string()
      .describe("Task name, e.g. '实现连接线端点校验'"),
    fields: tool.schema
      .record(tool.schema.string(), tool.schema.string())
      .describe("Log fields: 完成时间, 作者/智能体, Git Commit, 修改记录, 发现缺陷, 产出接口/函数"),
  },
  async execute(args) {
    const { appendTaskLog } = await loadUtils();
    return JSON.stringify(await appendTaskLog(args.taskId, args.taskName, args.fields));
  },
});
