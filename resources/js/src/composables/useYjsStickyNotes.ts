import { onScopeDispose, readonly, ref, watch, type Ref } from 'vue';
import * as Y from 'yjs';

import { STICKY_NOTE_COLOR_OPTIONS, type StickyNoteColor } from '@/types/board';
import type { BoardPosition, BoardSize, StickyNote } from '@/types/sticky-note';
import { STICKY_NOTE_DEFAULT_SIZE, STICKY_NOTE_MIN_SIZE } from '@/types/sticky-note';

interface CreateStickyNoteInput {
  position: BoardPosition;
  color: StickyNoteColor;
  body?: string;
}

interface UpdateStickyNoteInput {
  body?: string;
  color?: StickyNoteColor;
  position?: BoardPosition;
  size?: BoardSize;
}

type YStickyNote = Y.Map<unknown>;

function createStickyNoteId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `sticky-note-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
    width: Math.max(STICKY_NOTE_MIN_SIZE.width, Math.round(size.width)),
    height: Math.max(STICKY_NOTE_MIN_SIZE.height, Math.round(size.height)),
  };
}

function isStickyNoteColor(value: unknown): value is StickyNoteColor {
  return STICKY_NOTE_COLOR_OPTIONS.some((color) => color.value === value);
}

function toYStickyNote(stickyNote: StickyNote): YStickyNote {
  const yStickyNote = new Y.Map<unknown>();

  yStickyNote.set('id', stickyNote.id);
  yStickyNote.set('body', stickyNote.body);
  yStickyNote.set('color', stickyNote.color);
  yStickyNote.set('position', stickyNote.position);
  yStickyNote.set('size', stickyNote.size);
  yStickyNote.set('createdAt', stickyNote.createdAt);
  yStickyNote.set('updatedAt', stickyNote.updatedAt);

  return yStickyNote;
}

function fromYStickyNote(yStickyNote: YStickyNote): StickyNote | null {
  const id = yStickyNote.get('id');
  const body = yStickyNote.get('body');
  const color = yStickyNote.get('color');
  const position = yStickyNote.get('position');
  const size = yStickyNote.get('size');
  const createdAt = yStickyNote.get('createdAt');
  const updatedAt = yStickyNote.get('updatedAt');

  if (
    typeof id !== 'string' ||
    typeof body !== 'string' ||
    !isStickyNoteColor(color) ||
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
    body,
    color,
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

export function useYjsStickyNotes(yDocument: Ref<Y.Doc | null>) {
  const stickyNotes = ref<StickyNote[]>([]);

  let activeDocument: Y.Doc | null = null;
  let yStickyNotes: Y.Array<YStickyNote> | null = null;
  let observeHandler: (() => void) | null = null;

  function syncStickyNotes(): void {
    stickyNotes.value =
      yStickyNotes
        ?.toArray()
        .map(fromYStickyNote)
        .filter((stickyNote): stickyNote is StickyNote => stickyNote !== null) ?? [];
  }

  function detachFromDocument(): void {
    if (yStickyNotes && observeHandler) {
      yStickyNotes.unobserveDeep(observeHandler);
    }

    activeDocument = null;
    yStickyNotes = null;
    observeHandler = null;
    stickyNotes.value = [];
  }

  function attachToDocument(document: Y.Doc | null): void {
    detachFromDocument();

    if (!document) {
      return;
    }

    activeDocument = document;
    yStickyNotes = document.getArray<YStickyNote>('sticky-notes');

    observeHandler = () => {
      syncStickyNotes();
    };

    yStickyNotes.observeDeep(observeHandler);

    syncStickyNotes();
  }

  function findYStickyNote(stickyNoteId: string): YStickyNote | null {
    return (
      yStickyNotes?.toArray().find((yStickyNote) => {
        return yStickyNote.get('id') === stickyNoteId;
      }) ?? null
    );
  }

  function createStickyNote(input: CreateStickyNoteInput): StickyNote | null {
    if (!activeDocument || !yStickyNotes) {
      return null;
    }

    const timestamp = new Date().toISOString();

    const stickyNote: StickyNote = {
      id: createStickyNoteId(),
      body: input.body ?? '',
      color: input.color,
      position: normalizePosition(input.position),
      size: {
        ...STICKY_NOTE_DEFAULT_SIZE,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    activeDocument.transact(() => {
      yStickyNotes?.push([toYStickyNote(stickyNote)]);
    });

    return stickyNote;
  }

  function updateStickyNote(stickyNoteId: string, input: UpdateStickyNoteInput): StickyNote | null {
    if (!activeDocument) {
      return null;
    }

    const yStickyNote = findYStickyNote(stickyNoteId);
    const currentStickyNote = yStickyNote ? fromYStickyNote(yStickyNote) : null;

    if (!yStickyNote || !currentStickyNote) {
      return null;
    }

    const updatedStickyNote: StickyNote = {
      ...currentStickyNote,
      body: input.body ?? currentStickyNote.body,
      color: input.color ?? currentStickyNote.color,
      position: input.position ? normalizePosition(input.position) : currentStickyNote.position,
      size: input.size ? normalizeSize(input.size) : currentStickyNote.size,
      updatedAt: new Date().toISOString(),
    };

    activeDocument.transact(() => {
      yStickyNote.set('body', updatedStickyNote.body);
      yStickyNote.set('color', updatedStickyNote.color);
      yStickyNote.set('position', updatedStickyNote.position);
      yStickyNote.set('size', updatedStickyNote.size);
      yStickyNote.set('updatedAt', updatedStickyNote.updatedAt);
    });

    return updatedStickyNote;
  }

  function moveStickyNote(stickyNoteId: string, position: BoardPosition): StickyNote | null {
    return updateStickyNote(stickyNoteId, {
      position,
    });
  }

  function resizeStickyNote(stickyNoteId: string, size: BoardSize): StickyNote | null {
    return updateStickyNote(stickyNoteId, {
      size,
    });
  }

  function updateStickyNoteBody(stickyNoteId: string, body: string): StickyNote | null {
    return updateStickyNote(stickyNoteId, {
      body,
    });
  }

  function updateStickyNoteColor(stickyNoteId: string, color: StickyNoteColor): StickyNote | null {
    return updateStickyNote(stickyNoteId, {
      color,
    });
  }

  function deleteStickyNote(stickyNoteId: string): boolean {
    if (!activeDocument || !yStickyNotes) {
      return false;
    }

    const index = yStickyNotes.toArray().findIndex((yStickyNote) => {
      return yStickyNote.get('id') === stickyNoteId;
    });

    if (index < 0) {
      return false;
    }

    activeDocument.transact(() => {
      yStickyNotes?.delete(index, 1);
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
    stickyNotes: readonly(stickyNotes),
    createStickyNote,
    updateStickyNote,
    moveStickyNote,
    resizeStickyNote,
    updateStickyNoteBody,
    updateStickyNoteColor,
    deleteStickyNote,
  };
}
