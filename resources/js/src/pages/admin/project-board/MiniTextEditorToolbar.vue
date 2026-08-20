<script setup lang="ts">
import type { TextEditorToolbarAction } from '@/types/mini-text-editor';

interface ToolbarAction {
  id: TextEditorToolbarAction;
  label: string;
  icon: string;
}

interface ToolbarGroup {
  label: string;
  actions: ToolbarAction[];
}

defineProps<{
  canEdit: boolean;
}>();

const emit = defineEmits<{
  action: [action: TextEditorToolbarAction];
}>();

const toolbarGroups: ToolbarGroup[] = [
  {
    label: 'Text style',
    actions: [
      {
        id: 'bold',
        label: 'Bold',
        icon: 'B',
      },
      {
        id: 'italic',
        label: 'Italic',
        icon: 'I',
      },
      {
        id: 'underline',
        label: 'Underline',
        icon: 'U',
      },
      {
        id: 'highlight',
        label: 'Highlight',
        icon: 'H',
      },
    ],
  },
  {
    label: 'Heading',
    actions: [
      {
        id: 'heading-1',
        label: 'Heading 1',
        icon: 'H1',
      },
      {
        id: 'heading-2',
        label: 'Heading 2',
        icon: 'H2',
      },
      {
        id: 'heading-3',
        label: 'Heading 3',
        icon: 'H3',
      },
    ],
  },
  {
    label: 'Alignment',
    actions: [
      {
        id: 'align-left',
        label: 'Align left',
        icon: '≡',
      },
      {
        id: 'align-center',
        label: 'Align center',
        icon: '≣',
      },
      {
        id: 'align-right',
        label: 'Align right',
        icon: '☷',
      },
    ],
  },
  {
    label: 'Insert content',
    actions: [
      {
        id: 'unordered-list',
        label: 'Bullet list',
        icon: '•',
      },
      {
        id: 'link',
        label: 'Insert link',
        icon: '↗',
      },
      {
        id: 'image',
        label: 'Insert image',
        icon: '▧',
      },
    ],
  },
];

function getActionButton(target: EventTarget | null): HTMLButtonElement | null {
  if (!(target instanceof Element)) {
    return null;
  }

  const button = target.closest<HTMLButtonElement>('button[data-editor-action]');

  return button;
}

function handleToolbarPointerDown(event: PointerEvent): void {
  const button = getActionButton(event.target);

  if (!button || button.disabled) {
    return;
  }

  // Menjaga selection text agar tidak hilang saat toolbar diklik.
  event.preventDefault();
}

function handleToolbarClick(event: MouseEvent): void {
  const button = getActionButton(event.target);

  if (!button || button.disabled) {
    return;
  }

  const action = button.dataset.editorAction as TextEditorToolbarAction | undefined;

  if (!action) {
    return;
  }

  emit('action', action);
}
</script>

<template>
  <div
    class="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 px-2 py-2"
    role="toolbar"
    aria-label="Rich text editor toolbar"
    @pointerdown="handleToolbarPointerDown"
    @click="handleToolbarClick"
  >
    <template v-for="(group, groupIndex) in toolbarGroups" :key="group.label">
      <div class="flex shrink-0 items-center gap-1" :aria-label="group.label">
        <button
          v-for="action in group.actions"
          :key="action.id"
          type="button"
          :data-editor-action="action.id"
          :disabled="!canEdit"
          class="grid size-8 place-items-center rounded-md text-xs font-bold text-slate-700 transition hover:bg-violet-100 hover:text-violet-800 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
          :aria-label="action.label"
          :title="action.label"
        >
          <span
            :class="{
              'italic font-serif': action.id === 'italic',
              underline: action.id === 'underline',
              'rounded-sm bg-yellow-200 px-1 text-slate-900': action.id === 'highlight',
            }"
            aria-hidden="true"
          >
            {{ action.icon }}
          </span>
        </button>
      </div>

      <div
        v-if="groupIndex < toolbarGroups.length - 1"
        class="mx-1 h-5 w-px shrink-0 bg-slate-200"
        aria-hidden="true"
      ></div>
    </template>
  </div>
</template>
