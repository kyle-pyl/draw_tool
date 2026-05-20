# 任务日志

本文件按任务编号索引，记录每个任务的完成情况。每条日志在对应任务完成时追加。

## 维护规则

1. 每次任务完成后，在本文件末尾追加一条日志记录。
2. 日志按任务编号升序排列。
3. 不得删除或修改已有日志，仅允许在缺陷修复后更新缺陷状态字段。
4. 任务日志与 git commit 一一对应，hash 字段在 commit 后补填。

## 日志格式

每条日志应包含以下字段：

| 字段          | 说明                                                      |
| ------------- | --------------------------------------------------------- |
| 任务编号      | 对应 task-list.md 中的编号，格式 T-XX-YY                  |
| 任务名称      | 简短描述                                                  |
| 完成时间      | 精确到分钟，格式 YYYY-MM-DD HH:mm                         |
| 作者/智能体   | 完成任务的人或 Agent 标识                                 |
| Git Commit    | 对应的 commit hash（提交后补填）                          |
| 修改记录      | 本次任务创建、修改、删除的文件清单                        |
| 发现缺陷      | 任务过程中发现的缺陷编号列表，引用 defect-log.md          |
| 产出接口/函数 | 本任务新增或修改的接口/函数编号列表，引用 api-registry.md |

## 日志记录

### T-00-01 项目脚手架初始化

| 字段          | 内容                                                                                                                                                                                                                                                                                                                            |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-00-01                                                                                                                                                                                                                                                                                                                         |
| 任务名称      | 项目脚手架初始化                                                                                                                                                                                                                                                                                                                |
| 完成时间      | 2026-05-18 20:35                                                                                                                                                                                                                                                                                                                |
| 作者/智能体   | OpenCode/claude-opus-4-6                                                                                                                                                                                                                                                                                                        |
| Git Commit    | ed27c07                                                                                                                                                                                                                                                                                                                         |
| 修改记录      | 新建：package.json, vite.config.ts, tsconfig.json, tsconfig.app.json, tsconfig.node.json, eslint.config.js, index.html, src/core/index.ts, src/canvas/index.ts, src/ui/index.ts, src/io/index.ts, src/modules/index.ts, src/tests/unit/sample.test.ts, src/main.tsx, src/App.tsx, src/App.css, src/index.css, src/vite-env.d.ts |
| 发现缺陷      | 无                                                                                                                                                                                                                                                                                                                              |
| 产出接口/函数 | 无（本任务仅建立工程骨架）                                                                                                                                                                                                                                                                                                      |

### T-01-01 定义核心 TypeScript 类型

| 字段          | 内容                                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-01-01                                                                                                                     |
| 任务名称      | 定义核心 TypeScript 类型                                                                                                    |
| 完成时间      | 2026-05-18 21:02                                                                                                            |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                    |
| Git Commit    | 1980dbe                                                                                                                     |
| 修改记录      | 新建：src/core/types.ts；修改：src/core/index.ts；新建：src/tests/unit/types.test.ts；修改：README.md、docs/api-registry.md |
| 发现缺陷      | 无                                                                                                                          |
| 产出接口/函数 | API-0001 ～ API-0045（共 45 项）                                                                                            |

### T-01-02 定义错误码和校验结果类型

| 字段          | 内容                                                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-01-02                                                                                                                       |
| 任务名称      | 定义错误码和校验结果类型                                                                                                      |
| 完成时间      | 2026-05-18 21:45                                                                                                              |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                      |
| Git Commit    | 1e1fd10                                                                                                                       |
| 修改记录      | 新建：src/core/errors.ts；修改：src/core/index.ts；新建：src/tests/unit/errors.test.ts；修改：README.md、docs/api-registry.md |
| 发现缺陷      | 无                                                                                                                            |
| 产出接口/函数 | API-0046 ～ API-0050（共 5 项）                                                                                               |

### T-01-03 实现 scene.json Schema 校验器

| 字段          | 内容                                                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 任务编号      | T-01-03                                                                                                                                    |
| 任务名称      | 实现 scene.json Schema 校验器                                                                                                              |
| 完成时间      | 2026-05-19 08:55                                                                                                                           |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                                   |
| Git Commit    | 2bd8339                                                                                                                                    |
| 修改记录      | 新建：src/core/validator.ts、src/tests/unit/validator.test.ts；修改：src/core/index.ts、README.md、docs/api-registry.md、docs/task-list.md |
| 发现缺陷      | 无                                                                                                                                         |
| 产出接口/函数 | API-0051 ～ API-0052（共 2 项）                                                                                                            |

### T-01-04 实现引用完整性校验

| 字段          | 内容                                                                                                                                                                                                                   |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-01-04                                                                                                                                                                                                                |
| 任务名称      | 实现引用完整性校验                                                                                                                                                                                                     |
| 完成时间      | 2026-05-19 10:01                                                                                                                                                                                                       |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                                                                                                               |
| Git Commit    | 0fe3fe1                                                                                                                                                                                                                |
| 修改记录      | 修改：src/core/validator.ts（新增 validateReferences 函数及其在 validateScene 中的集成）、src/tests/unit/validator.test.ts（新增 15 个引用完整性测试用例）；更新：docs/api-registry.md（更新 API-0051、新增 API-0053） |
| 发现缺陷      | 无                                                                                                                                                                                                                     |
| 产出接口/函数 | API-0053（新增 validateReferences）、API-0051（修订）                                                                                                                                                                  |

### T-01-05 创建示例项目文件

| 字段          | 内容                                                                                                                                                                                     |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-01-05                                                                                                                                                                                  |
| 任务名称      | 创建示例项目文件                                                                                                                                                                         |
| 完成时间      | 2026-05-19 10:32                                                                                                                                                                         |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                                                                                 |
| Git Commit    | d5f8c24                                                                                                                                                                                  |
| 修改记录      | 新建：examples/basic/scene.json、examples/basic/data/sample.csv、examples/basic/assets/.gitkeep、src/tests/unit/example-scene.test.ts；修改：tsconfig.app.json（增加 resolveJsonModule） |
| 发现缺陷      | 无                                                                                                                                                                                       |
| 产出接口/函数 | 无（本任务仅创建示例文件，无新增 API）                                                                                                                                                   |

### T-01-06 实现 ID 生成工具函数

| 字段          | 内容                                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------------ |
| 任务编号      | T-01-06                                                                                                |
| 任务名称      | 实现 ID 生成工具函数                                                                                   |
| 完成时间      | 2026-05-19 11:01                                                                                       |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                               |
| Git Commit    | e51a3c8                                                                                                |
| 修改记录      | 新建：src/core/utils.ts、src/tests/unit/utils.test.ts；修改：src/core/index.ts（新增 generateId 导出） |
| 发现缺陷      | 无                                                                                                     |
| 产出接口/函数 | API-0054（generateId）                                                                                 |

### T-02-01 实现视口变换管理器

| 字段          | 内容                                                                                                                             |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-02-01                                                                                                                          |
| 任务名称      | 实现视口变换管理器                                                                                                               |
| 完成时间      | 2026-05-19 11:15                                                                                                                 |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                         |
| Git Commit    | 0f0c312                                                                                                                          |
| 修改记录      | 新建：src/canvas/viewport.ts、src/tests/unit/viewport.test.ts；修改：src/canvas/index.ts（新增 Viewport 和 ViewportConfig 导出） |
| 发现缺陷      | 无                                                                                                                               |
| 产出接口/函数 | API-0055（ViewportConfig）、API-0056（Viewport）                                                                                 |

### T-02-02 实现 SVG 画布渲染组件

| 字段          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 任务编号      | T-02-02                                                                                                                                                                                                                                                                                                                                                                                                               |
| 任务名称      | 实现 SVG 画布渲染组件                                                                                                                                                                                                                                                                                                                                                                                                 |
| 完成时间      | 2026-05-19 14:31                                                                                                                                                                                                                                                                                                                                                                                                      |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                                                                                                                                                                                                                                                                                                              |
| Git Commit    | 30e7a90                                                                                                                                                                                                                                                                                                                                                                                                               |
| 修改记录      | 新建：src/canvas/CanvasView.tsx、src/tests/unit/canvas-view.test.tsx、src/tests/unit/setup.ts；修改：src/canvas/index.ts（新增 CanvasView 导出）、src/App.tsx（改用 CanvasView 渲染示例 scene）、src/App.css（全屏画布布局）、src/index.css（全局样式重置）、vite.config.ts（配置 vitest jsdom 环境和测试设置文件）；新增 npm 依赖：@testing-library/react、@testing-library/jest-dom、@testing-library/dom、jsdom@24 |
| 发现缺陷      | 无                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 产出接口/函数 | API-0057（CanvasView）                                                                                                                                                                                                                                                                                                                                                                                                |

### T-02-03 实现画布缩放和平移交互

| 字段          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 任务编号      | T-02-03                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 任务名称      | 实现画布缩放和平移交互                                                                                                                                                                                                                                                                                                                                                                                                   |
| 完成时间      | 2026-05-19 14:45                                                                                                                                                                                                                                                                                                                                                                                                         |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                                                                                                                                                                                                                                                                                                                 |
| Git Commit    | 6abc2e8                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 修改记录      | 修改：src/canvas/CanvasView.tsx（新增 onViewportChange prop、滚轮缩放、空格+拖拽平移、中键拖拽平移、光标样式切换）、src/App.tsx（使用 useState 管理 viewport 并传入 onViewportChange 回调）、src/tests/unit/canvas-view.test.tsx（新增 15 个交互测试用例：zoom、pan、cursor、onViewportChange）；更新：docs/api-registry.md（更新 API-0057）、docs/task-list.md（T-02-03 状态改为已完成）、README.md（更新可用功能描述） |
| 发现缺陷      | 无                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 产出接口/函数 | API-0057（CanvasView：新增 onViewportChange prop、交互事件处理）                                                                                                                                                                                                                                                                                                                                                         |

### T-02-04 实现元素单选和多选

| 字段          | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 任务编号      | T-02-04                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 任务名称      | 实现元素单选和多选                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 完成时间      | 2026-05-19 15:00                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 作者/智能体   | OpenCode/deepseek-v4-pro                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Git Commit    | 5c3043aef                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 修改记录      | 新建：src/canvas/selection.ts（SelectionManager 类）、src/tests/unit/selection.test.ts（18 个 SelectionManager 单元测试）；修改：src/canvas/CanvasView.tsx（新增 selectionManager/onSelectionChange props、元素 onClick 包装、选择覆盖层渲染含蓝色包围盒和 8 个控制柄、spaceDownRef 避免平移时误选）、src/canvas/index.ts（新增 SelectionManager 导出）、src/App.tsx（集成 SelectionManager）、src/tests/unit/canvas-view.test.tsx（新增 12 个选择交互测试） |
| 发现缺陷      | 无                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 产出接口/函数 | API-0058（SelectionManager）、API-0057（CanvasView：新增 selectionManager/onSelectionChange props 和选择交互） |

### T-02-05 实现框选功能

| 字段 | 内容 |
|---|---|
| 任务编号 | T-02-05 |
| 任务名称 | 实现框选功能 |
| 完成时间 | 2026-05-19 15:30 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 633622c |
| 修改记录 | 修改：src/canvas/CanvasView.tsx（新增 marquee 状态管理、handleMouseDown/handleMouseMove/handleMouseUp 扩展、handleMouseLeave 分离、didDragRef 拖拽判断、MarqueeState 接口、框选矩形渲染——半透明蓝色虚线框位于屏幕空间）、src/tests/unit/canvas-view.test.tsx（新增 12 个框选交互测试：完全/部分包含选择、Shift+框选追加、框选矩形渲染、元素上不启动框选、平移时不启动框选、锁定/隐藏元素过滤、缩放视口适配、onSelectionChange 回调、小拖拽视为点击清空） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0057（CanvasView：新增框选 marquee selection 功能） |

### T-03-01 实现 Document Store

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-03-01 |
| 任务名称      | 实现 Document Store |
| 完成时间      | 2026-05-19 15:38 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 800538b |
| 修改记录      | 新建：src/core/store.ts、src/tests/unit/store.test.ts；修改：src/core/index.ts（新增 useDocumentStore 和 DocumentStore 导出） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0059（DocumentStore）、API-0060（useDocumentStore） |

### T-03-02 实现 JSON 项目文件加载

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-03-02 |
| 任务名称      | 实现 JSON 项目文件加载 |
| 完成时间      | 2026-05-19 15:55 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 2a8dc2d |
| 修改记录      | 新建：src/io/importers.ts（loadSceneFromFile、loadSceneFromFileObject）、src/tests/unit/importers.test.ts（13 个测试用例）；修改：src/io/index.ts（新增导出） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0061（loadSceneFromFile）、API-0062（loadSceneFromFileObject） |

### T-03-03 实现 File System Access API 项目目录打开

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-03-03 |
| 任务名称      | 实现 File System Access API 项目目录打开 |
| 完成时间      | 2026-05-19 16:50 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | f8f6459 |
| 修改记录      | 修改：src/io/importers.ts（新增 loadProjectFromDirectory 及辅助函数 readFileFromDirectory、readAllFilesFromDirectory、isImageFile、inferDataSourceType、revokeTrackedBlobUrls）、src/core/store.ts（新增 directoryHandle 和 setDirectoryHandle）、src/io/index.ts（新增导出）、src/tests/unit/importers.test.ts（新增 14 个测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0063（loadProjectFromDirectory）、API-0059（DocumentStore 修订：新增 directoryHandle/setDirectoryHandle） |

### T-03-04 实现 ZIP 项目导入导出

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-03-04 |
| 任务名称      | 实现 ZIP 项目导入导出 |
| 完成时间      | 2026-05-19 18:36 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | ec250fc |
| 修改记录      | 新建：src/io/exporters.ts（exportProjectToZip）、src/tests/unit/zip-io.test.ts（19 个测试用例）；修改：src/io/importers.ts（新增 importProjectFromZip 及 fflate 导入）、src/io/index.ts（新增 importProjectFromZip 和 exportProjectToZip 导出）；package.json（新增 fflate 依赖） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0064（importProjectFromZip）、API-0065（exportProjectToZip） |

### T-03-05 实现项目保存功能

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-03-05 |
| 任务名称      | 实现项目保存功能 |
| 完成时间      | 2026-05-19 18:54 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 3252b72 |
| 修改记录      | 修改：src/io/exporters.ts（新增 saveProject、triggerDownload 函数，新增 validateScene/failureResult/successResult/ValidationResult 导入）、src/io/index.ts（新增 saveProject 导出）、src/tests/unit/zip-io.test.ts（新增 6 个 saveProject 测试用例）、docs/（task-log.md、api-registry.md、task-list.md）、README.md |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0066（saveProject） |

### T-04-02 实现同层元素碰撞检测

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-04-02 |
| 任务名称      | 实现同层元素碰撞检测 |
| 完成时间      | 2026-05-19 20:55 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | c25d3c9 |
| 修改记录      | 新建：src/core/collision.ts（checkLayerCollisions 函数、CollisionEntry/CollisionResult/CollisionCheckOptions 接口）、src/tests/unit/collision.test.ts（15 个测试用例）；修改：src/core/index.ts（新增 collision 模块导出） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0069（checkLayerCollisions）、API-0070（CollisionEntry）、API-0071（CollisionResult）、API-0072（CollisionCheckOptions） |

### T-04-03 实现图层冲突校验器

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-04-03 |
| 任务名称      | 实现图层冲突校验器 |
| 完成时间      | 2026-05-19 21:15 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 3aa1e90 |
| 修改记录      | 修改：src/core/validator.ts（新增 validateGeometryRules 函数，集成到 validateScene Stage 6，新增 checkLayerCollisions/CollisionCheckOptions/createGeometryAdapter/SceneElement 导入）；修改：src/tests/unit/validator.test.ts（新增 12 个几何规则测试用例：同层重叠检测、多层独立检测、connector 豁免、maxLayerCount 超限、hidden/locked 元素碰撞策略、错误包含 bboxes 字段；修复 3 个已有测试数据避免新校验引入的重叠冲突、新增 transform 缺失防护） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0051（validateScene 修订：新增 Stage 6 几何规则校验）、API-0073（validateGeometryRules） |

### T-04-04 实现图层渲染顺序

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-04-04 |
| 任务名称      | 实现图层渲染顺序 |
| 完成时间      | 2026-05-19 21:30 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | f1ee122 |
| 修改记录      | 修改：src/canvas/CanvasView.tsx（新增 layerMap 按 ID 快速查找图层、隐藏图层改用 visibility:hidden 而非 return null 以保留 DOM 空间、锁定图层元素不响应 onClick 事件、marquee 框选排除锁定图层内元素）；修改：src/tests/unit/canvas-view.test.tsx（更新隐藏图层测试期望 visibility:hidden、新增 locked layer 的 click 选择和 marquee 框选测试各 1 个）；修改：README.md、docs/api-registry.md、docs/task-list.md |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0057（CanvasView：修订 - 隐藏图层标记、锁定图层交互控制） |

### T-04-01 实现 BBox 计算器

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-04-01 |
| 任务名称      | 实现 BBox 计算器 |
| 完成时间      | 2026-05-19 20:02 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 2c9c14a |
| 修改记录      | 新建：src/core/geometry.ts（getBBox 函数、createGeometryAdapter 工厂函数）、src/tests/unit/geometry.test.ts（41 个测试用例）；修改：src/core/index.ts（新增 getBBox 和 createGeometryAdapter 导出） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0067（getBBox）、API-0068（createGeometryAdapter） |

### T-04-05 实现冲突高亮显示

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-04-05 |
| 任务名称      | 实现冲突高亮显示 |
| 完成时间      | 2026-05-19 21:50 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | ee49ef6 |
| 修改记录      | 新建：src/canvas/conflict.ts（ConflictHighlighter 类、ConflictInfo 接口）、src/ui/ConflictPanel.tsx（ConflictPanel 组件）、src/tests/unit/conflict.test.ts（13 个 ConflictHighlighter 测试用例）、src/tests/unit/conflict-panel.test.tsx（10 个 ConflictPanel 测试用例）；修改：src/canvas/CanvasView.tsx（新增 conflictHighlighter prop、冲突叠层渲染红色虚线包围盒和重叠区域）、src/canvas/index.ts（新增 ConflictHighlighter 和 ConflictInfo 导出）、src/ui/index.ts（新增 ConflictPanel 和 ConflictPanelProps 导出）、src/App.tsx（集成 ConflictHighlighter、冲突检测逻辑和 ConflictPanel）、src/tests/unit/canvas-view.test.tsx（新增 8 个冲突叠层测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0074（ConflictHighlighter）、API-0075（ConflictInfo）、API-0076（ConflictPanel）、API-0077（ConflictPanelProps） |

### T-05-01 实现命令系统框架

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-01 |
| 任务名称      | 实现命令系统框架 |
| 完成时间      | 2026-05-19 22:01 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 697fb31 |
| 修改记录      | 新建：src/core/commands.ts（SceneCommand 接口、CommandHistoryEntry 接口、CommandExecutor 类）、src/tests/unit/commands.test.ts（15 个测试用例）；修改：src/core/index.ts（新增 SceneCommand、CommandHistoryEntry、CommandExecutor 导出） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0078（SceneCommand）、API-0079（CommandHistoryEntry）、API-0080（CommandExecutor） |

### T-05-02 实现 CreateElement 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-02 |
| 任务名称      | 实现 CreateElement 命令 |
| 完成时间      | 2026-05-19 22:06 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 76fdde4 |
| 修改记录      | 修改：src/core/commands.ts（新增 ElementInput 接口、buildElementFromInput/checkElementCollision 辅助函数、CreateElementCommand 类）、src/tests/unit/commands.test.ts（新增 10 个 CreateElementCommand 测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0081（ElementInput）、API-0082（CreateElementCommand） |

### T-05-03 实现 MoveElements 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-03 |
| 任务名称      | 实现 MoveElements 命令 |
| 完成时间      | 2026-05-19 22:14 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | b09e339 |
| 修改记录      | 修改：src/core/commands.ts（新增 MoveElementsCommand 类，支持碰撞检测、锁定检查、连接线端点跟随）、src/tests/unit/commands.test.ts（新增 9 个 MoveElementsCommand 测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0083（MoveElementsCommand） |

### T-05-04 实现 UpdateElement 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-04 |
| 任务名称      | 实现 UpdateElement 命令 |
| 完成时间      | 2026-05-19 22:17 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 1a653b8 |
| 修改记录      | 修改：src/core/commands.ts（新增 ElementChanges 类型、UpdateElementCommand 类，支持样式/位置/尺寸/可见性/锁定等属性修改）、src/tests/unit/commands.test.ts（新增 10 个 UpdateElementCommand 测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0084（ElementChanges）、API-0085（UpdateElementCommand） |

### T-05-05 实现 ChangeLayer 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-05 |
| 任务名称      | 实现 ChangeLayer 命令 |
| 完成时间      | 2026-05-19 22:20 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | a2ccfc6 |
| 修改记录      | 修改：src/core/commands.ts（新增 ChangeLayerCommand 类，支持跨层移动、connector 豁免碰撞、锁定检查）、src/tests/unit/commands.test.ts（新增 9 个 ChangeLayerCommand 测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0086（ChangeLayerCommand） |

### T-05-06 实现 TransformElements 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-06 |
| 任务名称      | 实现 TransformElements 命令 |
| 完成时间      | 2026-05-19 22:23 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 58bffb4 |
| 修改记录      | 修改：src/core/commands.ts（新增 TransformParams 类型、TransformElementsCommand 类，支持缩放、旋转、尺寸变换及碰撞检测）、src/tests/unit/commands.test.ts（新增 9 个 TransformElementsCommand 测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0087（TransformParams）、API-0088（TransformElementsCommand） |

### T-05-07 实现图形绘制工具

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-07 |
| 任务名称      | 实现图形绘制工具 |
| 完成时间      | 2026-05-20 08:40 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | ec797b0 |
| 修改记录      | 新建：src/ui/ShapeToolbar.tsx、src/tests/unit/shape-toolbar.test.tsx（7 个测试用例）、src/tests/unit/drawing.test.tsx（23 个测试用例）；修改：src/canvas/CanvasView.tsx（新增 activeTool/drawingLayerId/onDrawComplete props、DrawState 内部状态、绘制预览渲染 renderDrawPreview、拖拽绘制交互、多边形逐点绘制交互、drawStateToInput 转换函数、crosshair 光标）、src/canvas/index.ts（新增 DrawingToolType 导出）、src/core/index.ts（新增 ElementInput/CreateElementCommand 导出）、src/ui/index.ts（新增 ShapeToolbar/ShapeToolbarProps 导出）、src/App.tsx（集成 Zustand store 和 CommandExecutor、activeTool 状态、ShapeToolbar、findActiveLayerId 辅助函数） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0057（CanvasView 修订：新增 drawing props）、API-0089（DrawingToolType）、API-0090（ShapeToolbar）、API-0091（ShapeToolbarProps）、API-0092（drawStateToInput：导出 + 新增 text case）、API-0093（renderDrawPreview：导出 + 新增 text case） |

### T-05-08 实现文本工具

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-08 |
| 任务名称      | 实现文本工具 |
| 完成时间      | 2026-05-20 09:22 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | e0b6c2a |
| 修改记录      | 新建：src/ui/TextEditor.tsx（覆盖层文本编辑器含样式工具栏）、src/tests/unit/text-editor.test.tsx（14 个测试用例）、src/tests/unit/text-tool.test.tsx（9 个测试用例）；修改：src/core/types.ts（TextElement 新增 backgroundColor/borderColor/borderWidth 字段）、src/core/commands.ts（CreateElementCommand 新增 getElementId 方法）、src/canvas/CanvasView.tsx（DrawingToolType 新增 'text'、导出 drawStateToInput/renderDrawPreview、新增 onTextEditRequest prop、drawStateToInput 新增 text case、renderDrawPreview 新增 text preview、renderTextElement 支持背景色/边框渲染、handleMouseDown 支持 text tool 在元素上点击创建文本、handleDoubleClick 支持文本元素双击编辑、SVG onDoubleClick 始终激活）、src/canvas/index.ts（导出 drawStateToInput/renderDrawPreview）、src/ui/ShapeToolbar.tsx（新增 Text 工具按钮和图标）、src/ui/index.ts（新增 TextEditor 和 TextEditorProps 导出）、src/App.tsx（集成 TextEditor 编辑器、editingTextId 状态、handleDrawComplete 支持 text 自动进入编辑、handleTextEditRequest/handleTextCommit/handleTextCancel 回调、handleToolChange 切换工具时退出编辑模式） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0094（TextEditor）、API-0095（TextEditorProps）、API-0018（TextElement 修订：新增 backgroundColor/borderColor/borderWidth）、API-0057（CanvasView 修订：新增 onTextEditRequest prop / 文本编辑和渲染）、API-0082（CreateElementCommand 修订：新增 getElementId）、API-0089（DrawingToolType 修订：新增 'text'）、API-0090（ShapeToolbar 修订：新增 Text 按钮）、API-0092（drawStateToInput 修订：导出 + 新增 text case）、API-0093（renderDrawPreview 修订：导出 + 新增 text preview） |

### T-05-09 实现图片导入工具

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-09 |
| 任务名称      | 实现图片导入工具 |
| 完成时间      | 2026-05-20 10:05 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 2ad0a0a |
| 修改记录      | 新建：src/io/svg-sanitizer.ts（SVG 安全清洗：移除 script/foreignObject/use 标签、事件处理器属性和 javascript: 链接）、src/io/image-utils.ts（图片导入工具：PNG/JPG/SVG 文件导入、SVG 清洗集成、尺寸解析、缩放适配）、src/ui/ImageImportButton.tsx（导入图片按钮组件：文件选择器触发、导入回调）、src/tests/unit/svg-sanitizer.test.ts（13 个测试用例）、src/tests/unit/image-utils.test.ts（18 个测试用例）、src/tests/unit/image-import-button.test.tsx（6 个测试用例）；修改：src/io/index.ts（新增 sanitizeSvg/sanitizeSvgToBlob/isSupportedImageFile/importImageFromFile 导出）、src/ui/index.ts（新增 ImageImportButton/ImageImportButtonProps 导出）、src/App.tsx（集成 ImageImportButton、拖放导入支持含 drop-overlay、handleImageImport/handleDragOver/handleDragLeave/handleDrop 回调）、src/App.css（新增 drop-overlay 和 image-import-btn 样式） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0096（sanitizeSvg）、API-0097（sanitizeSvgToBlob）、API-0098（isSupportedImageFile）、API-0099（importImageFromFile）、API-0100（ImageImportButton）、API-0101（ImageImportButtonProps） |

### T-05-10 实现属性面板

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-05-10 |
| 任务名称      | 实现属性面板 |
| 完成时间      | 2026-05-20 10:40 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | ff99f6a |
| 修改记录      | 新建：src/ui/PropertyPanel.tsx、src/tests/unit/property-panel.test.tsx（27 个测试用例）；修改：src/ui/index.ts（新增 PropertyPanel/PropertyPanelProps 导出）、src/App.tsx（集成 PropertyPanel、handlePropertyChange/handleLayerChange 回调、ChangeLayerCommand 导入）、docs/api-registry.md（新增 API-0102/API-0103）、docs/task-list.md（T-05-10 状态改为已完成）、README.md（更新测试计数和功能描述） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0102（PropertyPanel）、API-0103（PropertyPanelProps） |

### T-06-02 实现对齐命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-06-02 |
| 任务名称      | 实现对齐命令 |
| 完成时间      | 2026-05-20 11:25 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 6790f93 |
| 修改记录      | 修改：src/core/commands.ts（新增 AlignType 类型、AlignElementsCommand 类：支持 left/right/top/bottom/centerHorizontal/centerVertical/center 七种对齐方式，计算统一包围盒，移动后检查图层冲突，连接线端点跟随）；修改：src/core/index.ts（新增 AlignElementsCommand 和 AlignType 导出）；修改：src/tests/unit/commands.test.ts（新增 12 个对齐命令测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0108（AlignType）、API-0109（AlignElementsCommand） |

### T-06-03 实现分布命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-06-03 |
| 任务名称      | 实现分布命令 |
| 完成时间      | 2026-05-20 11:40 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | ac6bedc |
| 修改记录      | 修改：src/core/commands.ts（新增 DistributeType 类型、CircularDistributeOptions 接口、DistributeElementsCommand 类：支持 horizontal/vertical/circular 三种分布方式，水平分布按中心点等距排列、垂直分布按中心点等距排列、环形分布按等角弧度在圆上排列，移动后检查图层冲突，连接线端点跟随）；修改：src/core/index.ts（新增 DistributeElementsCommand、DistributeType、CircularDistributeOptions 导出）；修改：src/tests/unit/commands.test.ts（新增 18 个分布命令测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0110（DistributeType）、API-0111（CircularDistributeOptions）、API-0112（DistributeElementsCommand） |

### T-06-04 实现 BatchLayerEdit 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-06-04 |
| 任务名称      | 实现 BatchLayerEdit 命令 |
| 完成时间      | 2026-05-20 12:00 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 4ea08db |
| 修改记录      | 修改：src/core/commands.ts（新增 BatchLayerOperation 类型、BatchLayerEditCommand 类：支持 setFill/setStroke/setOpacity/showAll/hideAll/deleteAll/copyAll/moveAll 八种按层批量操作，deleteAll 自动解绑关联的连接线端点，copyAll 在目标层克隆所有元素并生成新 ID，moveAll 迁移全部元素到目标层，所有操作均检查锁定元素和图层冲突（copy/move），完整的 undo/redo 支持）；修改：src/core/index.ts（新增 BatchLayerEditCommand 和 BatchLayerOperation 导出）；修改：src/tests/unit/commands.test.ts（新增 41 个批量编辑命令测试用例） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0113（BatchLayerOperation）、API-0114（BatchLayerEditCommand） |

### T-06-05 实现 MoveLayers 命令

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-06-05 |
| 任务名称      | 实现 MoveLayers 命令 |
| 完成时间      | 2026-05-20 12:25 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 965aa11 |
| 修改记录      | 修改：src/core/commands.ts（新增 LayerMoveDirection 类型、MoveLayersCommand 类：支持多图层 up/down 移动指定步数，每个选中层独立计算目标位置并跳过非选中层，保持选中层相对顺序，事务式校验——计算移动后最终状态并检查每层内碰撞冲突，任一层冲突则整体回滚，完整 undo/redo 支持）；修改：src/core/index.ts（新增 MoveLayersCommand 和 LayerMoveDirection 导出）；修改：src/tests/unit/commands.test.ts（新增 22 个 MoveLayersCommand 测试用例：基本移动、多步移动、非连续层移动、相对顺序保持、边界校验、冲突检测、undo/redo、事务回滚） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0115（LayerMoveDirection）、API-0116（MoveLayersCommand） |

### T-07-01 实现锚点系统

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-07-01 |
| 任务名称      | 实现锚点系统 |
| 完成时间      | 2026-05-20 12:40 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | c150208 |
| 修改记录      | 新建：src/core/anchors.ts（getAnchors + resolveAnchor 函数，9 个默认锚点，shape 自定义锚点支持，旋转坐标计算）、src/tests/unit/anchors.test.ts（26 个测试用例）；修改：src/core/index.ts（新增 getAnchors 和 resolveAnchor 导出） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0117（getAnchors）、API-0118（resolveAnchor） |

### T-07-02 实现连接线创建和渲染

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-07-02 |
| 任务名称      | 实现连接线创建和渲染 |
| 完成时间      | 2026-05-20 13:10 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 8dcef8b |
| 修改记录      | 修改：src/canvas/CanvasView.tsx（DrawingToolType 新增 'connector'、新增 getVisibleAnchors/findElementAtPoint/findNearestAnchor 辅助函数、新增 connector 工具交互：悬停显示锚点高亮、点击锚点拖拽创建连接线、实时预览线渲染、鼠标事件处理、getCursor 支持 crosshair、connector 渲染按 route.type 使用 line 或 polyline 元素）；修改：src/ui/ShapeToolbar.tsx（新增 connector 工具按钮和图标）；修改：src/tests/unit/canvas-view.test.tsx（修正 straight 路由 connector 测试：line 替代 polyline、新增 2 个 connector 渲染测试）；修改：src/tests/unit/shape-toolbar.test.tsx（按钮数量从 7 更新为 8）；修改：src/tests/unit/commands.test.ts（新增 4 个 connector 创建测试：锚点绑定、碰撞豁免、polyline 路由、自由端点）；修改：docs/api-registry.md（更新 API-0057/API-0089/API-0117/API-0118 记录） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0057（CanvasView 修订）、API-0089（DrawingToolType 修订）、API-0117（getAnchors 修订）、API-0118（resolveAnchor 修订） |

### T-07-03 实现连接线箭头和标签

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-07-03 |
| 任务名称      | 实现连接线箭头和标签 |
| 完成时间      | 2026-05-20 13:30 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | c438a4f |
| 修改记录      | 修改：src/core/commands.ts（ElementInput 新增 arrowStart/arrowEnd/labels 字段，buildElementFromInput connector 分支支持箭头和标签，ElementChanges 新增 arrowStart/arrowEnd/labels 字段，UpdateElementCommand.execute 新增箭头和标签处理逻辑）；修改：src/canvas/CanvasView.tsx（新增 computePathPoints/computeTotalPathLength/computePointOnPath 路径计算函数，新增 createArrowMarkerId/buildArrowMarkers 箭头标记生成，renderConnectorElement 重构为支持箭头 marker 和标签渲染，SVG 根元素新增 <defs> 箭头标记定义，导入 useMemo 和 ConnectorLabel/ArrowStyle 类型）；修改：src/ui/PropertyPanel.tsx（新增 ConnectorElement/ConnectorLabel 导入，Section 类型新增 'connector'，新增连接器属性编辑区：箭头类型下拉选择、箭头尺寸、标签列表编辑和增删）；修改：src/tests/unit/canvas-view.test.tsx（新增 connector arrows 测试组 7 个用例：箭头标记 defs、marker-end、marker-start、none 样式、openTriangle、circle、polyline 标记；新增 connector labels 测试组 7 个用例：中点标签、多标签、位置计算、偏移、polyline 路径标签、无标签、字体继承）；修改：src/tests/unit/commands.test.ts（新增 UpdateElementCommand 测试组 8 个用例：arrowEnd 更新、arrowStart 更新、箭头设为 null、labels 更新、多 labels 更新、undo 恢复 arrowEnd、undo 恢复 labels、CreateElementCommand 创建带箭头和标签的 connector） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0024（ConnectorElement 修订）、API-0057（CanvasView 修订）、API-0070（UpdateElementCommand/ElementChanges 修订）、API-0119（computePointOnPath）、API-0120（buildArrowMarkers） |

### T-07-04 实现正交路由

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号      | T-07-04 |
| 任务名称      | 实现正交路由 |
| 完成时间      | 2026-05-20 15:15 |
| 作者/智能体   | OpenCode/deepseek-v4-pro |
| Git Commit    | 290c6d8 |
| 修改记录      | 新建：src/core/routing.ts（正交路由算法：directionToCardinal、computeOrthogonalRoute、recalculateConnectorRoute、recalculateRoutesForElements）、src/tests/unit/routing.test.ts（23 个测试用例）；修改：src/core/index.ts（新增 routing 导出）、src/core/commands.ts（MoveElementsCommand/AlignElementsCommand/DistributeElementsCommand/TransformElementsCommand 的 execute 方法集成路由自动重算）、src/canvas/CanvasView.tsx（connector 创建默认使用 orthogonal 路由、bend point 拖拽交互支持、新增 onConnectorRouteChange prop）、src/App.tsx（新增 handleConnectorRouteChange 回调） |
| 发现缺陷      | 无 |
| 产出接口/函数 | API-0121（directionToCardinal）、API-0122（computeOrthogonalRoute）、API-0123（recalculateConnectorRoute）、API-0124（recalculateRoutesForElements）、API-0057（CanvasView 修订：新增 onConnectorRouteChange prop） |

### T-07-05 实现连接线端点校验

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-07-05 |
| 任务名称 | 实现连接线端点校验 |
| 完成时间 | 2026-05-20 16:45 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | a60b7cb |
| 修改记录 | 新增：src/core/commands.ts（DeleteElementStrategy 类型、findConnectorsReferencingElements 辅助函数、DeleteElementCommand 类）；修改：src/core/index.ts（导出 DeleteElementCommand 和 DeleteElementStrategy）；修改：src/tests/unit/commands.test.ts（新增 18 个 DeleteElementCommand 测试用例：unbind 策略 6 个、cascade 策略 4 个、block 策略 2 个、通用行为 6 个）；更新：docs/api-registry.md（新增 API-0125 DeleteElementStrategy、API-0126 DeleteElementCommand） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0125 DeleteElementStrategy、API-0126 DeleteElementCommand |

### T-08-01 实现模板系统框架

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-08-01 |
| 任务名称 | 实现模板系统框架 |
| 完成时间 | 2026-05-20 16:50 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 86f42b8 |
| 修改记录 | 新建：src/core/templates.ts（TemplateElementDef、TemplateConnectorDef、TemplateDefinition 接口，registerTemplate/getTemplate/getAllTemplates/getTemplatesByCategory/unregisterTemplate/clearTemplates/instantiateTemplate/createTemplateInstance 函数）；修改：src/core/index.ts（导出所有新类型和函数）；新建：src/tests/unit/templates.test.ts（29 个测试用例，覆盖注册/查找/分类/移除/实例化/连接线/坐标偏移与默认样式） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0127～API-0137（TemplateElementDef、TemplateConnectorDef、TemplateDefinition、registerTemplate、getTemplate、getAllTemplates、getTemplatesByCategory、unregisterTemplate、clearTemplates、instantiateTemplate、createTemplateInstance） |

### T-08-02 实现基础几何模板

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-08-02 |
| 任务名称 | 实现基础几何模板 |
| 完成时间 | 2026-05-20 17:15 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 待填写 |
| 修改记录 | 新建：src/modules/geometric-templates.ts（registerGeometricTemplates 函数 + 9 个基础几何模板定义：矩形/圆/椭圆/三角形/菱形/五角星/箭头/双向箭头/线条，全部归类为'基础几何'）；修改：src/modules/index.ts（导出 registerGeometricTemplates 和 geometricTemplateDefinitions）；新建：src/tests/unit/geometric-templates.test.ts（37 个测试用例，覆盖模板数量/唯一性/分类/形状类型/多边形顶点数/实例化/位置偏移/ID生成/图层分配） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0138（registerGeometricTemplates）、API-0139（geometricTemplateDefinitions） |

### T-08-03 实现流程图模板

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-08-03 |
| 任务名称 | 实现流程图模板 |
| 完成时间 | 2026-05-20 17:25 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 54a1947 |
| 修改记录 | 新建：src/modules/flowchart-templates.ts（registerFlowchartTemplates 函数 + 7 个流程图专用模板定义：开始/结束（圆角矩形 fc-terminator）、处理（矩形 fc-process）、判断（菱形 fc-decision，含 是/否 标注锚点）、输入输出（平行四边形 fc-io）、子流程（双边框矩形 fc-subprocess，外框+内框两元素）、泳道（容器 fc-swimlane）、注释（文本 fc-annotation，虚线边框））；修改：src/modules/index.ts（新增 registerFlowchartTemplates 和 flowchartTemplateDefinitions 导出）；修改：src/tests/unit/templates.test.ts（新增 27 个流程图模板测试用例：覆盖 7 模板数量/ID/分类验证、各模板实例化、判断节点是/否锚点、子流程双元素偏移、容器/文本属性、注册函数幂等性） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0140（registerFlowchartTemplates）、API-0141（flowchartTemplateDefinitions） |

### T-08-04 实现架构图模板

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-08-04 |
| 任务名称 | 实现架构图模板 |
| 完成时间 | 2026-05-20 |
| 作者/智能体 | Claude |
| Git Commit | 7d77231 |
| 修改记录 | 1. 新建 src/modules/architecture-templates.ts — 注册 8 个架构图模板：服务、数据库（圆柱体路径）、缓存（闪电形状多边形）、消息队列（三叠矩形）、API网关（六边形）、负载均衡（圆+四向箭头）、云区域（容器）、浏览器/客户端（窗口框架+标题栏+红黄绿点+地址栏）。2. 更新 src/modules/index.ts 导出 registerArchitectureTemplates 和 architectureTemplateDefinitions。3. 新建 src/tests/unit/architecture-templates.test.ts — 36 个测试用例，含注册、分类、形状类型、实例化、ID唯一性、三层架构组合场景。全量 949 测试通过，零回归。 |
| 发现缺陷 | 无 |
| 产出接口/函数 | registerArchitectureTemplates(), architectureTemplateDefinitions（8 个 TemplateDefinition 对象，分类 '架构图'），模板 ID 列表：arch-service, arch-database, arch-cache, arch-mq, arch-gateway, arch-lb, arch-cloud, arch-client |

### T-08-05 实现 RTL 模块模板

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-08-05 |
| 任务名称 | 实现 RTL 模块模板 |
| 完成时间 | 2026-05-20 18:06 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 6845071 |
| 修改记录 | 新建：src/modules/rtl-templates.ts（registerRtlTemplates 函数 + 9 个 RTL 模板定义：通用模块 rtl-gen-module、寄存器 rtl-register、多路选择器 rtl-mux、ALU rtl-alu、FSM rtl-fsm、存储器 rtl-memory、流水线级 rtl-pipeline、控制器 rtl-controller、数据通路容器 rtl-datapath，全部归类为'RTL'）；修改：src/core/templates.ts（新增 TemplateRtlPortDef 接口、TemplateElementDef.ports 类型从 never[] 改为 TemplateRtlPortDef[]、buildElement 中 rtlModule case 支持根据端口方向和数量自动计算端口位置——input 在左侧、output 在右侧、inout 在上方）；修改：src/core/index.ts（新增 TemplateRtlPortDef 类型导出）；修改：src/modules/index.ts（新增 registerRtlTemplates 和 rtlTemplateDefinitions 导出）；新建：src/tests/unit/rtl-templates.test.ts（35 个测试用例，覆盖 9 模板注册、实例化、端口数量/名称/位宽/方向、端口位置布局、端口样式颜色、模块样式、Datapath 容器属性、无端口模块、注册函数幂等性、定义导出） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0144（registerRtlTemplates）、API-0145（rtlTemplateDefinitions）、API-0146（TemplateRtlPortDef） |

### T-08-06 实现模板面板 UI

| 字段          | 内容 |
| ------------- | ---- |
| 任务编号 | T-08-06 |
| 任务名称 | 实现模板面板 UI |
| 完成时间 | 2026-05-20 23:15 |
| 作者/智能体 | OpenCode/deepseek-v4-pro |
| Git Commit | 791c5d3 |
| 修改记录 | 新建：src/ui/TemplatePanel.tsx（模板面板组件：分类浏览、搜索过滤、SVG缩略图预览、点击插入）、src/tests/unit/template-panel.test.tsx（14个测试用例）；修改：src/ui/index.ts（新增 TemplatePanel 和 TemplatePanelProps 导出） |
| 发现缺陷 | 无 |
| 产出接口/函数 | API-0147（TemplatePanel）、API-0148（TemplatePanelProps） |
