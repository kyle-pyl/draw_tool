import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerTemplate,
  getTemplate,
  getAllTemplates,
  getTemplatesByCategory,
  clearTemplates,
  instantiateTemplate,
} from '../../core/templates';
import { registerRtlTemplates, rtlTemplateDefinitions } from '../../modules/rtl-templates';
import { getAnchors } from '../../core/anchors';
import type { TemplateDefinition } from '../../core/templates';

// ─── RTL Templates ────────────────────────────────────────────────────────────

describe('RTL templates', () => {
  beforeEach(() => {
    clearTemplates();
    registerRtlTemplates();
  });

  it('should register 9 RTL templates', () => {
    const all = getTemplatesByCategory('RTL');
    expect(all.length).toBe(9);
  });

  it('should have expected template ids', () => {
    const ids = getTemplatesByCategory('RTL').map((t) => t.id).sort();
    expect(ids).toEqual([
      'rtl-alu',
      'rtl-controller',
      'rtl-datapath',
      'rtl-fsm',
      'rtl-gen-module',
      'rtl-memory',
      'rtl-mux',
      'rtl-pipeline',
      'rtl-register',
    ]);
  });

  it('all templates should have category "RTL"', () => {
    for (const tpl of rtlTemplateDefinitions) {
      expect(tpl.category).toBe('RTL');
    }
  });

  describe('registerRtlTemplates', () => {
    it('should make all 9 templates available', () => {
      clearTemplates();
      registerRtlTemplates();
      expect(getAllTemplates().length).toBe(9);
    });

    it('should be idempotent', () => {
      registerRtlTemplates();
      registerRtlTemplates();
      expect(getAllTemplates().length).toBe(9);
    });
  });

  describe('rtlTemplateDefinitions export', () => {
    it('should contain exactly 9 definitions', () => {
      expect(rtlTemplateDefinitions.length).toBe(9);
    });

    it('should have all definitions with the RTL category', () => {
      for (const tpl of rtlTemplateDefinitions) {
        expect(tpl.category).toBe('RTL');
      }
    });
  });

  // ─── Individual template tests ──────────────────────────────────────────────

  describe('通用模块 (Generic Module)', () => {
    it('should instantiate an rtlModule with correct properties', () => {
      const els = instantiateTemplate('rtl-gen-module', { x: 100, y: 200 }, 'l1');
      expect(els.length).toBeGreaterThanOrEqual(1);
      const mod = els.find((e) => e.type === 'rtlModule');
      expect(mod).toBeDefined();
      if (mod && mod.type === 'rtlModule') {
        expect(mod.moduleName).toBe('module');
        expect(mod.instanceName).toBe('u_gen');
        expect(mod.transform.width).toBe(80);
        expect(mod.transform.height).toBe(70);
      }
    });

    it('should create port elements for clk/rst/data_in/data_out', () => {
      const els = instantiateTemplate('rtl-gen-module', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      expect(mod).toBeDefined();
      if (mod && mod.type === 'rtlModule') {
        expect(mod.ports).toBeDefined();
        expect(mod.ports!.length).toBe(4);

        const portNames = mod.ports!.map((p) => p.portName).sort();
        expect(portNames).toEqual(['clk', 'data_in', 'data_out', 'rst']);

        const inputs = mod.ports!.filter((p) => p.direction === 'input');
        const outputs = mod.ports!.filter((p) => p.direction === 'output');
        expect(inputs.length).toBe(3);
        expect(outputs.length).toBe(1);
      }
    });

    it('should place input ports on the left of the module', () => {
      const els = instantiateTemplate('rtl-gen-module', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      const inputs = mod.ports!.filter((p) => p.direction === 'input');
      for (const p of inputs) {
        expect(p.transform.x + p.transform.width).toBeLessThanOrEqual(mod.transform.x + 2);
      }
    });

    it('should place output ports on the right of the module', () => {
      const els = instantiateTemplate('rtl-gen-module', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      const outputs = mod.ports!.filter((p) => p.direction === 'output');
      for (const p of outputs) {
        expect(p.transform.x).toBeGreaterThanOrEqual(mod.transform.x + mod.transform.width);
      }
    });
  });

  describe('寄存器 (Register)', () => {
    it('should instantiate an rtlModule with correct properties', () => {
      const els = instantiateTemplate('rtl-register', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.moduleName).toBe('register');
      expect(mod.instanceName).toBe('u_reg');
      expect(mod.transform.width).toBe(80);
      expect(mod.transform.height).toBe(50);
    });

    it('should have clk/rst/d/q ports', () => {
      const els = instantiateTemplate('rtl-register', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.ports).toBeDefined();
      expect(mod.ports!.length).toBe(4);

      const portNames = mod.ports!.map((p) => p.portName).sort();
      expect(portNames).toEqual(['clk', 'd', 'q', 'rst']);

      const inputs = mod.ports!.filter((p) => p.direction === 'input');
      const outputs = mod.ports!.filter((p) => p.direction === 'output');
      expect(inputs.length).toBe(3); // clk, rst, d
      expect(outputs.length).toBe(1); // q
    });
  });

  describe('多路选择器 (MUX)', () => {
    it('should instantiate an rtlModule with correct properties', () => {
      const els = instantiateTemplate('rtl-mux', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.moduleName).toBe('mux');
      expect(mod.instanceName).toBe('u_mux');
      expect(mod.transform.width).toBe(80);
      expect(mod.transform.height).toBe(60);
    });

    it('should have a/b/sel/y ports with correct widths', () => {
      const els = instantiateTemplate('rtl-mux', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.ports!.length).toBe(4);

      const sel = mod.ports!.find((p) => p.portName === 'sel');
      expect(sel).toBeDefined();
      expect(sel!.bitWidth).toBe(2);

      const a = mod.ports!.find((p) => p.portName === 'a');
      expect(a).toBeDefined();
      expect(a!.bitWidth).toBe(32);

      const b = mod.ports!.find((p) => p.portName === 'b');
      expect(b).toBeDefined();
      expect(b!.bitWidth).toBe(32);

      const y = mod.ports!.find((p) => p.portName === 'y');
      expect(y).toBeDefined();
      expect(y!.bitWidth).toBe(32);
      expect(y!.direction).toBe('output');
    });
  });

  describe('ALU', () => {
    it('should instantiate an rtlModule with correct properties', () => {
      const els = instantiateTemplate('rtl-alu', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.moduleName).toBe('alu');
      expect(mod.instanceName).toBe('u_alu');
      expect(mod.transform.width).toBe(90);
      expect(mod.transform.height).toBe(80);
    });

    it('should have a/b/op/result/zero/carry ports with correct widths', () => {
      const els = instantiateTemplate('rtl-alu', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.ports!.length).toBe(6);

      const op = mod.ports!.find((p) => p.portName === 'op');
      expect(op).toBeDefined();
      expect(op!.bitWidth).toBe(4);

      const zero = mod.ports!.find((p) => p.portName === 'zero');
      expect(zero).toBeDefined();
      expect(zero!.bitWidth).toBe(1);

      const carry = mod.ports!.find((p) => p.portName === 'carry');
      expect(carry).toBeDefined();
      expect(carry!.bitWidth).toBe(1);

      const outputs = mod.ports!.filter((p) => p.direction === 'output');
      expect(outputs.length).toBe(3); // result, zero, carry
    });
  });

  describe('FSM', () => {
    it('should instantiate an rtlModule with correct properties', () => {
      const els = instantiateTemplate('rtl-fsm', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.moduleName).toBe('fsm');
      expect(mod.instanceName).toBe('u_fsm');
      expect(mod.transform.width).toBe(90);
      expect(mod.transform.height).toBe(70);
    });

    it('should have clk/rst/in/state/next_state ports', () => {
      const els = instantiateTemplate('rtl-fsm', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.ports!.length).toBe(5);

      const portNames = mod.ports!.map((p) => p.portName).sort();
      expect(portNames).toEqual(['clk', 'in', 'next_state', 'rst', 'state']);

      const state = mod.ports!.find((p) => p.portName === 'state');
      expect(state).toBeDefined();
      expect(state!.bitWidth).toBe(4);
      expect(state!.direction).toBe('output');
    });
  });

  describe('存储器 (Memory)', () => {
    it('should instantiate an rtlModule with correct properties', () => {
      const els = instantiateTemplate('rtl-memory', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.moduleName).toBe('memory');
      expect(mod.instanceName).toBe('u_mem');
      expect(mod.transform.width).toBe(100);
      expect(mod.transform.height).toBe(80);
    });

    it('should have clk/addr/wdata/wen/rdata ports with correct widths', () => {
      const els = instantiateTemplate('rtl-memory', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.ports!.length).toBe(5);

      const addr = mod.ports!.find((p) => p.portName === 'addr');
      expect(addr).toBeDefined();
      expect(addr!.bitWidth).toBe(10);
      expect(addr!.direction).toBe('input');

      const wen = mod.ports!.find((p) => p.portName === 'wen');
      expect(wen).toBeDefined();
      expect(wen!.bitWidth).toBe(1);

      const rdata = mod.ports!.find((p) => p.portName === 'rdata');
      expect(rdata).toBeDefined();
      expect(rdata!.bitWidth).toBe(32);
      expect(rdata!.direction).toBe('output');
    });
  });

  describe('流水线级 (Pipeline Stage)', () => {
    it('should instantiate an rtlModule with correct properties', () => {
      const els = instantiateTemplate('rtl-pipeline', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.moduleName).toBe('pipeline_stage');
      expect(mod.instanceName).toBe('u_pipe');
      expect(mod.transform.width).toBe(80);
      expect(mod.transform.height).toBe(60);
    });

    it('should have clk/din/dout ports with bus widths', () => {
      const els = instantiateTemplate('rtl-pipeline', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.ports!.length).toBe(3);

      const din = mod.ports!.find((p) => p.portName === 'din');
      expect(din).toBeDefined();
      expect(din!.bitWidth).toBe(64);
      expect(din!.direction).toBe('input');

      const dout = mod.ports!.find((p) => p.portName === 'dout');
      expect(dout).toBeDefined();
      expect(dout!.bitWidth).toBe(64);
      expect(dout!.direction).toBe('output');
    });
  });

  describe('控制器 (Controller)', () => {
    it('should instantiate an rtlModule with correct properties', () => {
      const els = instantiateTemplate('rtl-controller', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.moduleName).toBe('controller');
      expect(mod.instanceName).toBe('u_ctrl');
      expect(mod.transform.width).toBe(90);
      expect(mod.transform.height).toBe(70);
    });

    it('should have clk/rst/status/ctrl_sigs ports', () => {
      const els = instantiateTemplate('rtl-controller', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.ports!.length).toBe(4);

      const ctrlSigs = mod.ports!.find((p) => p.portName === 'ctrl_sigs');
      expect(ctrlSigs).toBeDefined();
      expect(ctrlSigs!.bitWidth).toBe(16);
      expect(ctrlSigs!.direction).toBe('output');
    });
  });

  describe('数据通路 (Datapath)', () => {
    it('should instantiate a container element', () => {
      const els = instantiateTemplate('rtl-datapath', { x: 50, y: 100 }, 'l1');
      expect(els.length).toBe(1);
      expect(els[0].type).toBe('container');
      if (els[0].type !== 'container') throw new Error('Expected container');
      expect(els[0].containerLabel).toBe('Datapath');
      expect(els[0].transform.x).toBe(50);
      expect(els[0].transform.y).toBe(100);
      expect(els[0].transform.width).toBe(400);
      expect(els[0].transform.height).toBe(300);
    });

    it('should have dashed border style', () => {
      const els = instantiateTemplate('rtl-datapath', { x: 0, y: 0 }, 'l1');
      expect(els[0].style.strokeDasharray).toBe('6,3');
      expect(els[0].style.fill).toBe('none');
    });
  });

  // ─── Module with no ports ───────────────────────────────────────────────────

  describe('rtlModule without ports', () => {
    it('should have empty ports array when no ports defined', () => {
      const tpl: TemplateDefinition = {
        id: 'rtl-no-ports',
        name: 'Module No Ports',
        category: 'RTL',
        elements: [
          {
            type: 'rtlModule',
            name: 'no_ports',
            moduleName: 'empty_module',
            instanceName: 'u_empty',
            transform: { x: 0, y: 0, width: 80, height: 50, rotation: 0, scaleX: 1, scaleY: 1 },
            style: { fill: '#fff', stroke: '#000', strokeWidth: 2, opacity: 1 },
          },
        ],
      };
      registerTemplate(tpl);
      const els = instantiateTemplate('rtl-no-ports', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.ports).toEqual([]);
    });
  });

  // ─── Port positioning ───────────────────────────────────────────────────────

  describe('port positioning', () => {
    it('should space input ports evenly on the left edge', () => {
      const els = instantiateTemplate('rtl-gen-module', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      const inputs = mod.ports!.filter((p) => p.direction === 'input');
      expect(inputs.length).toBe(3);

      const yPositions = inputs.map((p) => p.transform.y);
      for (let i = 1; i < yPositions.length; i++) {
        expect(yPositions[i]).toBeGreaterThan(yPositions[i - 1]);
      }
    });

    it('should space output ports evenly on the right edge', () => {
      const els = instantiateTemplate('rtl-alu', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      const outputs = mod.ports!.filter((p) => p.direction === 'output');
      expect(outputs.length).toBe(3);

      const yPositions = outputs.map((p) => p.transform.y);
      for (let i = 1; i < yPositions.length; i++) {
        expect(yPositions[i]).toBeGreaterThan(yPositions[i - 1]);
      }
    });

    it('should position ports relative to the module transform', () => {
      const els = instantiateTemplate('rtl-register', { x: 100, y: 50 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      for (const port of mod.ports!) {
        expect(port.transform.x).toBeGreaterThanOrEqual(0);
        expect(port.transform.y).toBeGreaterThanOrEqual(0);
      }
    });

    it('should assign port IDs unique within the set', () => {
      const els = instantiateTemplate('rtl-alu', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      const ids = new Set(mod.ports!.map((p) => p.id));
      expect(ids.size).toBe(mod.ports!.length);
    });
  });

  // ─── Port style ─────────────────────────────────────────────────────────────

  describe('port styles', () => {
    it('should use green fill for input ports', () => {
      const els = instantiateTemplate('rtl-register', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      const clk = mod.ports!.find((p) => p.portName === 'clk');
      expect(clk).toBeDefined();
      expect(clk!.style.fill).toBe('#4CAF50');
    });

    it('should use red fill for output ports', () => {
      const els = instantiateTemplate('rtl-register', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      const q = mod.ports!.find((p) => p.portName === 'q');
      expect(q).toBeDefined();
      expect(q!.style.fill).toBe('#F44336');
    });
  });

  // ─── Module style ───────────────────────────────────────────────────────────

  describe('rtlModule style', () => {
    it('should use light blue fill with dark blue stroke', () => {
      const els = instantiateTemplate('rtl-gen-module', { x: 0, y: 0 }, 'l1');
      const mod = els.find((e) => e.type === 'rtlModule');
      if (!mod || mod.type !== 'rtlModule') throw new Error('Expected rtlModule');
      expect(mod.style.fill).toBe('#E3F2FD');
      expect(mod.style.stroke).toBe('#1565C0');
      expect(mod.style.strokeWidth).toBe(2);
    });
  });
});
