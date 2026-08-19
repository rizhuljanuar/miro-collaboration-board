<script setup lang="ts">
import type {
  InlineTextFormat,
  TextEditorAlignment,
  TextEditorHeadingTag,
  TextEditorInsertAction,
  TextEditorListType,
} from '@/types/mini-text-editor';

interface ToolbarAction {
  id: string;
  label: string;
  icon: string;
  format?: InlineTextFormat;
  heading?: TextEditorHeadingTag;
  alignment?: TextEditorAlignment;
  list?: TextEditorListType;
  insert?: TextEditorInsertAction;
}

interface ToolbarGroup {
  label: string;
  actions: ToolbarAction[];
}

defineProps<{
  canEdit: boolean;
}>();

const emit = defineEmits<{
  format: [format: InlineTextFormat];
  heading: [tag: TextEditorHeadingTag];
  alignment: [alignment: TextEditorAlignment];
  list: [listType: TextEditorListType];
  insert: [action: TextEditorInsertAction];
}>();

const toolbarGroups: ToolbarGroup[] = [
  {
    label: 'Text style',
    actions: [
      {
        id: 'bold',
        label: 'Bold',
        icon: 'B',
        format: 'bold',
      },
      {
        id: 'italic',
        label: 'Italic',
        icon: 'I',
        format: 'italic',
      },
      {
        id: 'underline',
        label: 'Underline',
        icon: 'U',
        format: 'underline',
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
        heading: 'H1',
      },
      {
        id: 'heading-2',
        label: 'Heading 2',
        icon: 'H2',
        heading: 'H2',
      },
      {
        id: 'heading-3',
        label: 'Heading 3',
        icon: 'H3',
        heading: 'H3',
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
        alignment: 'left',
      },
      {
        id: 'align-center',
        label: 'Align center',
        icon: '≣',
        alignment: 'center',
      },
      {
        id: 'align-right',
        label: 'Align right',
        icon: '☷',
        alignment: 'right',
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
        list: 'unordered',
      },
      {
        id: 'link',
        label: 'Insert link',
        icon: '↗',
        insert: 'link',
      },
      {
        id: 'image',
        label: 'Insert image',
        icon: '▧',
        insert: 'image',
      },
    ],
  },
];

function applyFormat(format?: InlineTextFormat): void {
  if (!format) {
    return;
  }

  emit('format', format);
}

function applyHeading(tag?: TextEditorHeadingTag): void {
  if (!tag) {
    return;
  }

  emit('heading', tag);
}

function applyAlignment(alignment?: TextEditorAlignment): void {
  if (!alignment) {
    return;
  }

  emit('alignment', alignment);
}

function applyList(listType?: TextEditorListType): void {
  if (!listType) {
    return;
  }

  emit('list', listType);
}

function applyInsert(action?: TextEditorInsertAction): void {
  if (!action) {
    return;
  }

  emit('insert', action);
}
</script>

<template>
  <div
    class="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-slate-200 bg-slate-50 px-2 py-2"
    role="toolbar"
    aria-label="Rich text editor toolbar"
  >
    <template v-for="(group, groupIndex) in toolbarGroups" :key="group.label">
      <div class="flex shrink-0 items-center gap-1" :aria-label="group.label">
        <button
          v-for="action in group.actions"
          :key="action.id"
          type="button"
          class="grid size-8 place-items-center rounded-md text-xs font-bold transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-40"
          :class="
            action.format || action.heading || action.alignment || action.list || action.insert
              ? 'text-slate-700 hover:bg-violet-100 hover:text-violet-800 focus:ring-violet-200'
              : 'text-slate-400'
          "
          :disabled="
            !canEdit ||
            (!action.format &&
              !action.heading &&
              !action.alignment &&
              !action.list &&
              !action.insert)
          "
          :title="
            action.format || action.heading || action.alignment || action.list || action.insert
              ? action.label
              : `${action.label} will be implemented in a later step`
          "
          @pointerdown.prevent
          @click="
            applyFormat(action.format);
            applyHeading(action.heading);
            applyAlignment(action.alignment);
            applyList(action.list);
            applyInsert(action.insert);
          "
        >
          <span
            :class="{
              'italic font-serif': action.id === 'italic',
              underline: action.id === 'underline',
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
