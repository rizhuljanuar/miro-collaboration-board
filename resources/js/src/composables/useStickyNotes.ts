import { readonly, ref } from 'vue';

import type {
    BoardPosition,
    BoardSize,
    StickyNote,
} from '@/types/sticky-note';
import {
    STICKY_NOTE_DEFAULT_SIZE,
    STICKY_NOTE_MIN_SIZE,
} from '@/types/sticky-note';
import type { StickyNoteColor } from '@/types/board';

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

function createStickyNoteId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `sticky-note-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeSize(size: BoardSize): BoardSize {
    return {
        width: Math.max(STICKY_NOTE_MIN_SIZE.width, Math.round(size.width)),
        height: Math.max(STICKY_NOTE_MIN_SIZE.height, Math.round(size.height)),
    };
}

export function useStickyNotes() {
    const stickyNotes = ref<StickyNote[]>([]);

    function createStickyNote(input: CreateStickyNoteInput): StickyNote {
        const timestamp = new Date().toISOString();

        const stickyNote: StickyNote = {
            id: createStickyNoteId(),
            body: input.body ?? '',
            color: input.color,
            position: {
                x: Math.max(0, Math.round(input.position.x)),
                y: Math.max(0, Math.round(input.position.y)),
            },
            size: {
                ...STICKY_NOTE_DEFAULT_SIZE,
            },
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        stickyNotes.value = [...stickyNotes.value, stickyNote];

        return stickyNote;
    }

    function updateStickyNote(
        stickyNoteId: string,
        input: UpdateStickyNoteInput,
    ): StickyNote | null {
        const currentStickyNote = stickyNotes.value.find(
            (stickyNote) => stickyNote.id === stickyNoteId,
        );

        if (!currentStickyNote) {
            return null;
        }

        const updatedStickyNote: StickyNote = {
            ...currentStickyNote,
            body: input.body ?? currentStickyNote.body,
            color: input.color ?? currentStickyNote.color,
            position: input.position
                ? {
                      x: Math.max(0, Math.round(input.position.x)),
                      y: Math.max(0, Math.round(input.position.y)),
                  }
                : currentStickyNote.position,
            size: input.size ? normalizeSize(input.size) : currentStickyNote.size,
            updatedAt: new Date().toISOString(),
        };

        stickyNotes.value = stickyNotes.value.map((stickyNote) => {
            return stickyNote.id === stickyNoteId ? updatedStickyNote : stickyNote;
        });

        return updatedStickyNote;
    }

    function moveStickyNote(
        stickyNoteId: string,
        position: BoardPosition,
    ): StickyNote | null {
        return updateStickyNote(stickyNoteId, {
            position,
        });
    }

    function resizeStickyNote(
        stickyNoteId: string,
        size: BoardSize,
    ): StickyNote | null {
        return updateStickyNote(stickyNoteId, {
            size,
        });
    }

    function updateStickyNoteBody(
        stickyNoteId: string,
        body: string,
    ): StickyNote | null {
        return updateStickyNote(stickyNoteId, {
            body,
        });
    }

    function updateStickyNoteColor(
        stickyNoteId: string,
        color: StickyNoteColor,
    ): StickyNote | null {
        return updateStickyNote(stickyNoteId, {
            color,
        });
    }

    function deleteStickyNote(stickyNoteId: string): boolean {
        const previousLength = stickyNotes.value.length;

        stickyNotes.value = stickyNotes.value.filter((stickyNote) => {
            return stickyNote.id !== stickyNoteId;
        });

        return stickyNotes.value.length < previousLength;
    }

    function clearStickyNotes(): void {
        stickyNotes.value = [];
    }

    return {
        stickyNotes: readonly(stickyNotes),
        createStickyNote,
        updateStickyNote,
        moveStickyNote,
        resizeStickyNote,
        updateStickyNoteBody,
        updateStickyNoteColor,
        deleteStickyNote,
        clearStickyNotes,
    };
}
