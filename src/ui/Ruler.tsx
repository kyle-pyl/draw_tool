import { useRef, useEffect, useCallback, useState } from 'react';
import type { Viewport } from '../canvas/viewport';

export interface RulerProps {
  viewport: Viewport;
  width: number;
  height: number;
  rulerSize?: number;
}

function computeTickInterval(zoom: number): number {
  const idealTickPx = 40;
  const base = idealTickPx / zoom;
  const magnitude = Math.pow(10, Math.floor(Math.log10(base)));
  const residual = base / magnitude;
  if (residual <= 1.5) return magnitude;
  if (residual <= 3.5) return 2 * magnitude;
  if (residual <= 7.5) return 5 * magnitude;
  return 10 * magnitude;
}

export function Ruler({ viewport, width, height, rulerSize = 25 }: RulerProps) {
  const hCanvasRef = useRef<HTMLCanvasElement>(null);
  const vCanvasRef = useRef<HTMLCanvasElement>(null);
  const [, setTick] = useState(0);

  const draw = useCallback(() => {
    const hCanvas = hCanvasRef.current;
    const vCanvas = vCanvasRef.current;
    if (!hCanvas || !vCanvas) return;

    const dpr = window.devicePixelRatio || 1;
    const hCtx = hCanvas.getContext('2d');
    const vCtx = vCanvas.getContext('2d');
    if (!hCtx || !vCtx) return;

    hCanvas.width = (width - rulerSize) * dpr;
    hCanvas.height = rulerSize * dpr;
    hCanvas.style.width = `${width - rulerSize}px`;
    hCanvas.style.height = `${rulerSize}px`;
    hCtx.scale(dpr, dpr);

    vCanvas.width = rulerSize * dpr;
    vCanvas.height = (height - rulerSize) * dpr;
    vCanvas.style.width = `${rulerSize}px`;
    vCanvas.style.height = `${height - rulerSize}px`;
    vCtx.scale(dpr, dpr);

    const bg = '#f0f0f0';
    const fg = '#666';
    const tickColor = '#999';
    const font = '10px Arial';

    const zoom = viewport.zoom;
    const offsetX = viewport.offsetX;
    const offsetY = viewport.offsetY;

    const tickInterval = computeTickInterval(zoom);
    const subTicks = 5;

    // Horizontal ruler
    hCtx.fillStyle = bg;
    hCtx.fillRect(0, 0, width - rulerSize, rulerSize);
    hCtx.strokeStyle = '#ccc';
    hCtx.lineWidth = 1;
    hCtx.beginPath();
    hCtx.moveTo(0, rulerSize - 0.5);
    hCtx.lineTo(width - rulerSize, rulerSize - 0.5);
    hCtx.stroke();

    const canvasStartX = -offsetX / zoom;
    const firstTick = Math.ceil(canvasStartX / tickInterval) * tickInterval;

    for (let canvasX = firstTick; canvasX < canvasStartX + (width - rulerSize) / zoom; canvasX += tickInterval) {
      const screenX = canvasX * zoom + offsetX - rulerSize;
      if (screenX < 0 || screenX > width - rulerSize) continue;

      // Major tick
      hCtx.strokeStyle = tickColor;
      hCtx.beginPath();
      hCtx.moveTo(screenX, rulerSize - 6);
      hCtx.lineTo(screenX, rulerSize);
      hCtx.stroke();

      // Label
      hCtx.fillStyle = fg;
      hCtx.font = font;
      hCtx.textAlign = 'center';
      hCtx.fillText(`${Math.round(canvasX)}`, screenX, rulerSize - 8);

      // Sub ticks
      const subInterval = tickInterval / subTicks;
      for (let s = 1; s < subTicks; s++) {
        const subCanvasX = canvasX + s * subInterval;
        const subScreenX = subCanvasX * zoom + offsetX - rulerSize;
        if (subScreenX < 0 || subScreenX > width - rulerSize) continue;
        hCtx.strokeStyle = '#ccc';
        hCtx.beginPath();
        hCtx.moveTo(subScreenX, rulerSize - 4);
        hCtx.lineTo(subScreenX, rulerSize);
        hCtx.stroke();
      }
    }

    // Vertical ruler
    vCtx.fillStyle = bg;
    vCtx.fillRect(0, 0, rulerSize, height - rulerSize);
    vCtx.strokeStyle = '#ccc';
    vCtx.lineWidth = 1;
    vCtx.beginPath();
    vCtx.moveTo(rulerSize - 0.5, 0);
    vCtx.lineTo(rulerSize - 0.5, height - rulerSize);
    vCtx.stroke();

    const canvasStartY = -offsetY / zoom;
    const firstTickY = Math.ceil(canvasStartY / tickInterval) * tickInterval;

    for (let canvasY = firstTickY; canvasY < canvasStartY + (height - rulerSize) / zoom; canvasY += tickInterval) {
      const screenY = canvasY * zoom + offsetY - rulerSize;
      if (screenY < 0 || screenY > height - rulerSize) continue;

      // Major tick
      vCtx.strokeStyle = tickColor;
      vCtx.beginPath();
      vCtx.moveTo(rulerSize - 6, screenY);
      vCtx.lineTo(rulerSize, screenY);
      vCtx.stroke();

      // Label (rotated)
      vCtx.save();
      vCtx.fillStyle = fg;
      vCtx.font = font;
      vCtx.textAlign = 'center';
      vCtx.translate(rulerSize - 10, screenY);
      vCtx.rotate(-Math.PI / 2);
      vCtx.fillText(`${Math.round(canvasY)}`, 0, 0);
      vCtx.restore();

      // Sub ticks
      const subInterval = tickInterval / subTicks;
      for (let s = 1; s < subTicks; s++) {
        const subCanvasY = canvasY + s * subInterval;
        const subScreenY = subCanvasY * zoom + offsetY - rulerSize;
        if (subScreenY < 0 || subScreenY > height - rulerSize) continue;
        vCtx.strokeStyle = '#ccc';
        vCtx.beginPath();
        vCtx.moveTo(rulerSize - 4, subScreenY);
        vCtx.lineTo(rulerSize, subScreenY);
        vCtx.stroke();
      }
    }

    // Corner box
    hCtx.fillStyle = bg;
    hCtx.fillRect(0, 0, rulerSize, rulerSize);
    hCtx.strokeStyle = '#ccc';
    hCtx.strokeRect(0, 0, rulerSize, rulerSize);
  }, [viewport, width, height, rulerSize]);

  useEffect(() => {
    draw();
  }, [draw, setTick]);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 100);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <canvas
        ref={vCanvasRef}
        className="ruler-v"
        style={{
          position: 'absolute',
          left: 0,
          top: rulerSize,
        }}
      />
      <canvas
        ref={hCanvasRef}
        className="ruler-h"
        style={{
          position: 'absolute',
          left: rulerSize,
          top: 0,
        }}
      />
      <div
        className="ruler-corner"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: rulerSize,
          height: rulerSize,
          background: '#f0f0f0',
          borderRight: '1px solid #ccc',
          borderBottom: '1px solid #ccc',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
