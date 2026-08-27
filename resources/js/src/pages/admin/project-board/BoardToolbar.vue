<script setup lang="ts">
import type { BoardTool } from '@/types/board';

import BoardHistoryControls from '@/pages/admin/project-board/BoardHistoryControls.vue';

interface ToolbarItem {
  id: BoardTool;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
}

const props = defineProps<{
  selectedTool: BoardTool;
  canEdit: boolean;
  activeUsersCount: number;
  canUndo: boolean;
  canRedo: boolean;
}>();

const emit = defineEmits<{
  'update:selectedTool': [tool: BoardTool];
  undo: [];
  redo: [];
}>();

const tools: ToolbarItem[] = [
  {
    id: 'cursor',
    label: 'Cursor',
    shortLabel: 'Cursor',
    description: 'Pilih, pindahkan, atau berinteraksi dengan item board.',
    icon: '↖',
  },
  {
    id: 'sticky-note',
    label: 'Sticky note',
    shortLabel: 'Sticky',
    description: 'Tambahkan sticky note ke workspace.',
    icon: '▣',
  },
  {
    id: 'text',
    label: 'Text editor',
    shortLabel: 'Text',
    description: 'Tambahkan mini rich text editor ke workspace.',
    icon: 'T',
  },
  {
    id: 'draw',
    label: 'Draw',
    shortLabel: 'Draw',
    description: 'Aktifkan drawing mode pada workspace.',
    icon: '✎',
  },
];

function selectTool(tool: BoardTool): void {
  if (!props.canEdit && tool !== 'cursor') {
    return;
  }

  emit('update:selectedTool', tool);
}
</script>

<template>
  <div
    class="flex min-w-0 flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 shadow-sm sm:px-4"
    role="toolbar"
    aria-label="Board tools"
  >
    <div
      class="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1"
      aria-label="Board interaction tools"
    >
      <button
        v-for="tool in tools"
        :key="tool.id"
        type="button"
        class="inline-flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-45 sm:px-3"
        :class="
          selectedTool === tool.id
            ? 'bg-slate-900 text-white shadow-sm focus:ring-slate-200'
            : 'text-slate-600 hover:bg-white hover:text-slate-950 focus:ring-blue-100'
        "
        :disabled="!canEdit && tool.id !== 'cursor'"
        :aria-pressed="selectedTool === tool.id"
        :title="
          !canEdit && tool.id !== 'cursor' ? 'Viewer hanya dapat melihat board.' : tool.description
        "
        @click="selectTool(tool.id)"
      >
        <span class="text-base leading-none" aria-hidden="true">
          {{ tool.icon }}
        </span>

        <span class="hidden md:inline">
          {{ tool.label }}
        </span>

        <span class="md:hidden">
          {{ tool.shortLabel }}
        </span>
      </button>
    </div>

    <div class="hidden h-7 w-px bg-slate-200 lg:block"></div>

    <BoardHistoryControls
      :can-undo="canUndo"
      :can-redo="canRedo"
      @undo="emit('undo')"
      @redo="emit('redo')"
    />

    <div class="ml-auto hidden items-center gap-2 lg:flex">
      <span
        v-if="canEdit"
        class="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
      >
        Edit mode
      </span>

      <span
        v-else
        class="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700"
      >
        View only
      </span>

      <span class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
{{ activeUsersCount }}
active user{{ activeUsersCount === 1 ? '' : 's' }}
      </span>
    </div>

    <span
      class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 lg:hidden"
    >
{{ activeUsersCount }}
active user{{ activeUsersCount === 1 ? '' : 's' }}
    </span>
  </div>
</template>
