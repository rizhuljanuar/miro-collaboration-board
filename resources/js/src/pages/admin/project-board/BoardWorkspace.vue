<script setup lang="ts">
import type { BoardTool } from '@/types/board';
import type { Project } from '@/types/project';

defineProps<{
  project: Project;
  selectedTool: BoardTool;
  toolMessage: string;
  workspaceCursorClass: string;
}>();
</script>

<template>
  <div class="relative min-h-0 flex-1 overflow-auto bg-slate-100 p-4 md:p-6">
    <div
      class="relative min-h-[620px] min-w-[760px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      :class="workspaceCursorClass"
      :data-board-tool="selectedTool"
      style="
        background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
        background-size: 24px 24px;
      "
    >
      <slot name="overlay" />

      <div
        class="absolute left-6 top-6 z-10 max-w-sm rounded-2xl border border-blue-100 bg-white/95 p-5 shadow-lg shadow-blue-950/5 backdrop-blur"
      >
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          {{ project.role ?? 'member' }} workspace
        </p>

        <h2 class="mt-2 text-xl font-bold text-slate-950">
          {{ project.name }}
        </h2>

        <p class="mt-2 text-sm leading-6 text-slate-600">
          {{
            project.description ||
            'Mulai tambahkan sticky note, text editor, atau drawing ke board ini.'
          }}
        </p>
      </div>

      <div
        class="absolute inset-0 grid place-items-center px-6 pt-36 text-center"
        aria-label="Board workspace"
      >
        <div class="max-w-md">
          <div
            class="mx-auto grid size-16 place-items-center rounded-2xl bg-blue-100 text-3xl font-bold text-blue-700"
          >
            +
          </div>

          <h2 class="mt-5 text-2xl font-bold tracking-tight text-slate-950">
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
