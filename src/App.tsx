import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { CanvasView, Viewport, SelectionManager, ConflictHighlighter, SnapManager } from './canvas';
import type { DrawingToolType, CanvasContextMenuEvent } from './canvas';
import {
  ShapeToolbar, ConflictPanel, TextEditor, ImageImportButton, PropertyPanel,
  LayerPanel, PwaPrompt, useKeyboardShortcuts, ContextMenu, Ruler,
  DataPanel, TemplatePanel,
} from './ui';
import type { MenuItem, ContextMenuState, ChartConfig } from './ui';
import { createGeometryAdapter } from './core/geometry';
import { checkLayerCollisions } from './core/collision';
import { useDocumentStore } from './core/store';
import {
  CommandExecutor,
  CreateElementCommand,
  UpdateElementCommand,
  ChangeLayerCommand,
  DeleteElementCommand,
  GroupElementsCommand,
  AlignElementsCommand,
  DistributeElementsCommand,
  MoveElementsCommand,
} from './core/commands';
import type { ElementInput, ElementChanges } from './core/commands';
import type { ElementStyle } from './core/types';
import type { SceneDocument, TextElement } from './core/types';
import { isSupportedImageFile, importImageFromFile } from './io/image-utils';
import { loadSceneFromFile, importProjectFromZip } from './io/importers';
import { saveProject, downloadSvg, downloadRaster } from './io/exporters';
import { parseCSV } from './io/csv-parser';
import type { ParsedData } from './io/csv-parser';
import { generateChart } from './modules/chart';
import type { ChartGenerationConfig } from './modules/chart';
import { instantiateTemplate } from './core/templates';
import {
  registerGeometricTemplates,
  registerFlowchartTemplates,
  registerArchitectureTemplates,
  registerRtlTemplates,
} from './modules';
import {
  getClipboard,
  setClipboard,
  hasClipboard,
  elementToClipboardInput,
  computePastePosition,
} from './core/clipboard';
import exampleScene from '../examples/basic/scene.json';

function findActiveLayerId(scene: SceneDocument): string {
  const visibleUnlocked = [...scene.layers]
    .filter((l) => l.visible && !l.locked)
    .sort((a, b) => b.order - a.order);
  return visibleUnlocked[0]?.id ?? scene.layers[0]?.id ?? '';
}

function App() {
  const scene = useMemo(() => exampleScene as SceneDocument, []);
  const [viewport] = useState(() => new Viewport());
  const [selectionManager] = useState(() => new SelectionManager());
  const [conflictHighlighter] = useState(() => new ConflictHighlighter());
  const [snapManager] = useState(() => new SnapManager());
  const [, setTick] = useState(0);
  const forceUpdate = useCallback(() => setTick((n) => n + 1), []);
  const executorRef = useRef(new CommandExecutor());

  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [activeTool, setActiveTool] = useState<DrawingToolType>('select');
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [showTemplatePanel, setShowTemplatePanel] = useState(false);
  const [showDataPanel, setShowDataPanel] = useState(false);
  const [parsedDataMap, setParsedDataMap] = useState<Map<string, ParsedData>>(new Map());
  const [selectedDataSourceId, setSelectedDataSourceId] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Show a transient status message
  const showStatus = useCallback((msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 2500);
  }, []);

  // Register all templates on mount
  useEffect(() => {
    registerGeometricTemplates();
    registerFlowchartTemplates();
    registerArchitectureTemplates();
    registerRtlTemplates();
  }, []);

  useEffect(() => {
    useDocumentStore.getState().loadScene(scene);
  }, [scene]);

  const storeScene = useDocumentStore((s) => s.scene);
  const currentScene = storeScene ?? scene;

  const drawingLayerId = useMemo(
    () => findActiveLayerId(currentScene),
    [currentScene],
  );

  const editingElement = useMemo(() => {
    if (!editingTextId) return null;
    const el = currentScene.elements.find((e) => e.id === editingTextId);
    if (el && el.type === 'text') return el as TextElement;
    return null;
  }, [editingTextId, currentScene]);

  // ── File operations ────────────────────────────────────────────────────────

  const handleOpenFile = useCallback(async () => {
    const result = await loadSceneFromFile();
    if (result.valid) {
      selectionManager.clearSelection();
      forceUpdate();
      showStatus('Project loaded');
    } else {
      const msg = result.errors.map((e) => e.message).join('\n');
      if (!msg.includes('USER_CANCELLED')) {
        alert('Failed to open file:\n' + msg);
      }
    }
  }, [selectionManager, forceUpdate, showStatus]);

  const handleOpenZip = useCallback(async (file: File) => {
    const result = await importProjectFromZip(file);
    if (result.valid) {
      selectionManager.clearSelection();
      forceUpdate();
      showStatus('ZIP project loaded');
    } else {
      alert('Failed to import ZIP:\n' + result.errors.map((e) => e.message).join('\n'));
    }
  }, [selectionManager, forceUpdate, showStatus]);

  const handleSaveProject = useCallback(async () => {
    const result = await saveProject();
    if (result.valid) {
      showStatus('Project saved');
      forceUpdate();
    } else {
      alert('Save failed:\n' + result.errors.map((e) => e.message).join('\n'));
    }
  }, [forceUpdate, showStatus]);

  const handleExportSVG = useCallback(() => {
    downloadSvg(currentScene, currentScene.project?.name ?? 'export', { region: 'full', margin: 20 });
    showStatus('SVG exported');
  }, [currentScene, showStatus]);

  const handleExportPNG = useCallback(async () => {
    await downloadRaster(currentScene, currentScene.project?.name ?? 'export', { format: 'png', scale: 2, margin: 20 });
    showStatus('PNG exported');
  }, [currentScene, showStatus]);

  // ── Template insert ────────────────────────────────────────────────────────

  const handleTemplateInsert = useCallback(
    (templateId: string) => {
      const activeScene = useDocumentStore.getState().getScene() ?? currentScene;
      const layerId = findActiveLayerId(activeScene);
      // Place at viewport center
      const cx = viewport.screenToCanvas(windowSize.width / 2, windowSize.height / 2);
      try {
        const elements = instantiateTemplate(templateId, { x: cx.x - 60, y: cx.y - 40 }, layerId);
        for (const el of elements) {
          const cmd = new CreateElementCommand(el as ElementInput, 'Insert Template');
          executorRef.current.execute(cmd);
        }
        forceUpdate();
        showStatus(`Template inserted`);
      } catch (err) {
        console.warn('Template insert failed:', err);
      }
    },
    [currentScene, viewport, windowSize, forceUpdate, showStatus],
  );

  // ── Data source ────────────────────────────────────────────────────────────

  const handleSelectDataSource = useCallback(
    async (dataSourceId: string) => {
      setSelectedDataSourceId(dataSourceId);
      const activeScene = useDocumentStore.getState().getScene() ?? currentScene;
      const ds = activeScene.dataSources.find((d) => d.id === dataSourceId);
      if (!ds) return;

      if (parsedDataMap.has(dataSourceId)) return; // already parsed

      setDataLoading(true);
      setDataError(null);

      try {
        if (ds.type === 'csv') {
          // Try to load CSV from the data path (relative to project)
          // For demo, try fetching from public path; fall back to stored data
          const csvPath = `/${ds.path}`;
          const resp = await fetch(csvPath).catch(() => null);
          if (resp && resp.ok) {
            const text = await resp.text();
            const parsed = parseCSV(text);
            setParsedDataMap((m) => new Map(m).set(dataSourceId, parsed));
          } else {
            setDataError(`Cannot load data file: ${ds.path}`);
          }
        } else if (ds.type === 'xlsx' || ds.type === 'xls') {
          // Full bundle: dynamically import parseExcel
          try {
            const { parseExcel } = await import('./io/excel-parser');
            const resp = await fetch(`/${ds.path}`).catch(() => null);
            if (resp && resp.ok) {
              const buf = await resp.arrayBuffer();
              const file = new File([buf], ds.path.split('/').pop() ?? 'data.xlsx');
              const parsed = await parseExcel(file);
              setParsedDataMap((m) => new Map(m).set(dataSourceId, parsed));
            } else {
              setDataError(`Cannot load Excel file: ${ds.path}`);
            }
          } catch {
            setDataError('Excel parsing requires the Full package.');
          }
        }
      } finally {
        setDataLoading(false);
      }
    },
    [currentScene, parsedDataMap],
  );

  const handleGenerateChart = useCallback(
    (config: ChartConfig) => {
      const activeScene = useDocumentStore.getState().getScene() ?? currentScene;
      const parsed = parsedDataMap.get(config.dataSourceId);
      if (!parsed) {
        alert('Please load the data source first.');
        return;
      }
      const layerId = findActiveLayerId(activeScene);
      const chartConfig: ChartGenerationConfig = {
        chartType: config.chartType,
        columnMappings: config.columnMappings,
        title: config.chartType,
        showGrid: true,
        colorScheme: 'default',
        legendPosition: 'bottom',
      };
      const chartEl = generateChart(parsed, chartConfig, config.dataSourceId, layerId);
      const cx = viewport.screenToCanvas(windowSize.width / 2, windowSize.height / 2);
      const input: ElementInput = {
        ...chartEl,
        transform: { ...chartEl.transform, x: cx.x - 300, y: cx.y - 200 },
      };
      const cmd = new CreateElementCommand(input, 'Create Chart');
      const result = executorRef.current.execute(cmd);
      if (result.valid) {
        forceUpdate();
        showStatus('Chart created');
        setShowDataPanel(false);
      } else {
        console.warn('Chart creation failed:', result.errors);
      }
    },
    [currentScene, parsedDataMap, viewport, windowSize, forceUpdate, showStatus],
  );

  // ── Element move ───────────────────────────────────────────────────────────

  const handleElementMove = useCallback(
    (elementIds: string[], delta: { dx: number; dy: number }) => {
      const cmd = new MoveElementsCommand(elementIds, delta);
      const result = executorRef.current.execute(cmd);
      if (!result.valid) {
        console.warn('Move failed:', result.errors.map((e) => e.message).join('\n'));
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleDrawComplete = useCallback(
    (input: ElementInput) => {
      const cmd = new CreateElementCommand(input);
      const result = executorRef.current.execute(cmd);
      if (!result.valid) {
        const errs = result.errors.map((e) => e.message).join('\n');
        console.warn('Draw failed:', errs);
        forceUpdate();
        return;
      }
      forceUpdate();
      if (input.type === 'text') {
        setEditingTextId(cmd.getElementId());
      }
    },
    [forceUpdate],
  );

  const handleTextEditRequest = useCallback((elementId: string) => {
    setActiveTool('select');
    selectionManager.select(elementId);
    setEditingTextId(elementId);
    forceUpdate();
  }, [selectionManager, forceUpdate]);

  const handleTextCommit = useCallback(
    (elementId: string, changes: {
      text: string;
      style?: Partial<ElementStyle>;
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
    }) => {
      const cmd = new UpdateElementCommand(elementId, changes);
      executorRef.current.execute(cmd);
      setEditingTextId(null);
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleTextCancel = useCallback(() => {
    setEditingTextId(null);
    forceUpdate();
  }, [forceUpdate]);

  const handleConnectorRouteChange = useCallback(
    (connectorId: string, routePoints: { x: number; y: number }[]) => {
      const sc = useDocumentStore.getState().getScene();
      if (!sc) return;
      const conn = sc.elements.find((e) => e.type === 'connector' && e.id === connectorId);
      if (conn && conn.type === 'connector') {
        const updated = { ...conn, route: { ...conn.route, points: routePoints } };
        const replaceCmd = {
          id: `bend-${Date.now()}`,
          label: 'Move bend point',
          validate: () => ({ valid: true, errors: [] }),
          execute: (s: SceneDocument) => ({
            ...s,
            elements: s.elements.map((e) => (e.id === connectorId ? updated : e)),
          }),
          invert: () => null,
        };
        executorRef.current.execute(replaceCmd);
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const [isDragOver, setIsDragOver] = useState(false);

  const handleImageImport = useCallback(
    (input: ElementInput) => {
      const cmd = new CreateElementCommand(input);
      const result = executorRef.current.execute(cmd);
      if (!result.valid) {
        console.warn('Image import failed:', result.errors.map((e) => e.message).join('\n'));
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;
    if (clientX <= rect.left || clientX >= rect.right || clientY <= rect.top || clientY >= rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // ZIP files open as project
        if (file.name.endsWith('.zip')) {
          await handleOpenZip(file);
          return;
        }
        if (!isSupportedImageFile(file)) continue;
        try {
          const input = await importImageFromFile(file, drawingLayerId);
          const cmd = new CreateElementCommand(input);
          executorRef.current.execute(cmd);
        } catch (err) {
          console.warn('Drag-drop image import failed:', err);
        }
      }
      forceUpdate();
    },
    [drawingLayerId, forceUpdate, handleOpenZip],
  );

  const handleToolChange = useCallback((tool: DrawingToolType) => {
    setActiveTool(tool);
    setEditingTextId(null);
    selectionManager.clearSelection();
    forceUpdate();
  }, [selectionManager, forceUpdate]);

  const handlePropertyChange = useCallback(
    (elementIds: string[], changes: Record<string, unknown>) => {
      for (const elementId of elementIds) {
        const cmd = new UpdateElementCommand(elementId, changes as ElementChanges);
        const result = executorRef.current.execute(cmd);
        if (!result.valid) {
          console.warn('Property change failed:', result.errors.map((e) => e.message).join('\n'));
        }
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleLayerChange = useCallback(
    (elementIds: string[], targetLayerId: string) => {
      const cmd = new ChangeLayerCommand(elementIds, targetLayerId);
      const result = executorRef.current.execute(cmd);
      if (!result.valid) {
        console.warn('Layer change failed:', result.errors.map((e) => e.message).join('\n'));
      }
      forceUpdate();
    },
    [forceUpdate],
  );

  const checkConflicts = useCallback(() => {
    const adapter = createGeometryAdapter();
    const conflictsByLayer = new Map<string, typeof currentScene.elements>();
    for (const el of currentScene.elements) {
      const list = conflictsByLayer.get(el.layerId);
      if (list) list.push(el);
      else conflictsByLayer.set(el.layerId, [el]);
    }
    const allCollisions = [];
    for (const [, elements] of conflictsByLayer) {
      const result = checkLayerCollisions(elements, adapter, {
        skipHidden: !currentScene.rules.hiddenElementsCollide,
      });
      allCollisions.push(...result.collisions);
    }
    conflictHighlighter.setCollisions(allCollisions, currentScene.elements, currentScene.layers);
  }, [currentScene, conflictHighlighter]);

  useEffect(() => { checkConflicts(); }, [checkConflicts]);

  useKeyboardShortcuts({
    executorRef,
    selectionManager,
    forceUpdate,
    activeLayerId: drawingLayerId,
  });

  const [contextMenuState, setContextMenuState] = useState<ContextMenuState | null>(null);

  const handleCanvasContextMenu = useCallback(
    (event: CanvasContextMenuEvent) => {
      const sc = useDocumentStore.getState().getScene();
      if (!sc) return;
      const selectedIds = selectionManager.selectedIds;
      const clickedElement = event.elementId;
      const items: MenuItem[] = [];

      if (!clickedElement) {
        items.push(
          { label: 'Select All', action: () => { selectionManager.selectAll(sc); forceUpdate(); } },
          { label: 'Paste', action: () => handlePaste(), disabled: !hasClipboard(), shortcut: 'Ctrl+V' },
          { separator: true },
          { label: 'Fit to Canvas', action: () => handleFitToCanvas() },
          { separator: true },
          { label: 'Zoom In', action: () => { viewport.zoomIn(); forceUpdate(); }, shortcut: 'Ctrl+=' },
          { label: 'Zoom Out', action: () => { viewport.zoomOut(); forceUpdate(); }, shortcut: 'Ctrl+-' },
          { label: 'Reset Zoom', action: () => { viewport.reset(); forceUpdate(); }, shortcut: 'Ctrl+0' },
        );
      } else {
        const effectiveSelectedIds = selectedIds.size > 0 ? [...selectedIds] : [clickedElement];
        const isMulti = effectiveSelectedIds.length > 1;

        items.push(
          { label: 'Copy', action: () => handleCopy(effectiveSelectedIds), shortcut: 'Ctrl+C' },
          { label: 'Cut', action: () => handleCut(effectiveSelectedIds), shortcut: 'Ctrl+X' },
          { label: 'Delete', action: () => handleDelete(effectiveSelectedIds), shortcut: 'Del' },
          { separator: true },
        );

        const visibleLayers = sc.layers.filter((l) => l.visible && !l.locked).sort((a, b) => b.order - a.order);
        if (visibleLayers.length > 1) {
          items.push({
            label: 'Change Layer',
            children: visibleLayers.map((l) => ({
              label: l.name || l.id,
              action: () => handleChangeLayer(effectiveSelectedIds, l.id),
            })),
          });
        }

        if (isMulti) {
          items.push({ label: 'Group', action: () => handleGroup(effectiveSelectedIds), shortcut: 'Ctrl+G' });
          items.push({
            label: 'Align',
            children: (['left', 'centerHorizontal', 'right', 'top', 'centerVertical', 'bottom', 'center'] as const).map((a) => ({
              label: a.charAt(0).toUpperCase() + a.slice(1).replace(/([A-Z])/g, ' $1'),
              action: () => handleAlign(effectiveSelectedIds, a),
            })),
          });
        }

        if (effectiveSelectedIds.length >= 3) {
          items.push({
            label: 'Distribute',
            children: [
              { label: 'Horizontal', action: () => handleDistribute(effectiveSelectedIds, 'horizontal') },
              { label: 'Vertical', action: () => handleDistribute(effectiveSelectedIds, 'vertical') },
            ],
          });
        }
      }

      setContextMenuState({ x: event.x, y: event.y, items });
    },
    [selectionManager, forceUpdate, viewport],
  );

  const handleCopy = useCallback((elementIds: string[]) => {
    const sc = useDocumentStore.getState().getScene();
    if (!sc) return;
    const items = elementIds
      .map((id) => sc.elements.find((el) => el.id === id))
      .filter((el): el is NonNullable<typeof el> => !!el)
      .map((el) => elementToClipboardInput(el));
    setClipboard(items);
  }, []);

  const handleCut = useCallback((elementIds: string[]) => {
    const sc = useDocumentStore.getState().getScene();
    if (!sc) return;
    const items = elementIds
      .map((id) => sc.elements.find((el) => el.id === id))
      .filter((el): el is NonNullable<typeof el> => !!el)
      .map((el) => elementToClipboardInput(el));
    setClipboard(items);
    executorRef.current.execute(new DeleteElementCommand(elementIds, 'unbind'));
    selectionManager.clearSelection();
    forceUpdate();
  }, [selectionManager, forceUpdate]);

  const handlePaste = useCallback(() => {
    const cb = getClipboard();
    if (cb.length === 0) return;
    const sc = useDocumentStore.getState().getScene();
    if (!sc) return;
    const selectedIds = selectionManager.selectedIds;
    let centerX = 400, centerY = 300;
    if (selectedIds.size > 0) {
      let sumX = 0, sumY = 0, count = 0;
      for (const el of sc.elements) {
        if (selectedIds.has(el.id)) {
          sumX += el.transform.x + el.transform.width / 2;
          sumY += el.transform.y + el.transform.height / 2;
          count++;
        }
      }
      if (count > 0) { centerX = sumX / count; centerY = sumY / count; }
    }
    const base = computePastePosition({ x: centerX, y: centerY });
    if (cb.length === 1) {
      executorRef.current.execute(new CreateElementCommand({ ...cb[0], layerId: drawingLayerId, transform: { ...cb[0].transform, x: base.x, y: base.y } }, 'Paste'));
    } else {
      let clipCX = 0, clipCY = 0;
      for (const c of cb) { clipCX += c.transform.x + c.transform.width / 2; clipCY += c.transform.y + c.transform.height / 2; }
      clipCX /= cb.length; clipCY /= cb.length;
      for (const item of cb) {
        const dx = item.transform.x + item.transform.width / 2 - clipCX;
        const dy = item.transform.y + item.transform.height / 2 - clipCY;
        executorRef.current.execute(new CreateElementCommand({ ...item, layerId: drawingLayerId, transform: { ...item.transform, x: base.x + dx, y: base.y + dy } }, 'Paste'));
      }
    }
    forceUpdate();
  }, [drawingLayerId, selectionManager, forceUpdate]);

  const handleDelete = useCallback((elementIds: string[]) => {
    if (elementIds.length === 0) return;
    executorRef.current.execute(new DeleteElementCommand(elementIds, 'unbind'));
    selectionManager.clearSelection();
    forceUpdate();
  }, [selectionManager, forceUpdate]);

  const handleChangeLayer = useCallback((elementIds: string[], targetLayerId: string) => {
    const cmd = new ChangeLayerCommand(elementIds, targetLayerId);
    const result = executorRef.current.execute(cmd);
    if (!result.valid) console.warn('Layer change failed:', result.errors.map((e) => e.message).join('\n'));
    forceUpdate();
  }, [forceUpdate]);

  const handleGroup = useCallback((elementIds: string[]) => {
    if (elementIds.length < 2) return;
    executorRef.current.execute(new GroupElementsCommand(elementIds, `Group ${Date.now()}`));
    forceUpdate();
  }, [forceUpdate]);

  const handleAlign = useCallback(
    (elementIds: string[], alignType: 'left' | 'right' | 'top' | 'bottom' | 'centerHorizontal' | 'centerVertical' | 'center') => {
      const result = executorRef.current.execute(new AlignElementsCommand(elementIds, alignType));
      if (!result.valid) console.warn('Align failed:', result.errors.map((e) => e.message).join('\n'));
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleDistribute = useCallback(
    (elementIds: string[], distType: 'horizontal' | 'vertical' | 'circular') => {
      const result = executorRef.current.execute(new DistributeElementsCommand(elementIds, distType));
      if (!result.valid) console.warn('Distribute failed:', result.errors.map((e) => e.message).join('\n'));
      forceUpdate();
    },
    [forceUpdate],
  );

  const handleFitToCanvas = useCallback(() => {
    if (currentScene.elements.length === 0) return;
    const geometryAdapter = createGeometryAdapter();
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of currentScene.elements) {
      const bbox = geometryAdapter.getBBox(el);
      if (bbox.x < minX) minX = bbox.x;
      if (bbox.y < minY) minY = bbox.y;
      if (bbox.x + bbox.width > maxX) maxX = bbox.x + bbox.width;
      if (bbox.y + bbox.height > maxY) maxY = bbox.y + bbox.height;
    }
    if (minX === Infinity) return;
    const sGroup = document.querySelector('svg');
    const containerW = sGroup?.clientWidth || window.innerWidth;
    const containerH = sGroup?.clientHeight || window.innerHeight;
    viewport.fitToRect({ x: minX, y: minY, width: maxX - minX, height: maxY - minY }, containerW, containerH);
    forceUpdate();
  }, [currentScene, viewport, forceUpdate]);

  const handleCloseContextMenu = useCallback(() => setContextMenuState(null), []);

  // Undo/Redo state for toolbar display
  const canUndo = executorRef.current.canUndo();
  const canRedo = executorRef.current.canRedo();

  const isDirty = useDocumentStore((s) => s.isDirty);

  return (
    <div className="app-container" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
      {isDragOver && (
        <div className="drop-overlay">
          <div className="drop-message">Drop images or ZIP projects here</div>
        </div>
      )}

      {/* ── Top Toolbar ── */}
      <div className="top-toolbar">
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={handleOpenFile} title="Open JSON project (Ctrl+O)">📂 Open</button>
          <button className="toolbar-btn" onClick={handleSaveProject} title="Save project (Ctrl+S)">
            💾 Save{isDirty ? ' *' : ''}
          </button>
        </div>
        <div className="toolbar-group">
          <button className="toolbar-btn" onClick={handleExportSVG} title="Export as SVG">⬇ SVG</button>
          <button className="toolbar-btn" onClick={handleExportPNG} title="Export as PNG (2×)">⬇ PNG</button>
        </div>
        <div className="toolbar-group">
          <button
            className={`toolbar-btn${canUndo ? '' : ' disabled'}`}
            onClick={() => { executorRef.current.undo(); forceUpdate(); }}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >↩ Undo</button>
          <button
            className={`toolbar-btn${canRedo ? '' : ' disabled'}`}
            onClick={() => { executorRef.current.redo(); forceUpdate(); }}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >↪ Redo</button>
        </div>
        <div className="toolbar-group">
          <button
            className={`toolbar-btn${showTemplatePanel ? ' active' : ''}`}
            onClick={() => setShowTemplatePanel((v) => !v)}
            title="Toggle template panel"
          >📋 Templates</button>
          <button
            className={`toolbar-btn${showDataPanel ? ' active' : ''}`}
            onClick={() => setShowDataPanel((v) => !v)}
            title="Toggle data & chart panel"
          >📊 Data</button>
        </div>
        <div className="toolbar-spacer" />
        <div className="toolbar-project-name">
          {currentScene.project?.name ?? 'Untitled'}
        </div>
      </div>

      {/* ── Canvas ── */}
      <CanvasView
        scene={currentScene}
        viewport={viewport}
        selectionManager={selectionManager}
        conflictHighlighter={conflictHighlighter}
        snapManager={snapManager}
        onViewportChange={forceUpdate}
        onSelectionChange={forceUpdate}
        activeTool={activeTool}
        drawingLayerId={drawingLayerId}
        onDrawComplete={handleDrawComplete}
        onTextEditRequest={handleTextEditRequest}
        onConnectorRouteChange={handleConnectorRouteChange}
        onContextMenu={handleCanvasContextMenu}
        onElementMove={handleElementMove}
      />

      <Ruler viewport={viewport} width={windowSize.width} height={windowSize.height} />
      <ShapeToolbar activeTool={activeTool} onToolChange={handleToolChange} />
      <ImageImportButton layerId={drawingLayerId} onImport={handleImageImport} />

      <LayerPanel
        scene={currentScene}
        selectionManager={selectionManager}
        conflictHighlighter={conflictHighlighter}
        executor={executorRef.current}
        forceUpdate={forceUpdate}
      />
      <ConflictPanel conflictHighlighter={conflictHighlighter} />
      <PropertyPanel
        scene={currentScene}
        selectionManager={selectionManager}
        onPropertyChange={handlePropertyChange}
        onLayerChange={handleLayerChange}
        parsedDataMap={parsedDataMap}
      />

      {editingElement && (
        <TextEditor
          element={editingElement}
          viewport={viewport}
          onCommit={handleTextCommit}
          onCancel={handleTextCancel}
        />
      )}

      {/* ── Template Panel ── */}
      {showTemplatePanel && (
        <TemplatePanel onTemplateInsert={handleTemplateInsert} />
      )}

      {/* ── Data Panel ── */}
      {showDataPanel && (
        <DataPanel
          dataSources={currentScene.dataSources}
          parsedData={selectedDataSourceId ? (parsedDataMap.get(selectedDataSourceId) ?? null) : null}
          loading={dataLoading}
          parseError={dataError}
          onSelectDataSource={handleSelectDataSource}
          onGenerateChart={handleGenerateChart}
        />
      )}

      {/* ── Status toast ── */}
      {statusMessage && (
        <div className="status-toast">{statusMessage}</div>
      )}

      <PwaPrompt />
      <ContextMenu state={contextMenuState} onClose={handleCloseContextMenu} />
    </div>
  );
}

export default App;
