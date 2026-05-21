/**
 * Manages layout Web Worker lifecycle and communication.
 * Provides a simple promise-based API for offloading layout computation
 * off the main thread.
 */

import type { LayoutNode, LayoutEdge, LayoutOptions, LayoutNodeResult, LayoutEdgeResult, BBox } from '../core/types';

interface LayoutResponse {
  id: string;
  nodes: LayoutNodeResult[];
  edges: LayoutEdgeResult[];
  totalBBox: BBox;
  error?: string;
}

type PendingRequest = {
  resolve: (result: LayoutResponse) => void;
  reject: (error: Error) => void;
};

let workerInstance: Worker | null = null;
let requestIdCounter = 0;
const pendingRequests = new Map<string, PendingRequest>();

function getWorker(): Worker {
  if (!workerInstance) {
    try {
      workerInstance = new Worker(
        new URL('./layout.worker.ts', import.meta.url),
        { type: 'module' },
      );
      workerInstance.onmessage = (e: MessageEvent<LayoutResponse>) => {
        const { id, nodes, edges, totalBBox, error } = e.data;
        const pending = pendingRequests.get(id);
        if (pending) {
          pendingRequests.delete(id);
          if (error) {
            pending.reject(new Error(error));
          } else {
            pending.resolve({ id, nodes, edges, totalBBox });
          }
        }
      };
      workerInstance.onerror = (err) => {
        for (const [id, pending] of pendingRequests) {
          pending.reject(new Error(err.message || 'Layout worker error'));
        }
        pendingRequests.clear();
      };
    } catch {
      return null!;
    }
  }
  return workerInstance;
}

export function computeLayoutInWorker(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  options?: LayoutOptions,
): Promise<{ nodes: LayoutNodeResult[]; edges: LayoutEdgeResult[]; totalBBox: BBox }> {
  const worker = getWorker();
  if (!worker) {
    return Promise.reject(new Error('Web Worker is not available'));
  }

  return new Promise((resolve, reject) => {
    const id = `layout-${++requestIdCounter}`;
    pendingRequests.set(id, { resolve, reject });
    worker.postMessage({ id, nodes, edges, options: options ?? {} });
  });
}

export function terminateLayoutWorker(): void {
  if (workerInstance) {
    workerInstance.terminate();
    workerInstance = null;
    pendingRequests.clear();
  }
}
