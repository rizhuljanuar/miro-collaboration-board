<script setup lang="ts">
interface ToolbarGroup {
  label: string;
  actions: Array<{
    id: string;
    label: string;
    icon: string;
  }>;
}

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
          disabled
          class="grid size-8 place-items-center rounded-md text-xs font-bold text-slate-400 transition disabled:cursor-not-allowed"
          :aria-label="`${action.label} will be available in the next step`"
          :title="`${action.label} will be implemented in the next step`"
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
