import { onScopeDispose, readonly, ref, watch, type Ref } from 'vue';
import * as Y from 'yjs';

import type { CreateDrawingPathInput, DrawingPath, DrawingPoint } from '@/types/drawing';

type YDrawingPath = Y.Map<unknown>;

function createDrawingPathId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `drawing-path-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizePoint(point: DrawingPoint): DrawingPoint {
  return {
    x: Math.max(0, Math.round(point.x)),
    y: Math.max(0, Math.round(point.y)),
  };
}

function normalizeStrokeWidth(width: number): number {
  return Math.min(32, Math.max(1, Math.round(width)));
}

function isDrawingPoint(value: unknown): value is DrawingPoint {
  return isRecord(value) && typeof value.x === 'number' && typeof value.y === 'number';
}

function toYDrawingPath(drawingPath: DrawingPath): YDrawingPath {
  const yDrawingPath = new Y.Map<unknown>();

  yDrawingPath.set('id', drawingPath.id);
  yDrawingPath.set('color', drawingPath.color);
  yDrawingPath.set('width', drawingPath.width);
  yDrawingPath.set('points', drawingPath.points);
  yDrawingPath.set('createdAt', drawingPath.createdAt);

  return yDrawingPath;
}

function fromYDrawingPath(yDrawingPath: YDrawingPath): DrawingPath | null {
  const id = yDrawingPath.get('id');
  const color = yDrawingPath.get('color');
  const width = yDrawingPath.get('width');
  const points = yDrawingPath.get('points');
  const createdAt = yDrawingPath.get('createdAt');

  if (
    typeof id !== 'string' ||
    typeof color !== 'string' ||
    typeof width !== 'number' ||
    !Array.isArray(points) ||
    !points.every(isDrawingPoint) ||
    typeof createdAt !== 'string'
  ) {
    return null;
  }

  return {
    id,
    color,
    width: normalizeStrokeWidth(width),
    points: points.map(normalizePoint),
    createdAt,
  };
}

export function useYjsDrawingPaths(yDocument: Ref<Y.Doc | null>) {
  const drawingPaths = ref<DrawingPath[]>([]);
  const canUndo = ref(false);
  const canRedo = ref(false);

  const localDrawingOrigin = {};

  let activeDocument: Y.Doc | null = null;
  let yDrawingPaths: Y.Array<YDrawingPath> | null = null;
  let undoManager: Y.UndoManager | null = null;
  let observeHandler: (() => void) | null = null;

  function syncDrawingPaths(): void {
    drawingPaths.value =
      yDrawingPaths
        ?.toArray()
        .map(fromYDrawingPath)
        .filter((drawingPath): drawingPath is DrawingPath => drawingPath !== null) ?? [];
  }

  function syncHistoryState(): void {
    canUndo.value = (undoManager?.undoStack.length ?? 0) > 0;
    canRedo.value = (undoManager?.redoStack.length ?? 0) > 0;
  }

  function detachFromDocument(): void {
    if (yDrawingPaths && observeHandler) {
      yDrawingPaths.unobserveDeep(observeHandler);
    }

    undoManager?.destroy();

    activeDocument = null;
    yDrawingPaths = null;
    undoManager = null;
    observeHandler = null;

    drawingPaths.value = [];
    canUndo.value = false;
    canRedo.value = false;
  }

  function attachToDocument(document: Y.Doc | null): void {
    detachFromDocument();

    if (!document) {
      return;
    }

    activeDocument = document;
    yDrawingPaths = document.getArray<YDrawingPath>('drawing-paths');

    observeHandler = () => {
      syncDrawingPaths();
    };

    yDrawingPaths.observeDeep(observeHandler);

    undoManager = new Y.UndoManager(yDrawingPaths, {
      trackedOrigins: new Set([localDrawingOrigin]),
    });

    undoManager.on('stack-item-added', syncHistoryState);
    undoManager.on('stack-item-popped', syncHistoryState);
    undoManager.on('stack-cleared', syncHistoryState);

    syncDrawingPaths();
    syncHistoryState();
  }

  function addDrawingPath(input: CreateDrawingPathInput): DrawingPath | null {
    if (!activeDocument || !yDrawingPaths || input.points.length === 0) {
      return null;
    }

    const drawingPath: DrawingPath = {
      id: createDrawingPathId(),
      color: input.color,
      width: normalizeStrokeWidth(input.width),
      points: input.points.map(normalizePoint),
      createdAt: new Date().toISOString(),
    };

    activeDocument.transact(() => {
      yDrawingPaths?.push([toYDrawingPath(drawingPath)]);
    }, localDrawingOrigin);

    return drawingPath;
  }

  function removeDrawingPath(drawingPathId: string): boolean {
    if (!activeDocument || !yDrawingPaths) {
      return false;
    }

    const index = yDrawingPaths.toArray().findIndex((yDrawingPath) => {
      return yDrawingPath.get('id') === drawingPathId;
    });

    if (index < 0) {
      return false;
    }

    activeDocument.transact(() => {
      yDrawingPaths?.delete(index, 1);
    }, localDrawingOrigin);

    return true;
  }

  function undoDrawingPath(): void {
    undoManager?.undo();

    syncHistoryState();
  }

  function redoDrawingPath(): void {
    undoManager?.redo();

    syncHistoryState();
  }

  function clearDrawingPaths(): void {
    if (!activeDocument || !yDrawingPaths || yDrawingPaths.length === 0) {
      return;
    }

    activeDocument.transact(() => {
      yDrawingPaths?.delete(0, yDrawingPaths.length);
    }, localDrawingOrigin);
  }

  watch(
    yDocument,
    (document) => {
      attachToDocument(document);
    },
    {
      immediate: true,
    },
  );

  onScopeDispose(() => {
    detachFromDocument();
  });

  return {
    drawingPaths: readonly(drawingPaths),
    canUndo: readonly(canUndo),
    canRedo: readonly(canRedo),
    addDrawingPath,
    removeDrawingPath,
    undoDrawingPath,
    redoDrawingPath,
    clearDrawingPaths,
  };
}
