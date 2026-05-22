# 文档维护指南

本文件说明项目中各文档的用途、维护规则和更新时机。所有参与开发的人和 Agent 都应遵守本指南。

## 文档清单

| 文档名称 | 功能 | 路径 | 维护时机 |
|---|---|---|---|
| 顶层设计文档 | 产品目标、架构、数据模型、实现路线 | docs/top-level-design.md | 架构或需求变更时 |
| 任务清单 | 完整有序的开发任务列表 | docs/task-list.md | 新增、调整或取消任务时 |
| 任务日志 | 每个任务的完成记录 | docs/task-log.md | 每个任务完成并提交后 |
| 接口/函数文档 | 项目所有公开接口的注册表 | docs/api-registry.md | 每次新增、修改或废弃接口后 |
| 缺陷记录表 | 开发过程中的缺陷跟踪 | docs/defect-log.md | 发现缺陷时新增，修复后更新状态 |
| 文档维护指南 | 文档体系说明和维护规则 | docs/documentation-guide.md | 文档体系变更时 |
| 用户手册 | 面向人类用户的操作指南 | docs/user-manual.md | 功能变更影响用户操作时 |
| Agent 生成指南 | 面向 Agent 的 scene.json 生成参考 | docs/agent-guide.md | scene.json schema 变更时 |
| README | 项目介绍和当前状态 | README.md | 任何影响项目状态的修改后 |

## 通用维护规则

1. 每次任务完成时必须检查并更新以下文档：task-log.md、api-registry.md、README.md。
2. 若任务中发现缺陷，必须同时更新 defect-log.md。
3. README.md 应始终反映项目最新状态，不应包含历史状态描述。
4. 所有文档使用 Markdown 格式，表格使用 GFM 语法。
5. 文档中引用的路径使用相对于项目根目录的路径。
6. 不得在文档中包含敏感信息、密钥或个人隐私数据。

## 任务执行流程中的文档操作

每个任务应按以下顺序操作文档：

1. 开始前：读取 task-log.md 查看依赖任务日志，读取 api-registry.md 查看现有接口。
2. 设计时：检查 api-registry.md 避免接口冲突和冗余。
3. 完成后：追加 task-log.md 日志记录。
4. 接口变更后：更新 api-registry.md。
5. 发现缺陷后：追加 defect-log.md 记录。
6. 修复缺陷后：更新 defect-log.md 状态。
7. 提交后：补填 task-log.md 中的 Git Commit hash。
8. 最后：检查并更新 README.md。
