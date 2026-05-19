import { describe, it, expect } from 'vitest';
import { Viewport } from '../../canvas/viewport';

describe('Viewport', () => {
  describe('constructor', () => {
    it('should initialize with default config values', () => {
      const vp = new Viewport();
      expect(vp.zoom).toBe(1);
      expect(vp.offsetX).toBe(0);
      expect(vp.offsetY).toBe(0);
    });

    it('should initialize with custom config values', () => {
      const vp = new Viewport({
        initialZoom: 2,
        initialOffsetX: 100,
        initialOffsetY: 200,
      });
      expect(vp.zoom).toBe(2);
      expect(vp.offsetX).toBe(100);
      expect(vp.offsetY).toBe(200);
    });

    it('should merge partial config with defaults', () => {
      const vp = new Viewport({ initialZoom: 1.5 });
      expect(vp.zoom).toBe(1.5);
      expect(vp.offsetX).toBe(0);
      expect(vp.offsetY).toBe(0);
    });
  });

  describe('screenToCanvas', () => {
    it('should convert screen coordinates to canvas at identity zoom', () => {
      const vp = new Viewport();
      const result = vp.screenToCanvas(100, 200);
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
    });

    it('should convert with offset applied', () => {
      const vp = new Viewport({ initialOffsetX: 50, initialOffsetY: 30 });
      const result = vp.screenToCanvas(150, 230);
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
    });

    it('should convert with zoom applied', () => {
      const vp = new Viewport({ initialZoom: 2 });
      const result = vp.screenToCanvas(200, 400);
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
    });

    it('should convert with both zoom and offset', () => {
      const vp = new Viewport({ initialZoom: 2, initialOffsetX: 100, initialOffsetY: 50 });
      const result = vp.screenToCanvas(300, 450);
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
    });

    it('should handle negative screen coordinates', () => {
      const vp = new Viewport();
      const result = vp.screenToCanvas(-100, -200);
      expect(result.x).toBe(-100);
      expect(result.y).toBe(-200);
    });
  });

  describe('canvasToScreen', () => {
    it('should convert canvas coordinates to screen at identity zoom', () => {
      const vp = new Viewport();
      const result = vp.canvasToScreen(100, 200);
      expect(result.x).toBe(100);
      expect(result.y).toBe(200);
    });

    it('should convert with offset applied', () => {
      const vp = new Viewport({ initialOffsetX: 50, initialOffsetY: 30 });
      const result = vp.canvasToScreen(100, 200);
      expect(result.x).toBe(150);
      expect(result.y).toBe(230);
    });

    it('should convert with zoom applied', () => {
      const vp = new Viewport({ initialZoom: 3 });
      const result = vp.canvasToScreen(100, 200);
      expect(result.x).toBe(300);
      expect(result.y).toBe(600);
    });

    it('should convert with both zoom and offset', () => {
      const vp = new Viewport({ initialZoom: 0.5, initialOffsetX: 10, initialOffsetY: 20 });
      const result = vp.canvasToScreen(100, 200);
      expect(result.x).toBe(60);
      expect(result.y).toBe(120);
    });
  });

  describe('screenToCanvas and canvasToScreen round-trip', () => {
    it('should be inverse of each other at zoom 1, offset 0', () => {
      const vp = new Viewport();
      const screen = vp.canvasToScreen(42, 99);
      const canvas = vp.screenToCanvas(screen.x, screen.y);
      expect(canvas.x).toBeCloseTo(42, 10);
      expect(canvas.y).toBeCloseTo(99, 10);
    });

    it('should be inverse at zoom 2, offset non-zero', () => {
      const vp = new Viewport({ initialZoom: 2, initialOffsetX: 100, initialOffsetY: 50 });
      const screen = vp.canvasToScreen(42, 99);
      const canvas = vp.screenToCanvas(screen.x, screen.y);
      expect(canvas.x).toBeCloseTo(42, 10);
      expect(canvas.y).toBeCloseTo(99, 10);
    });

    it('should be inverse at zoom 0.3, offset negative', () => {
      const vp = new Viewport({ initialZoom: 0.3, initialOffsetX: -200, initialOffsetY: -100 });
      const screen = vp.canvasToScreen(50, 75);
      const canvas = vp.screenToCanvas(screen.x, screen.y);
      expect(canvas.x).toBeCloseTo(50, 10);
      expect(canvas.y).toBeCloseTo(75, 10);
    });

    it('should be inverse after pan', () => {
      const vp = new Viewport();
      vp.pan(30, -40);
      const screen = vp.canvasToScreen(100, 200);
      const canvas = vp.screenToCanvas(screen.x, screen.y);
      expect(canvas.x).toBeCloseTo(100, 10);
      expect(canvas.y).toBeCloseTo(200, 10);
    });
  });

  describe('pan', () => {
    it('should update offset by delta', () => {
      const vp = new Viewport();
      vp.pan(10, 20);
      expect(vp.offsetX).toBe(10);
      expect(vp.offsetY).toBe(20);
    });

    it('should accumulate multiple pans', () => {
      const vp = new Viewport();
      vp.pan(10, 20);
      vp.pan(-5, 30);
      expect(vp.offsetX).toBe(5);
      expect(vp.offsetY).toBe(50);
    });

    it('should allow negative pan values', () => {
      const vp = new Viewport();
      vp.pan(-50, -100);
      expect(vp.offsetX).toBe(-50);
      expect(vp.offsetY).toBe(-100);
    });
  });

  describe('zoomTo', () => {
    it('should set zoom to the specified value', () => {
      const vp = new Viewport();
      vp.zoomTo(2);
      expect(vp.zoom).toBe(2);
    });

    it('should clamp zoom to minZoom', () => {
      const vp = new Viewport({ minZoom: 0.2 });
      vp.zoomTo(0.01);
      expect(vp.zoom).toBe(0.2);
    });

    it('should clamp zoom to maxZoom', () => {
      const vp = new Viewport({ maxZoom: 5 });
      vp.zoomTo(100);
      expect(vp.zoom).toBe(5);
    });

    it('should zoom centered at a given screen point', () => {
      const vp = new Viewport();
      vp.zoomTo(2, 100, 100);
      const result = vp.screenToCanvas(100, 100);
      expect(result.x).toBeCloseTo(100, 5);
      expect(result.y).toBeCloseTo(100, 5);
    });

    it('should keep the center point stable when zooming in', () => {
      const vp = new Viewport({ initialOffsetX: 200, initialOffsetY: 100 });
      const startCanvas = vp.screenToCanvas(300, 200);
      vp.zoomTo(2, 300, 200);
      const endCanvas = vp.screenToCanvas(300, 200);
      expect(endCanvas.x).toBeCloseTo(startCanvas.x, 5);
      expect(endCanvas.y).toBeCloseTo(startCanvas.y, 5);
    });

    it('should be a no-op if clamped zoom equals current zoom', () => {
      const vp = new Viewport({ maxZoom: 2 });
      vp.zoomTo(2);
      vp.zoomTo(5);
      expect(vp.zoom).toBe(2);
    });
  });

  describe('zoomIn and zoomOut', () => {
    it('should increase zoom by step factor', () => {
      const vp = new Viewport({ zoomStep: 1.5 });
      vp.zoomIn();
      expect(vp.zoom).toBe(1.5);
      vp.zoomIn();
      expect(vp.zoom).toBe(2.25);
    });

    it('should decrease zoom by step factor', () => {
      const vp = new Viewport({ zoomStep: 1.5, initialZoom: 2.25 });
      vp.zoomOut();
      expect(vp.zoom).toBe(1.5);
      vp.zoomOut();
      expect(vp.zoom).toBe(1);
    });

    it('should zoom in centered on a point', () => {
      const vp = new Viewport({ initialOffsetX: 100, initialOffsetY: 50 });
      const startCanvas = vp.screenToCanvas(200, 100);
      vp.zoomIn(200, 100);
      const endCanvas = vp.screenToCanvas(200, 100);
      expect(endCanvas.x).toBeCloseTo(startCanvas.x, 5);
      expect(endCanvas.y).toBeCloseTo(startCanvas.y, 5);
    });

    it('should not exceed maxZoom on zoomIn', () => {
      const vp = new Viewport({ maxZoom: 2, zoomStep: 10 });
      vp.zoomIn();
      expect(vp.zoom).toBe(2);
    });

    it('should not go below minZoom on zoomOut', () => {
      const vp = new Viewport({ minZoom: 0.5, zoomStep: 10 });
      vp.zoomOut();
      expect(vp.zoom).toBe(0.5);
    });
  });

  describe('fitToRect', () => {
    it('should fit a rectangle to the center of the viewport', () => {
      const vp = new Viewport();
      vp.fitToRect({ x: 0, y: 0, width: 100, height: 50 }, 520, 520);
      const center = vp.screenToCanvas(260, 260);
      expect(center.x).toBeCloseTo(50, 5);
      expect(center.y).toBeCloseTo(25, 5);
    });

    it('should scale down to fit a large rect', () => {
      const vp = new Viewport();
      vp.fitToRect({ x: 0, y: 0, width: 2000, height: 1000 }, 520, 520);
      expect(vp.zoom).toBeLessThan(1);
    });

    it('should scale up to fit a small rect within limits', () => {
      const vp = new Viewport({ maxZoom: 5 });
      vp.fitToRect({ x: 0, y: 0, width: 10, height: 5 }, 800, 800);
      expect(vp.zoom).toBeGreaterThan(1);
    });

    it('should handle zero-width rect gracefully', () => {
      const vp = new Viewport();
      vp.fitToRect({ x: 0, y: 0, width: 0, height: 100 }, 500, 500);
      expect(vp.zoom).toBe(1);
    });

    it('should handle zero-height rect gracefully', () => {
      const vp = new Viewport();
      vp.fitToRect({ x: 0, y: 0, width: 100, height: 0 }, 500, 500);
      expect(vp.zoom).toBe(1);
    });

    it('should apply padding', () => {
      const vp = new Viewport();
      vp.fitToRect({ x: 0, y: 0, width: 100, height: 100 }, 300, 300, 50);
      expect(vp.zoom).toBeCloseTo(2, 5);
    });

    it('should respect minZoom in fitToRect', () => {
      const vp = new Viewport({ minZoom: 0.5 });
      vp.fitToRect({ x: 0, y: 0, width: 10000, height: 10000 }, 500, 500);
      expect(vp.zoom).toBe(0.5);
    });

    it('should respect maxZoom in fitToRect', () => {
      const vp = new Viewport({ maxZoom: 2 });
      vp.fitToRect({ x: 0, y: 0, width: 1, height: 1 }, 800, 800);
      expect(vp.zoom).toBe(2);
    });
  });

  describe('reset', () => {
    it('should restore initial zoom and offset', () => {
      const vp = new Viewport({ initialZoom: 1.5, initialOffsetX: 10, initialOffsetY: 20 });
      vp.zoomTo(3);
      vp.pan(100, 200);
      vp.reset();
      expect(vp.zoom).toBe(1.5);
      expect(vp.offsetX).toBe(10);
      expect(vp.offsetY).toBe(20);
    });
  });

  describe('getTransformMatrix', () => {
    it('should produce an SVG matrix transform string at identity', () => {
      const vp = new Viewport();
      expect(vp.getTransformMatrix()).toBe('matrix(1, 0, 0, 1, 0, 0)');
    });

    it('should produce correct matrix after zoom and pan', () => {
      const vp = new Viewport({ initialZoom: 2, initialOffsetX: 100, initialOffsetY: 50 });
      expect(vp.getTransformMatrix()).toBe('matrix(2, 0, 0, 2, 100, 50)');
    });

    it('should update after state changes', () => {
      const vp = new Viewport();
      vp.zoomTo(0.5);
      vp.pan(30, 40);
      expect(vp.getTransformMatrix()).toBe('matrix(0.5, 0, 0, 0.5, 30, 40)');
    });
  });

  describe('default zoom range (0.1 to 10)', () => {
    it('should clamp to default min 0.1', () => {
      const vp = new Viewport();
      vp.zoomTo(0.01);
      expect(vp.zoom).toBe(0.1);
    });

    it('should clamp to default max 10', () => {
      const vp = new Viewport();
      vp.zoomTo(100);
      expect(vp.zoom).toBe(10);
    });
  });
});
