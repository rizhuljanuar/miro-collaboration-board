<script setup lang='ts'>
import { computed, onBeforeUnmount, ref } from 'vue';

import { STICKY_NOTE_COLOR_OPTIONS } from '@/types/board';
import type { BoardPosition, BoardSize, StickyNote } from '@/types/sticky-note';

const props = defineProps<{
    stickyNote: StickyNote;
    draggable: boolean;
    resizable: boolean;
}>();

const emit = defineEmits<{
    move: [payload: { id: string; position: BoardPosition }];
    resize: [payload: { id: string; size: BoardSize }];
    delete: [stickyNoteId: string];
}>();

interface DragState {
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPosition: BoardPosition;
}

interface ResizeState {
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startSize: BoardSize;
}

const dragHandle = ref<HTMLElement | null>(null);
const resizeHandle = ref<HTMLElement | null>(null);

const dragState = ref<DragState | null>(null);
const resizeState = ref<ResizeState | null>(null);

const stickyNoteStyle = computed(() => {
    return {
        left: `${props.stickyNote.position.x}px`,
        top: `${props.stickyNote.position.y}px`,
        width: `${props.stickyNote.size.width}px`,
        height: `${props.stickyNote.size.height}px`,
    };
});

const stickyNoteColorClass = computed(() => {
    return (
        STICKY_NOTE_COLOR_OPTIONS.find((color) => {
            return color.value === props.stickyNote.color;
        })?.swatchClass ?? 'bg-yellow-300'
    );
});

function startDrag(event: PointerEvent): void {
    if (
        !props.draggable ||
        event.button !== 0 ||
        resizeState.value !== null
    ) {
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
            ...props.stickyNote.position,
        },
    };

    handle.setPointerCapture(event.pointerId);
}

function dragStickyNote(event: PointerEvent): void {
    const currentDrag = dragState.value;

    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
        return;
    }

    emit('move', {
        id: props.stickyNote.id,
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
    const currentDrag = dragState.value;

    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
        return;
    }

    const handle = dragHandle.value;

    if (handle?.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
    }

    dragState.value = null;
}

function startResize(event: PointerEvent): void {
    if (
        !props.resizable ||
        event.button !== 0 ||
        dragState.value !== null
    ) {
        return;
    }

    const handle = event.currentTarget;

    if (!(handle instanceof HTMLElement)) {
        return;
    }

    event.preventDefault();

    resizeState.value = {
        pointerId: event.pointerId,
        startClientX: event.clientX,
        startClientY: event.clientY,
        startSize: {
            ...props.stickyNote.size,
        },
    };

    handle.setPointerCapture(event.pointerId);
}

function resizeStickyNote(event: PointerEvent): void {
    const currentResize = resizeState.value;

    if (!currentResize || currentResize.pointerId !== event.pointerId) {
        return;
    }

    emit('resize', {
        id: props.stickyNote.id,
        size: {
            width: Math.round(
                currentResize.startSize.width + (event.clientX - currentResize.startClientX),
            ),
            height: Math.round(
                currentResize.startSize.height + (event.clientY - currentResize.startClientY),
            ),
        },
    });
}

function stopResize(event: PointerEvent): void {
    const currentResize = resizeState.value;

    if (!currentResize || currentResize.pointerId !== event.pointerId) {
        return;
    }

    const handle = resizeHandle.value;

    if (handle?.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
    }

    resizeState.value = null;
}

function handleLostPointerCapture(): void {
    dragState.value = null;
    resizeState.value = null;
}

function deleteStickyNote(): void {
    if (!props.draggable) {
        return;
    }

    emit('delete', props.stickyNote.id);
}

onBeforeUnmount(() => {
    dragState.value = null;
    resizeState.value = null;
});
</script>

<template>
    <article
        class='absolute z-20 flex overflow-hidden rounded-xl border border-slate-950/10 shadow-lg shadow-slate-950/15'
        :class='stickyNoteColorClass'
        :style='stickyNoteStyle'
        :aria-label='`Sticky note: ${stickyNote.body || "empty"}`'
    >
        <div class='flex min-h-0 flex-1 flex-col'>
            <header
                ref='dragHandle'
                class='flex shrink-0 touch-none select-none items-center justify-between gap-2 border-b border-slate-950/10 px-3 py-2'
                :class='
                    draggable
                        ? "cursor-grab active:cursor-grabbing"
                        : "cursor-not-allowed opacity-60"
                '
                title='Drag sticky note'
                @pointerdown.stop='startDrag'
                @pointermove='dragStickyNote'
                @pointerup='stopDrag'
                @pointercancel='stopDrag'
                @lostpointercapture='handleLostPointerCapture'
            >
                <span class='text-xs font-bold uppercase tracking-[0.14em] text-slate-900/65'>
                    Sticky note
                </span>

                <button
                    type='button'
                    class='grid size-6 place-items-center rounded-md text-sm font-bold text-slate-900/70 transition hover:bg-slate-950/10 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/30 disabled:cursor-not-allowed disabled:opacity-40'
                    aria-label='Delete sticky note'
                    title='Delete sticky note'
                    :disabled='!draggable'
                    @pointerdown.stop
                    @click.stop='deleteStickyNote'
                >
                    ×
                </button>
            </header>

            <div class='min-h-0 flex-1 px-3 py-3'>
                <p
                    v-if='stickyNote.body'
                    class='whitespace-pre-wrap break-words text-sm leading-6 text-slate-950'
                >
                    {{ stickyNote.body }}
                </p>

                <p v-else class='text-sm italic text-slate-900/55'>
                    Tulis ide Anda di sini...
                </p>
            </div>
        </div>

        <button
            ref='resizeHandle'
            type='button'
            class='absolute bottom-1 right-1 grid size-7 touch-none place-items-center rounded-md text-slate-950/55 transition hover:bg-slate-950/10 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/30 disabled:cursor-not-allowed disabled:opacity-40'
            :class='resizable ? "cursor-nwse-resize" : "cursor-not-allowed"'
            :disabled='!resizable'
            aria-label='Resize sticky note'
            title='Resize sticky note'
            @pointerdown.stop='startResize'
            @pointermove='resizeStickyNote'
            @pointerup='stopResize'
            @pointercancel='stopResize'
            @lostpointercapture='handleLostPointerCapture'
        >
            ↘
        </button>
    </article>
</template>
