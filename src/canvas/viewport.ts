import type { BBox } from '../core/types';

export interface ViewportConfig {
  minZoom: number;
  maxZoom: number;
  zoomStep: number;
  initialZoom: number;
  initialOffsetX: number;
  initialOffsetY: number;
}

const DEFAULT_CONFIG: ViewportConfig = {
  minZoom: 0.1,
  maxZoom: 10,
  zoomStep: 1.2,
  initialZoom: 1,
  initialOffsetX: 0,
  initialOffsetY: 0,
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export class Viewport {
  zoom: number;
  offsetX: number;
  offsetY: number;

  private config: ViewportConfig;

  constructor(config?: Partial<ViewportConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.zoom = this.config.initialZoom;
    this.offsetX = this.config.initialOffsetX;
    this.offsetY = this.config.initialOffsetY;
  }

  screenToCanvas(screenX: number, screenY: number): { x: number; y: number } {
    if (this.zoom === 0) return { x: screenX, y: screenY };
    return {
      x: (screenX - this.offsetX) / this.zoom,
      y: (screenY - this.offsetY) / this.zoom,
    };
  }

  canvasToScreen(canvasX: number, canvasY: number): { x: number; y: number } {
    return {
      x: this.zoom * canvasX + this.offsetX,
      y: this.zoom * canvasY + this.offsetY,
    };
  }

  pan(dx: number, dy: number): void {
    this.offsetX += dx;
    this.offsetY += dy;
  }

  zoomTo(targetZoom: number, centerX: number = 0, centerY: number = 0): void {
    const clampedZoom = clamp(targetZoom, this.config.minZoom, this.config.maxZoom);
    if (clampedZoom === this.zoom) return;

    const canvasCenterX = (centerX - this.offsetX) / this.zoom;
    const canvasCenterY = (centerY - this.offsetY) / this.zoom;

    this.zoom = clampedZoom;
    this.offsetX = centerX - clampedZoom * canvasCenterX;
    this.offsetY = centerY - clampedZoom * canvasCenterY;
  }

  zoomIn(centerX: number = 0, centerY: number = 0): void {
    this.zoomTo(this.zoom * this.config.zoomStep, centerX, centerY);
  }

  zoomOut(centerX: number = 0, centerY: number = 0): void {
    this.zoomTo(this.zoom / this.config.zoomStep, centerX, centerY);
  }

  fitToRect(
    bbox: BBox,
    containerWidth: number,
    containerHeight: number,
    padding: number = 20
  ): void {
    if (bbox.width === 0 || bbox.height === 0) return;

    const availableWidth = containerWidth - padding * 2;
    const availableHeight = containerHeight - padding * 2;

    const scaleX = availableWidth / bbox.width;
    const scaleY = availableHeight / bbox.height;
    const targetZoom = Math.min(scaleX, scaleY);

    this.zoom = clamp(targetZoom, this.config.minZoom, this.config.maxZoom);

    const bboxCenterX = bbox.x + bbox.width / 2;
    const bboxCenterY = bbox.y + bbox.height / 2;

    this.offsetX = containerWidth / 2 - this.zoom * bboxCenterX;
    this.offsetY = containerHeight / 2 - this.zoom * bboxCenterY;
  }

  reset(): void {
    this.zoom = this.config.initialZoom;
    this.offsetX = this.config.initialOffsetX;
    this.offsetY = this.config.initialOffsetY;
  }

  getTransformMatrix(): string {
    return `matrix(${this.zoom}, 0, 0, ${this.zoom}, ${this.offsetX}, ${this.offsetY})`;
  }
}
