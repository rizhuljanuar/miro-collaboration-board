import { computed, ref } from 'vue';

import type { CreateDrawingPathInput, DrawingPath, DrawingPoint } from '@/types/drawing';

function createDrawingPathId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `drawing-path-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

export function useDrawingPaths() {
  const drawingPaths = ref<DrawingPath[]>([]);

  function addDrawingPath(input: CreateDrawingPathInput): DrawingPath | null {
    if (input.points.length === 0) {
      return null;
    }

    const drawingPath: DrawingPath = {
      id: createDrawingPathId(),
      color: input.color,
      width: normalizeStrokeWidth(input.width),
      points: input.points.map(normalizePoint),
      createdAt: new Date().toISOString(),
    };

    drawingPaths.value = [...drawingPaths.value, drawingPath];

    return drawingPath;
  }

  function removeDrawingPath(drawingPathId: string): boolean {
    const previousLength = drawingPaths.value.length;

    drawingPaths.value = drawingPaths.value.filter((drawingPath) => {
      return drawingPath.id !== drawingPathId;
    });

    return drawingPaths.value.length < previousLength;
  }

  function clearDrawingPaths(): void {
    drawingPaths.value = [];
  }

  return {
    drawingPaths: computed((): readonly DrawingPath[] => drawingPaths.value),
    addDrawingPath,
    removeDrawingPath,
    clearDrawingPaths,
  };
}
