<script setup lang='ts'>
import { computed, onBeforeUnmount, ref } from 'vue';

import type { MiniTextEditor } from '@/types/mini-text-editor';
import type { BoardPosition } from '@/types/sticky-note';

const props = defineProps<{
    editor: MiniTextEditor;
    canEdit: boolean;
}>();

const emit = defineEmits<{
    move: [payload: { id: string; position: BoardPosition }];
    resize: [payload: { id: string; height: number }];
    delete: [editorId: string];
}>();

interface DragState {
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPosition: BoardPosition;
}

interface ResizeState {
    pointerId: number;
    startClientY: number;
    startHeight: number;
}

const dragHandle = ref<HTMLElement | null>(null);
const resizeHandle = ref<HTMLElement | null>(null);

const dragState = ref<DragState | null>(null);
const resizeState = ref<ResizeState | null>(null);

const editorStyle = computed(() => {
    return {
        left: `${props.editor.position.x}px`,
        top: `${props.editor.position.y}px`,
        width: `${props.editor.size.width}px`,
        height: `${props.editor.size.height}px`,
    };
});

function startDrag(event: PointerEvent): void {
    if (!props.canEdit || event.button !== 0 || resizeState.value) {
        return;
    }

    const handle = event.currentTarget;

    if (!(handle instanceof HTMLElement)) {
        return;
    }

    event.preventDefault();

    dragState.value = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startPosition: {
            ...props.editor.position,
        },
    };

    handle.setPointerCapture(event.pointerId);
}

function dragEditor(event: PointerEvent): void {
    const currentDrag = dragState.value;

    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
        return;
    }

    emit('move', {
        id: props.editor.id,
        position: {
            x: Math.max(
                0,
                Math.round(
                    currentDrag.startPosition.x + (event.clientX - currentDrag.startClientX),
                ),
            ),
            y: Math.max(
                0,
                Math.round(
                    currentDrag.startPosition.y + (event.clientY - currentDrag.startClientY),
                ),
            ),
        },
    });
}

function stopDrag(event: PointerEvent): void {
    if (dragState.value?.pointerId !== event.pointerId) {
        return;
    }

    if (dragHandle.value?.hasPointerCapture(event.pointerId)) {
        dragHandle.value.releasePointerCapture(event.pointerId);
    }

    dragState.value = null;
}

function startResize(event: PointerEvent): void {
    if (!props.canEdit || event.button !== 0 || dragState.value) {
        return;
    }

    const handle = event.currentTarget;

    if (!(handle instanceof HTMLElement)) {
        return;
    }

    event.preventDefault();

    resizeState.value = {
        pointerId: event.pointerId,
        startClientY: event.clientY,
        startHeight: props.editor.size.height,
    };

    handle.setPointerCapture(event.pointerId);
}

function resizeEditor(event: PointerEvent): void {
    const currentResize = resizeState.value;

    if (!currentResize || currentResize.pointerId !== event.pointerId) {
        return;
    }

    emit('resize', {
        id: props.editor.id,
        height: Math.round(
            currentResize.startHeight + (event.clientY - currentResize.startClientY),
        ),
    });
}

function stopResize(event: PointerEvent): void {
    if (resizeState.value?.pointerId !== event.pointerId) {
        return;
    }

    if (resizeHandle.value?.hasPointerCapture(event.pointerId)) {
        resizeHandle.value.releasePointerCapture(event.pointerId);
    }

    resizeState.value = null;
}

function cleanupPointerInteractions(): void {
    if (dragState.value && dragHandle.value?.hasPointerCapture(dragState.value.pointerId)) {
        dragHandle.value.releasePointerCapture(dragState.value.pointerId);
    }

    if (resizeState.value && resizeHandle.value?.hasPointerCapture(resizeState.value.pointerId)) {
        resizeHandle.value.releasePointerCapture(resizeState.value.pointerId);
    }

    dragState.value = null;
    resizeState.value = null;
}

onBeforeUnmount(() => {
    cleanupPointerInteractions();
});
</script>

<template>
    <article
        class='absolute z-20 flex flex-col overflow-hidden rounded-xl border border-violet-200 bg-white shadow-lg shadow-violet-950/10'
        :style='editorStyle'
        aria-label='Mini text editor'
    >
        <header
            ref='dragHandle'
            class='flex shrink-0 touch-none select-none items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2'
            :class='canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed opacity-60"'
            title='Drag text editor'
            @pointerdown.stop='startDrag'
            @pointermove='dragEditor'
            @pointerup='stopDrag'
            @pointercancel='stopDrag'
        >
            <div class='flex items-center gap-2'>
                <span class='grid size-6 place-items-center rounded-md bg-violet-100 text-xs font-black text-violet-700'>
                    T
                </span>

                <span class='text-xs font-bold uppercase tracking-[0.14em] text-slate-600'>
                    Text editor
                </span>
            </div>

            <button
                type='button'
                class='grid size-6 place-items-center rounded-md text-sm font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40'
                :disabled='!canEdit'
                aria-label='Delete text editor'
                title='Delete text editor'
                @pointerdown.stop
                @click.stop='emit("delete", editor.id)'
            >
                ×
            </button>
        </header>

        <div class='min-h-0 flex-1 overflow-auto px-4 py-3'>
            <p class='text-sm font-semibold text-slate-500'>
                Rich text editor is ready.
            </p>

            <p class='mt-2 text-sm leading-6 text-slate-500'>
                Toolbar dan editing content akan ditambahkan pada langkah berikutnya.
            </p>
        </div>

        <button
            ref='resizeHandle'
            type='button'
            class='flex h-5 shrink-0 touch-none items-center justify-center border-t border-slate-100 text-xs text-slate-400 transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40'
            :class='canEdit ? "cursor-ns-resize" : "cursor-not-allowed"'
            :disabled='!canEdit'
            aria-label='Resize text editor height'
            title='Resize text editor height'
            @pointerdown.stop='startResize'
            @pointermove='resizeEditor'
            @pointerup='stopResize'
            @pointercancel='stopResize'
        >
            ↕
        </button>
    </article>
</template>
