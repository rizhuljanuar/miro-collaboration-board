import { readonly, ref } from 'vue';

import type {
    MiniTextEditor,
} from '@/types/mini-text-editor';
import {
    MINI_TEXT_EDITOR_DEFAULT_SIZE,
    MINI_TEXT_EDITOR_MIN_SIZE,
} from '@/types/mini-text-editor';
import type { BoardPosition } from '@/types/sticky-note';

function createMiniTextEditorId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    return `mini-editor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useMiniTextEditors() {
    const miniTextEditors = ref<MiniTextEditor[]>([]);

    function createMiniTextEditor(position: BoardPosition): MiniTextEditor {
        const timestamp = new Date().toISOString();

        const editor: MiniTextEditor = {
            id: createMiniTextEditorId(),
            contentHtml: '',
            position: {
                x: Math.max(0, Math.round(position.x)),
                y: Math.max(0, Math.round(position.y)),
            },
            size: {
                ...MINI_TEXT_EDITOR_DEFAULT_SIZE,
            },
            createdAt: timestamp,
            updatedAt: timestamp,
        };

        miniTextEditors.value = [...miniTextEditors.value, editor];

        return editor;
    }

    function moveMiniTextEditor(
        editorId: string,
        position: BoardPosition,
    ): MiniTextEditor | null {
        const currentEditor = miniTextEditors.value.find((editor) => editor.id === editorId);

        if (!currentEditor) {
            return null;
        }

        const updatedEditor: MiniTextEditor = {
            ...currentEditor,
            position: {
                x: Math.max(0, Math.round(position.x)),
                y: Math.max(0, Math.round(position.y)),
            },
            updatedAt: new Date().toISOString(),
        };

        miniTextEditors.value = miniTextEditors.value.map((editor) => {
            return editor.id === editorId ? updatedEditor : editor;
        });

        return updatedEditor;
    }

    function resizeMiniTextEditor(
        editorId: string,
        height: number,
    ): MiniTextEditor | null {
        const currentEditor = miniTextEditors.value.find((editor) => editor.id === editorId);

        if (!currentEditor) {
            return null;
        }

        const updatedEditor: MiniTextEditor = {
            ...currentEditor,
            size: {
                width: currentEditor.size.width,
                height: Math.max(MINI_TEXT_EDITOR_MIN_SIZE.height, Math.round(height)),
            },
            updatedAt: new Date().toISOString(),
        };

        miniTextEditors.value = miniTextEditors.value.map((editor) => {
            return editor.id === editorId ? updatedEditor : editor;
        });

        return updatedEditor;
    }

    function deleteMiniTextEditor(editorId: string): boolean {
        const previousLength = miniTextEditors.value.length;

        miniTextEditors.value = miniTextEditors.value.filter((editor) => {
            return editor.id !== editorId;
        });

        return miniTextEditors.value.length < previousLength;
    }

    return {
        miniTextEditors: readonly(miniTextEditors),
        createMiniTextEditor,
        moveMiniTextEditor,
        resizeMiniTextEditor,
        deleteMiniTextEditor,
    };
}
