import { onScopeDispose, readonly, ref, watch, type Ref } from 'vue';
import * as Y from 'yjs';

import type { MiniTextEditor } from '@/types/mini-text-editor';
import { MINI_TEXT_EDITOR_DEFAULT_SIZE, MINI_TEXT_EDITOR_MIN_SIZE } from '@/types/mini-text-editor';
import type { BoardPosition, BoardSize } from '@/types/sticky-note';

type YMiniTextEditor = Y.Map<unknown>;

function createMiniTextEditorId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `mini-editor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizePosition(position: BoardPosition): BoardPosition {
  return {
    x: Math.max(0, Math.round(position.x)),
    y: Math.max(0, Math.round(position.y)),
  };
}

function normalizeSize(size: BoardSize): BoardSize {
  return {
    width: Math.max(MINI_TEXT_EDITOR_MIN_SIZE.width, Math.round(size.width)),
    height: Math.max(MINI_TEXT_EDITOR_MIN_SIZE.height, Math.round(size.height)),
  };
}

function toYMiniTextEditor(editor: MiniTextEditor): YMiniTextEditor {
  const yEditor = new Y.Map<unknown>();

  yEditor.set('id', editor.id);
  yEditor.set('contentHtml', editor.contentHtml);
  yEditor.set('position', editor.position);
  yEditor.set('size', editor.size);
  yEditor.set('createdAt', editor.createdAt);
  yEditor.set('updatedAt', editor.updatedAt);

  return yEditor;
}

function fromYMiniTextEditor(yEditor: YMiniTextEditor): MiniTextEditor | null {
  const id = yEditor.get('id');
  const contentHtml = yEditor.get('contentHtml');
  const position = yEditor.get('position');
  const size = yEditor.get('size');
  const createdAt = yEditor.get('createdAt');
  const updatedAt = yEditor.get('updatedAt');

  if (
    typeof id !== 'string' ||
    typeof contentHtml !== 'string' ||
    !isRecord(position) ||
    !isRecord(size) ||
    typeof position.x !== 'number' ||
    typeof position.y !== 'number' ||
    typeof size.width !== 'number' ||
    typeof size.height !== 'number' ||
    typeof createdAt !== 'string' ||
    typeof updatedAt !== 'string'
  ) {
    return null;
  }

  return {
    id,
    contentHtml,
    position: normalizePosition({
      x: position.x,
      y: position.y,
    }),
    size: normalizeSize({
      width: size.width,
      height: size.height,
    }),
    createdAt,
    updatedAt,
  };
}

export function useYjsMiniTextEditors(yDocument: Ref<Y.Doc | null>) {
  const miniTextEditors = ref<MiniTextEditor[]>([]);

  let activeDocument: Y.Doc | null = null;
  let yMiniTextEditors: Y.Array<YMiniTextEditor> | null = null;
  let observeHandler: (() => void) | null = null;

  function syncMiniTextEditors(): void {
    miniTextEditors.value =
      yMiniTextEditors
        ?.toArray()
        .map(fromYMiniTextEditor)
        .filter((editor): editor is MiniTextEditor => editor !== null) ?? [];
  }

  function detachFromDocument(): void {
    if (yMiniTextEditors && observeHandler) {
      yMiniTextEditors.unobserveDeep(observeHandler);
    }

    activeDocument = null;
    yMiniTextEditors = null;
    observeHandler = null;
    miniTextEditors.value = [];
  }

  function attachToDocument(document: Y.Doc | null): void {
    detachFromDocument();

    if (!document) {
      return;
    }

    activeDocument = document;
    yMiniTextEditors = document.getArray<YMiniTextEditor>('mini-text-editors');

    observeHandler = () => {
      syncMiniTextEditors();
    };

    yMiniTextEditors.observeDeep(observeHandler);

    syncMiniTextEditors();
  }

  function findYMiniTextEditor(editorId: string): YMiniTextEditor | null {
    return (
      yMiniTextEditors?.toArray().find((yEditor) => {
        return yEditor.get('id') === editorId;
      }) ?? null
    );
  }

  function createMiniTextEditor(position: BoardPosition): MiniTextEditor | null {
    if (!activeDocument || !yMiniTextEditors) {
      return null;
    }

    const timestamp = new Date().toISOString();

    const editor: MiniTextEditor = {
      id: createMiniTextEditorId(),
      contentHtml: '',
      position: normalizePosition(position),
      size: {
        ...MINI_TEXT_EDITOR_DEFAULT_SIZE,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    activeDocument.transact(() => {
      yMiniTextEditors?.push([toYMiniTextEditor(editor)]);
    });

    return editor;
  }

  function updateMiniTextEditor(
    editorId: string,
    input: Partial<Pick<MiniTextEditor, 'contentHtml' | 'position' | 'size'>>,
  ): MiniTextEditor | null {
    if (!activeDocument) {
      return null;
    }

    const yEditor = findYMiniTextEditor(editorId);
    const currentEditor = yEditor ? fromYMiniTextEditor(yEditor) : null;

    if (!yEditor || !currentEditor) {
      return null;
    }

    const updatedEditor: MiniTextEditor = {
      ...currentEditor,
      contentHtml: input.contentHtml ?? currentEditor.contentHtml,
      position: input.position ? normalizePosition(input.position) : currentEditor.position,
      size: input.size ? normalizeSize(input.size) : currentEditor.size,
      updatedAt: new Date().toISOString(),
    };

    activeDocument.transact(() => {
      yEditor.set('contentHtml', updatedEditor.contentHtml);
      yEditor.set('position', updatedEditor.position);
      yEditor.set('size', updatedEditor.size);
      yEditor.set('updatedAt', updatedEditor.updatedAt);
    });

    return updatedEditor;
  }

  function moveMiniTextEditor(editorId: string, position: BoardPosition): MiniTextEditor | null {
    return updateMiniTextEditor(editorId, {
      position,
    });
  }

  function resizeMiniTextEditor(editorId: string, height: number): MiniTextEditor | null {
    const yEditor = findYMiniTextEditor(editorId);
    const currentEditor = yEditor ? fromYMiniTextEditor(yEditor) : null;

    if (!currentEditor) {
      return null;
    }

    return updateMiniTextEditor(editorId, {
      size: {
        width: currentEditor.size.width,
        height: Math.max(MINI_TEXT_EDITOR_MIN_SIZE.height, Math.round(height)),
      },
    });
  }

  function updateMiniTextEditorContent(
    editorId: string,
    contentHtml: string,
  ): MiniTextEditor | null {
    return updateMiniTextEditor(editorId, {
      contentHtml,
    });
  }

  function deleteMiniTextEditor(editorId: string): boolean {
    if (!activeDocument || !yMiniTextEditors) {
      return false;
    }

    const index = yMiniTextEditors.toArray().findIndex((yEditor) => {
      return yEditor.get('id') === editorId;
    });

    if (index < 0) {
      return false;
    }

    activeDocument.transact(() => {
      yMiniTextEditors?.delete(index, 1);
    });

    return true;
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
    miniTextEditors: readonly(miniTextEditors),
    createMiniTextEditor,
    moveMiniTextEditor,
    resizeMiniTextEditor,
    updateMiniTextEditorContent,
    deleteMiniTextEditor,
  };
}
