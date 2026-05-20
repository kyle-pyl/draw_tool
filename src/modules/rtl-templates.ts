/**
 * RTL (Register Transfer Level) hardware module connection diagram templates.
 * All templates use the category "RTL".
 *
 * Templates:
 *   - 通用模块   (Generic Module)    : basic rectangular rtlModule with clk/rst/data ports
 *   - 寄存器     (Register)          : rtlModule with d/q/clk/rst ports
 *   - 多路选择器 (MUX)               : rtlModule with a/b/sel/y ports
 *   - ALU        (Arithmetic Unit)   : rtlModule with a/b/op/result/zero/carry ports
 *   - FSM        (State Machine)     : rtlModule with clk/rst/in/state/next_state ports
 *   - 存储器     (Memory)            : rtlModule with clk/addr/wdata/wen/rdata ports
 *   - 流水线级   (Pipeline Stage)    : rtlModule with clk/din/dout ports
 *   - 控制器     (Controller)        : rtlModule with clk/rst/status/ctrl_sigs ports
 *   - 数据通路   (Datapath)          : container element for enclosing datapath modules
 */
import { registerTemplate } from '../core/templates';
import type { TemplateDefinition } from '../core/templates';

const CATEGORY = 'RTL';

const moduleStyle = {
  fill: '#E3F2FD',
  stroke: '#1565C0',
  strokeWidth: 2,
  opacity: 1,
};

const containerStyle = {
  fill: 'none',
  stroke: '#7B1FA2',
  strokeWidth: 2,
  strokeDasharray: '6,3',
  opacity: 0.5,
};

const t1 = (x: number, y: number, w: number, h: number) => ({
  x, y, width: w, height: h, rotation: 0, scaleX: 1, scaleY: 1,
});

// ─── 1. 通用模块 — 80×70, clk/rst/data_in/data_out ─────────────────────────────

const genericModuleTemplate: TemplateDefinition = {
  id: 'rtl-gen-module',
  name: '通用模块',
  category: CATEGORY,
  elements: [
    {
      type: 'rtlModule',
      name: 'gen_module',
      moduleName: 'module',
      instanceName: 'u_gen',
      transform: t1(0, 0, 80, 70),
      style: moduleStyle,
      ports: [
        { direction: 'input', bitWidth: 1, portName: 'clk' },
        { direction: 'input', bitWidth: 1, portName: 'rst' },
        { direction: 'input', bitWidth: 32, portName: 'data_in' },
        { direction: 'output', bitWidth: 32, portName: 'data_out' },
      ],
    },
  ],
};

// ─── 2. 寄存器 — 80×50, clk/rst/d/q ─────────────────────────────────────────────

const regTemplate: TemplateDefinition = {
  id: 'rtl-register',
  name: '寄存器',
  category: CATEGORY,
  elements: [
    {
      type: 'rtlModule',
      name: 'register',
      moduleName: 'register',
      instanceName: 'u_reg',
      transform: t1(0, 0, 80, 50),
      style: moduleStyle,
      ports: [
        { direction: 'input', bitWidth: 1, portName: 'clk' },
        { direction: 'input', bitWidth: 1, portName: 'rst' },
        { direction: 'input', bitWidth: 32, portName: 'd' },
        { direction: 'output', bitWidth: 32, portName: 'q' },
      ],
    },
  ],
};

// ─── 3. 多路选择器 — 80×70, a/b/sel/y ──────────────────────────────────────────

const muxTemplate: TemplateDefinition = {
  id: 'rtl-mux',
  name: '多路选择器',
  category: CATEGORY,
  elements: [
    {
      type: 'rtlModule',
      name: 'mux',
      moduleName: 'mux',
      instanceName: 'u_mux',
      transform: t1(0, 0, 80, 60),
      style: moduleStyle,
      ports: [
        { direction: 'input', bitWidth: 32, portName: 'a' },
        { direction: 'input', bitWidth: 32, portName: 'b' },
        { direction: 'input', bitWidth: 2, portName: 'sel' },
        { direction: 'output', bitWidth: 32, portName: 'y' },
      ],
    },
  ],
};

// ─── 4. ALU — 90×80, a/b/op/result/zero/carry ──────────────────────────────────

const aluTemplate: TemplateDefinition = {
  id: 'rtl-alu',
  name: 'ALU',
  category: CATEGORY,
  elements: [
    {
      type: 'rtlModule',
      name: 'alu',
      moduleName: 'alu',
      instanceName: 'u_alu',
      transform: t1(0, 0, 90, 80),
      style: moduleStyle,
      ports: [
        { direction: 'input', bitWidth: 32, portName: 'a' },
        { direction: 'input', bitWidth: 32, portName: 'b' },
        { direction: 'input', bitWidth: 4, portName: 'op' },
        { direction: 'output', bitWidth: 32, portName: 'result' },
        { direction: 'output', bitWidth: 1, portName: 'zero' },
        { direction: 'output', bitWidth: 1, portName: 'carry' },
      ],
    },
  ],
};

// ─── 5. FSM — 90×70, clk/rst/in/state/next_state ───────────────────────────────

const fsmTemplate: TemplateDefinition = {
  id: 'rtl-fsm',
  name: 'FSM',
  category: CATEGORY,
  elements: [
    {
      type: 'rtlModule',
      name: 'fsm',
      moduleName: 'fsm',
      instanceName: 'u_fsm',
      transform: t1(0, 0, 90, 70),
      style: moduleStyle,
      ports: [
        { direction: 'input', bitWidth: 1, portName: 'clk' },
        { direction: 'input', bitWidth: 1, portName: 'rst' },
        { direction: 'input', bitWidth: 8, portName: 'in' },
        { direction: 'output', bitWidth: 4, portName: 'state' },
        { direction: 'output', bitWidth: 4, portName: 'next_state' },
      ],
    },
  ],
};

// ─── 6. 存储器 — 100×80, clk/addr/wdata/wen/rdata ──────────────────────────────

const memoryTemplate: TemplateDefinition = {
  id: 'rtl-memory',
  name: '存储器',
  category: CATEGORY,
  elements: [
    {
      type: 'rtlModule',
      name: 'memory',
      moduleName: 'memory',
      instanceName: 'u_mem',
      transform: t1(0, 0, 100, 80),
      style: moduleStyle,
      ports: [
        { direction: 'input', bitWidth: 1, portName: 'clk' },
        { direction: 'input', bitWidth: 10, portName: 'addr' },
        { direction: 'input', bitWidth: 32, portName: 'wdata' },
        { direction: 'input', bitWidth: 1, portName: 'wen' },
        { direction: 'output', bitWidth: 32, portName: 'rdata' },
      ],
    },
  ],
};

// ─── 7. 流水线级 — 80×60, clk/din/dout ──────────────────────────────────────────

const pipelineTemplate: TemplateDefinition = {
  id: 'rtl-pipeline',
  name: '流水线级',
  category: CATEGORY,
  elements: [
    {
      type: 'rtlModule',
      name: 'pipeline',
      moduleName: 'pipeline_stage',
      instanceName: 'u_pipe',
      transform: t1(0, 0, 80, 60),
      style: moduleStyle,
      ports: [
        { direction: 'input', bitWidth: 1, portName: 'clk' },
        { direction: 'input', bitWidth: 64, portName: 'din' },
        { direction: 'output', bitWidth: 64, portName: 'dout' },
      ],
    },
  ],
};

// ─── 8. 控制器 — 90×70, clk/rst/status/ctrl_sigs ───────────────────────────────

const controllerTemplate: TemplateDefinition = {
  id: 'rtl-controller',
  name: '控制器',
  category: CATEGORY,
  elements: [
    {
      type: 'rtlModule',
      name: 'controller',
      moduleName: 'controller',
      instanceName: 'u_ctrl',
      transform: t1(0, 0, 90, 70),
      style: moduleStyle,
      ports: [
        { direction: 'input', bitWidth: 1, portName: 'clk' },
        { direction: 'input', bitWidth: 1, portName: 'rst' },
        { direction: 'input', bitWidth: 8, portName: 'status' },
        { direction: 'output', bitWidth: 16, portName: 'ctrl_sigs' },
      ],
    },
  ],
};

// ─── 9. 数据通路 — container 400×300 ───────────────────────────────────────────

const datapathTemplate: TemplateDefinition = {
  id: 'rtl-datapath',
  name: '数据通路',
  category: CATEGORY,
  elements: [
    {
      type: 'container',
      name: 'datapath',
      containerLabel: 'Datapath',
      transform: t1(0, 0, 400, 300),
      style: containerStyle,
    },
  ],
};

// ─── Aggregate and export ──────────────────────────────────────────────────────

const templates: TemplateDefinition[] = [
  genericModuleTemplate,
  regTemplate,
  muxTemplate,
  aluTemplate,
  fsmTemplate,
  memoryTemplate,
  pipelineTemplate,
  controllerTemplate,
  datapathTemplate,
];

/**
 * Register all 9 RTL hardware module templates in the global registry.
 * Safe to call multiple times (overwrites existing entries with same id).
 */
export function registerRtlTemplates(): void {
  for (const tpl of templates) {
    registerTemplate(tpl);
  }
}

export { templates as rtlTemplateDefinitions };
