<script setup lang="ts">
import { ref } from 'vue';

import type { BoardTool } from '@/types/board';
import type { BoardPosition } from '@/types/sticky-note';
import type { Project } from '@/types/project';

const props = defineProps<{
  project: Project;
  selectedTool: BoardTool;
  toolMessage: string;
  workspaceCursorClass: string;
  canEdit: boolean;
}>();

const emit = defineEmits<{
  'create-sticky-note': [position: BoardPosition];
      'create-text-editor': [position: BoardPosition];
}>();

const boardSurface = ref<HTMLDivElement | null>(null);

function handleWorkspacePointerDown(event: PointerEvent): void {
  const surface = boardSurface.value;

  if (
    !props.canEdit ||
    event.button !== 0 ||
    !surface ||
    event.target !== surface
  ) {
    return;
  }

  const bounds = surface.getBoundingClientRect();

    const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
    };

    if (props.selectedTool === 'sticky-note') {
        emit('create-sticky-note', position);

        return;
    }

    if (props.selectedTool === 'text') {
        emit('create-text-editor', position);
    }
}
</script>

<template>
  <div class="relative min-h-0 flex-1 overflow-auto bg-slate-100 p-2 sm:p-4 md:p-6">
    <div
      ref="boardSurface"
      class="relative min-h-[560px] min-w-[640px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:min-h-[620px] sm:min-w-[720px] sm:rounded-2xl lg:min-w-[960px]"
      @pointerdown="handleWorkspacePointerDown"
      :class="workspaceCursorClass"
      :data-board-tool="selectedTool"
      style="
        background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
        background-size: 24px 24px;
      "
    >
      <slot name="overlay" />

      <div
        class="pointer-events-none absolute left-3 top-3 z-10 max-w-[calc(100%-1.5rem)] rounded-xl border border-blue-100 bg-white/95 p-4 shadow-lg shadow-blue-950/5 backdrop-blur sm:left-6 sm:top-6 sm:max-w-sm sm:rounded-2xl sm:p-5"
      >
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          {{ project.role ?? 'member' }} workspace
        </p>

        <h2 class="mt-2 line-clamp-2 text-lg font-bold text-slate-950 sm:text-xl">
          {{ project.name }}
        </h2>

        <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
          {{
            project.description ||
            'Mulai tambahkan sticky note, text editor, atau drawing ke board ini.'
          }}
        </p>
      </div>

      <div
        class="pointer-events-none absolute inset-0 grid place-items-center px-6 pb-6 pt-48 text-center sm:px-10 sm:pt-40"
        aria-label="Board workspace"
      >
        <div class="max-w-md">
          <div
            class="mx-auto grid size-14 place-items-center rounded-2xl bg-blue-100 text-2xl font-bold text-blue-700 sm:size-16 sm:text-3xl"
          >
            +
          </div>

          <h2 class="mt-5 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
            Your board workspace is ready
          </h2>

          <p class="mt-3 leading-7 text-slate-600">
            {{ toolMessage }}
          </p>

          <p class="mt-3 text-sm leading-6 text-slate-500">
            Interaksi item akan ditambahkan bertahap pada fase sticky notes, mini text editor, dan
            canvas drawing.
          </p>

          <span
            class="mt-5 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold capitalize text-slate-700"
            aria-live="polite"
          >
            Active tool: {{ selectedTool.replace('-', ' ') }}
          </span>
        </div>
      </div>

      <slot />
    </div>
  </div>
</template>
