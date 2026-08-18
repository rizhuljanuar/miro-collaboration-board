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
  collaboratorsCount: number;
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
    class="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 shadow-sm"
    role="toolbar"
    aria-label="Board tools"
  >
    <div class="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
      <button
        v-for="tool in tools"
        :key="tool.id"
        type="button"
        class="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-45"
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

        <span class="hidden lg:inline">
          {{ tool.label }}
        </span>

        <span class="lg:hidden">
          {{ tool.shortLabel }}
        </span>
      </button>
    </div>

    <div class="hidden h-7 w-px bg-slate-200 sm:block"></div>

    <BoardHistoryControls
      :can-undo="canUndo"
      :can-redo="canRedo"
      @undo="emit('undo')"
      @redo="emit('redo')"
    />

    <div class="ml-auto flex items-center gap-2">
      <span
        v-if="canEdit"
        class="hidden rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex"
      >
        Edit mode
      </span>

      <span
        v-else
        class="hidden rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 sm:inline-flex"
      >
        View only
      </span>

      <span class="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
        {{ collaboratorsCount }}
        collaborator{{ collaboratorsCount === 1 ? '' : 's' }}
      </span>
    </div>
  </div>
</template>
