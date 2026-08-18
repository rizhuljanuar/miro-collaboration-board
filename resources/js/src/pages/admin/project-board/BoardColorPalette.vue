<script setup lang="ts">
import { STICKY_NOTE_COLOR_OPTIONS, type StickyNoteColor } from '@/types/board';

const props = defineProps<{
  modelValue: StickyNoteColor;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [color: StickyNoteColor];
}>();

function selectColor(color: StickyNoteColor): void {
  if (props.disabled) {
    return;
  }

  emit('update:modelValue', color);
}
</script>

<template>
  <div
    class="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg shadow-slate-950/10 backdrop-blur"
    role="radiogroup"
    aria-label="Sticky note color palette"
  >
    <p class="px-1 pb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
      Sticky color
    </p>

    <div class="flex flex-col gap-2">
      <button
        v-for="color in STICKY_NOTE_COLOR_OPTIONS"
        :key="color.value"
        type="button"
        class="grid size-9 place-items-center rounded-xl transition focus:outline-none focus:ring-4 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-45"
        :class="[
          color.swatchClass,
          modelValue === color.value ? 'ring-2 ring-slate-950 ring-offset-2' : 'hover:scale-110',
        ]"
        :disabled="disabled"
        :aria-checked="modelValue === color.value"
        :title="`${color.label} sticky note color`"
        role="radio"
        @click="selectColor(color.value)"
      >
        <span
          v-if="modelValue === color.value"
          class="text-xs font-black text-slate-950"
          aria-hidden="true"
        >
          ✓
        </span>

        <span class="sr-only">
          {{ color.label }}
        </span>
      </button>
    </div>
  </div>
</template>
