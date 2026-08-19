<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';

import type { MiniTextEditor, TextEditorHeadingTag } from '@/types/mini-text-editor';
import type { BoardPosition } from '@/types/sticky-note';
import MiniTextEditorToolbar from '@/pages/admin/project-board/MiniTextEditorToolbar.vue';
import type { InlineTextFormat } from '@/types/mini-text-editor';

const props = defineProps<{
  editor: MiniTextEditor;
  canEdit: boolean;
}>();

const emit = defineEmits<{
  move: [payload: { id: string; position: BoardPosition }];
  resize: [payload: { id: string; height: number }];
  'update-content': [payload: { id: string; contentHtml: string }];
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
const editorContent = ref<HTMLDivElement | null>(null);

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
        Math.round(currentDrag.startPosition.x + (event.clientX - currentDrag.startClientX)),
      ),
      y: Math.max(
        0,
        Math.round(currentDrag.startPosition.y + (event.clientY - currentDrag.startClientY)),
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
    height: Math.round(currentResize.startHeight + (event.clientY - currentResize.startClientY)),
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

function selectionBelongsToEditor(): boolean {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0 || !editorContent.value) {
    return false;
  }

  const anchorNode = selection.anchorNode;

  return anchorNode !== null && editorContent.value.contains(anchorNode);
}

function emitEditorContent(): void {
  if (!editorContent.value) {
    return;
  }

  emit('update-content', {
    id: props.editor.id,
    contentHtml: editorContent.value.innerHTML,
  });
}

function handleEditorInput(): void {
  if (!props.canEdit) {
    return;
  }

  emitEditorContent();
}

function applyInlineFormat(format: InlineTextFormat): void {
  if (!props.canEdit || !selectionBelongsToEditor()) {
    return;
  }

  const commandApplied = document.execCommand(format);

  if (commandApplied) {
    emitEditorContent();
  }
}

function applyHeading(tag: TextEditorHeadingTag): void {
  if (!props.canEdit || !selectionBelongsToEditor()) {
    return;
  }

  const commandApplied = document.execCommand('formatBlock', false, tag);

  if (commandApplied) {
    emitEditorContent();
  }
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
    class="absolute z-20 flex flex-col overflow-hidden rounded-xl border border-violet-200 bg-white shadow-lg shadow-violet-950/10"
    :style="editorStyle"
    aria-label="Mini text editor"
  >
    <header
      ref="dragHandle"
      class="flex shrink-0 touch-none select-none items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-3 py-2"
      :class="canEdit ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed opacity-60'"
      title="Drag text editor"
      @pointerdown.stop="startDrag"
      @pointermove="dragEditor"
      @pointerup="stopDrag"
      @pointercancel="stopDrag"
    >
      <div class="flex items-center gap-2">
        <span
          class="grid size-6 place-items-center rounded-md bg-violet-100 text-xs font-black text-violet-700"
        >
          T
        </span>

        <span class="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
          Text editor
        </span>
      </div>

      <button
        type="button"
        class="grid size-6 place-items-center rounded-md text-sm font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        :disabled="!canEdit"
        aria-label="Delete text editor"
        title="Delete text editor"
        @pointerdown.stop
        @click.stop="emit('delete', editor.id)"
      >
        ×
      </button>
    </header>

    <MiniTextEditorToolbar
      :can-edit="canEdit"
      @format="applyInlineFormat"
      @heading="applyHeading"
    />
    <div class="min-h-0 flex-1 overflow-auto px-4 py-3">
      <div
        ref="editorContent"
        role="textbox"
        aria-multiline="true"
        aria-label="Mini rich text editor content"
        :contenteditable="canEdit"
        class="min-h-full whitespace-pre-wrap break-words text-sm leading-6 text-slate-900 outline-none empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[&quot;Mulai_tulis_ide_Anda...&quot;]"
        :class="canEdit ? 'cursor-text' : 'cursor-default'"
        @pointerdown.stop
        @input="handleEditorInput"
      ></div>

      <p v-if="!canEdit" class="mt-3 text-xs leading-5 text-slate-500">
        Editor ini hanya dapat dilihat karena Anda tidak memiliki izin edit.
      </p>
    </div>

    <button
      ref="resizeHandle"
      type="button"
      class="flex h-5 shrink-0 touch-none items-center justify-center border-t border-slate-100 text-xs text-slate-400 transition hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
      :class="canEdit ? 'cursor-ns-resize' : 'cursor-not-allowed'"
      :disabled="!canEdit"
      aria-label="Resize text editor height"
      title="Resize text editor height"
      @pointerdown.stop="startResize"
      @pointermove="resizeEditor"
      @pointerup="stopResize"
      @pointercancel="stopResize"
    >
      ↕
    </button>
  </article>
</template>
