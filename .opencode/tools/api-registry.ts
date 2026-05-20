import { tool } from "@opencode-ai/plugin";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function registryPath(context: { worktree: string }) {
  return resolve(context.worktree, "docs", "api-registry.md");
}

function parseEntries(content: string) {
  const lines = content.split("\n");
  const entries: { number: number; name: string }[] = [];
  for (const line of lines) {
    const m = line.match(/^### API-(\d+)\s+(.+)/);
    if (m) {
      entries.push({ number: parseInt(m[1], 10), name: m[2].trim() });
    }
  }
  return entries;
}

export const validate = tool({
  description:
    "Validate ordering of API entries in docs/api-registry.md. Checks that all entries are in ascending order and reports any gaps.",
  args: {},
  async execute(_args, context) {
    const path = registryPath(context);
    if (!existsSync(path)) {
      return "docs/api-registry.md not found";
    }

    const content = readFileSync(path, "utf-8");
    const entries = parseEntries(content);
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 1; i < entries.length; i++) {
      if (entries[i].number < entries[i - 1].number) {
        errors.push(
          `API-${String(entries[i - 1].number).padStart(4, "0")} (${entries[i - 1].name}) → ` +
            `API-${String(entries[i].number).padStart(4, "0")} (${entries[i].name}) : OUT OF ORDER`,
        );
      }
    }

    for (let i = 1; i < entries.length; i++) {
      if (entries[i].number !== entries[i - 1].number + 1) {
        const gs = entries[i - 1].number + 1;
        const ge = entries[i].number - 1;
        if (gs === ge) {
          warnings.push(
            `Gap at API-${String(gs).padStart(4, "0")} (${entries[i - 1].name} → ${entries[i].name})`,
          );
        } else {
          warnings.push(
            `Gap API-${String(gs).padStart(4, "0")} .. API-${String(ge).padStart(4, "0")} (${entries[i - 1].name} → ${entries[i].name})`,
          );
        }
      }
    }

    const first = entries[0];
    const last = entries[entries.length - 1];
    let result = `Total: ${entries.length} entries\nRange: API-${String(first.number).padStart(4, "0")} .. API-${String(last.number).padStart(4, "0")}\n`;

    if (warnings.length) {
      result += "\n⚠ Warnings:\n" + warnings.map((w) => `  - ${w}`).join("\n");
    }
    if (errors.length) {
      result += "\n❌ Errors:\n" + errors.map((e) => `  - ${e}`).join("\n");
    }
    if (!errors.length) {
      result += "\n✅ All entries in order.";
    }

    return result;
  },
});

export const list = tool({
  description: "List all API entries in docs/api-registry.md",
  args: {},
  async execute(_args, context) {
    const path = registryPath(context);
    if (!existsSync(path)) return "docs/api-registry.md not found";

    const content = readFileSync(path, "utf-8");
    const entries = parseEntries(content);
    const lines = entries.map(
      (e) => `API-${String(e.number).padStart(4, "0")}  ${e.name}`,
    );
    return `${entries.length} entries\n\n` + lines.join("\n");
  },
});

export const next = tool({
  description: "Get the next available API number for docs/api-registry.md",
  args: {},
  async execute(_args, context) {
    const path = registryPath(context);
    if (!existsSync(path)) return "docs/api-registry.md not found";

    const content = readFileSync(path, "utf-8");
    const entries = parseEntries(content);
    const nextNum = (entries[entries.length - 1]?.number ?? 0) + 1;
    return `Next available: API-${String(nextNum).padStart(4, "0")}`;
  },
});
